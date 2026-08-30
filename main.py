"""
LearnFlow AI - Member 3 Main API
Database + User System + Knowledge Memory + Recommendation
Follows team folder structure from screenshot
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import os, sys

# Make sure imports work
sys.path.append(os.path.dirname(__file__))

from database.connection import SessionLocal, engine, get_db, Base
from database.schemas.models import (
    User, Topic, TopicPrerequisite, UserTopicProgress,
    WatchHistory, Note, Flashcard, Quiz, QuizAttempt
)
from database.schemas.schemas import (
    UserCreate, UserLogin, UserResponse, Token,
    TopicResponse, ProgressUpdate, ProgressResponse,
    HistoryCreate, HistoryResponse,
    NoteCreate, NoteResponse,
    FlashcardCreate, FlashcardResponse, FlashcardReview,
    QuizCreate, QuizResponse, QuizAttemptCreate, QuizAttemptResponse
)
from auth.providers.jwt_provider import create_access_token, SECRET_KEY, ALGORITHM
from auth.middleware.auth_middleware import get_current_user
from auth.utils.password import get_password_hash, verify_password
from recommendation.engine.knowledge_graph import KNOWLEDGE_GRAPH_TOPICS, KNOWLEDGE_GRAPH_EDGES, get_next_topics
from recommendation.engine.recommender import get_recommendations, get_weak_areas, get_learning_path, get_user_progress_map
from shared.utils.helpers import update_mastery_after_quiz, mastery_to_status
from shared.constants.app_constants import TOPIC_TIME_ESTIMATES
from jose import jwt, JWTError

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LearnFlow AI - Member 3: Database & Recommendation",
    description="Follows required folder structure: auth/, database/, recommendation/, shared/, docs/",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== AUTH ====================

@app.post("/auth/signup", response_model=Token, tags=["Auth - auth/"])
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pw,
        full_name=user_data.full_name,
        learning_level=user_data.learning_level
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}

@app.post("/auth/login", response_model=Token, tags=["Auth - auth/"])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.post("/auth/login-json", response_model=Token, tags=["Auth - auth/"])
def login_json(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect credentials")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.get("/auth/me", response_model=UserResponse, tags=["Auth - auth/"])
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ==================== TOPICS & KNOWLEDGE GRAPH ====================

@app.get("/topics", response_model=List[TopicResponse], tags=["Knowledge Graph - database/"])
def list_topics(db: Session = Depends(get_db)):
    return db.query(Topic).all()

@app.get("/knowledge-graph", tags=["Knowledge Graph - recommendation/engine/"])
def get_knowledge_graph(db: Session = Depends(get_db)):
    topics = db.query(Topic).all()
    edges = db.query(TopicPrerequisite).all()
    
    graph = {}
    for topic in topics:
        prereqs = db.query(TopicPrerequisite).filter(TopicPrerequisite.topic_id == topic.id).all()
        prereq_names = []
        for p in prereqs:
            prereq_topic = db.query(Topic).filter(Topic.id == p.prerequisite_id).first()
            if prereq_topic:
                prereq_names.append(prereq_topic.name)
        
        graph[topic.name] = {
            "id": topic.id,
            "slug": topic.slug,
            "category": topic.category,
            "difficulty": topic.difficulty,
            "prerequisites": prereq_names,
            "next_topics": get_next_topics(topic.name),
            "estimated_time": TOPIC_TIME_ESTIMATES.get(topic.name, "10 hours")
        }
    
    return {"nodes": len(topics), "edges": len(edges), "graph": graph}

@app.get("/knowledge-graph/{topic_name}/path", tags=["Knowledge Graph - recommendation/engine/"])
def get_path_to_topic(topic_name: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.name == topic_name).first()
    if not topic:
        topic = db.query(Topic).filter(Topic.slug == topic_name).first()
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")
        topic_name = topic.name
    
    path = get_learning_path(db, current_user.id, topic_name)
    return {"target": topic_name, "total_steps": len(path), "estimated_total_time": f"{len(path)*8} hours", "path": path}

# ==================== PROGRESS & MEMORY ====================

@app.post("/progress/update", response_model=ProgressResponse, tags=["Memory - database/schemas/"])
def update_progress(data: ProgressUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.name == data.topic_name).first()
    if not topic:
        raise HTTPException(status_code=404, detail=f"Topic '{data.topic_name}' not found")
    
    progress = db.query(UserTopicProgress).filter(
        UserTopicProgress.user_id == current_user.id,
        UserTopicProgress.topic_id == topic.id
    ).first()
    
    if not progress:
        progress = UserTopicProgress(
            user_id=current_user.id,
            topic_id=topic.id,
            mastery_score=data.mastery_score if data.mastery_score is not None else 10.0,
            status="learning",
            times_studied=1,
            total_time_minutes=data.time_spent_minutes
        )
        db.add(progress)
    else:
        if data.mastery_score is not None:
            progress.mastery_score = data.mastery_score
        elif data.is_correct is not None:
            progress.mastery_score = update_mastery_after_quiz(progress.mastery_score, data.is_correct)
        else:
            progress.mastery_score = min(100, progress.mastery_score + 2)
        
        progress.times_studied += 1
        progress.total_time_minutes += data.time_spent_minutes
        progress.last_studied = datetime.utcnow()
        progress.status = mastery_to_status(progress.mastery_score, progress.times_studied)
    
    db.commit()
    db.refresh(progress)
    return progress

@app.get("/progress", response_model=List[ProgressResponse], tags=["Memory - database/schemas/"])
def get_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(UserTopicProgress).filter(UserTopicProgress.user_id == current_user.id).all()

@app.get("/memory/dashboard", tags=["Memory - database/schemas/"])
def get_memory_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    all_progress = db.query(UserTopicProgress).filter(UserTopicProgress.user_id == current_user.id).all()
    
    learned = [p for p in all_progress if p.mastery_score >= 70]
    weak = [p for p in all_progress if p.mastery_score < 50 and p.times_studied > 0]
    in_progress = [p for p in all_progress if 30 <= p.mastery_score < 70]
    
    total_time = sum([p.total_time_minutes for p in all_progress])
    avg_mastery = sum([p.mastery_score for p in all_progress]) / len(all_progress) if all_progress else 0
    
    return {
        "learned_topics": learned,
        "weak_areas": weak,
        "in_progress": in_progress,
        "total_study_time": total_time,
        "overall_mastery": round(avg_mastery, 1),
        "streak": len(all_progress)
    }

# ==================== HISTORY, NOTES, FLASHCARDS, QUIZZES ====================

@app.post("/history", response_model=HistoryResponse, tags=["Tracking - database/schemas/"])
def add_history(data: HistoryCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entry = WatchHistory(
        user_id=current_user.id,
        content_type=data.content_type,
        content_url=data.content_url,
        content_id=data.content_id,
        title=data.title,
        duration_seconds=data.duration_seconds,
        watched_seconds=data.watched_seconds,
        completed=data.completed,
        topics_detected=data.topics_detected,
        summary=data.summary
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    
    for topic_name in data.topics_detected:
        topic = db.query(Topic).filter(Topic.name == topic_name).first()
        if topic:
            prog = db.query(UserTopicProgress).filter(
                UserTopicProgress.user_id == current_user.id,
                UserTopicProgress.topic_id == topic.id
            ).first()
            if not prog:
                prog = UserTopicProgress(
                    user_id=current_user.id,
                    topic_id=topic.id,
                    mastery_score=10,
                    status="learning",
                    times_studied=1,
                    total_time_minutes=data.watched_seconds // 60
                )
                db.add(prog)
            else:
                prog.times_studied += 1
                prog.total_time_minutes += data.watched_seconds // 60
                prog.mastery_score = min(100, prog.mastery_score + 1)
                prog.last_studied = datetime.utcnow()
            db.commit()
    
    return entry

@app.get("/history", response_model=List[HistoryResponse], tags=["Tracking - database/schemas/"])
def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db), limit: int = 50):
    return db.query(WatchHistory).filter(WatchHistory.user_id == current_user.id).order_by(WatchHistory.created_at.desc()).limit(limit).all()

@app.post("/notes", response_model=NoteResponse, tags=["Tracking - database/schemas/"])
def create_note(data: NoteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    topic_id = None
    if data.topic_name:
        topic = db.query(Topic).filter(Topic.name == data.topic_name).first()
        if topic:
            topic_id = topic.id
    note = Note(user_id=current_user.id, history_id=data.history_id, topic_id=topic_id, title=data.title, content=data.content, key_concepts=data.key_concepts, source_url=data.source_url)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@app.get("/notes", response_model=List[NoteResponse], tags=["Tracking - database/schemas/"])
def get_notes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Note).filter(Note.user_id == current_user.id).order_by(Note.created_at.desc()).all()

@app.post("/flashcards", response_model=FlashcardResponse, tags=["Tracking - database/schemas/"])
def create_flashcard(data: FlashcardCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    topic_id = None
    if data.topic_name:
        topic = db.query(Topic).filter(Topic.name == data.topic_name).first()
        if topic:
            topic_id = topic.id
    card = Flashcard(user_id=current_user.id, topic_id=topic_id, front=data.front, back=data.back, difficulty=data.difficulty)
    db.add(card)
    db.commit()
    db.refresh(card)
    return card

@app.get("/flashcards", response_model=List[FlashcardResponse], tags=["Tracking - database/schemas/"])
def get_flashcards(current_user: User = Depends(get_current_user), db: Session = Depends(get_db), due_only: bool = False):
    query = db.query(Flashcard).filter(Flashcard.user_id == current_user.id)
    if due_only:
        query = query.filter(Flashcard.next_review <= datetime.utcnow())
    return query.order_by(Flashcard.next_review.asc()).all()

@app.post("/flashcards/{card_id}/review", response_model=FlashcardResponse, tags=["Tracking - database/schemas/"])
def review_flashcard(card_id: int, review: FlashcardReview, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    card = db.query(Flashcard).filter(Flashcard.id == card_id, Flashcard.user_id == current_user.id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    if review.quality >= 3:
        if card.review_count == 0:
            card.interval_days = 1
        elif card.review_count == 1:
            card.interval_days = 6
        else:
            card.interval_days = int(card.interval_days * card.ease_factor)
        card.ease_factor = max(1.3, card.ease_factor + 0.1 - (5 - review.quality) * 0.08)
    else:
        card.interval_days = 1
        card.ease_factor = max(1.3, card.ease_factor - 0.2)
    
    card.review_count += 1
    card.next_review = datetime.utcnow() + timedelta(days=card.interval_days)
    
    if card.topic_id:
        prog = db.query(UserTopicProgress).filter(UserTopicProgress.user_id == current_user.id, UserTopicProgress.topic_id == card.topic_id).first()
        if prog:
            is_correct = review.quality >= 3
            prog.mastery_score = update_mastery_after_quiz(prog.mastery_score, is_correct)
            prog.last_studied = datetime.utcnow()
    
    db.commit()
    db.refresh(card)
    return card

@app.post("/quizzes", response_model=QuizResponse, tags=["Tracking - database/schemas/"])
def create_quiz(data: QuizCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    topic_id = None
    if data.topic_name:
        topic = db.query(Topic).filter(Topic.name == data.topic_name).first()
        if topic:
            topic_id = topic.id
    quiz = Quiz(user_id=current_user.id, topic_id=topic_id, question=data.question, option_a=data.option_a, option_b=data.option_b, option_c=data.option_c, option_d=data.option_d, correct_option=data.correct_option, explanation=data.explanation)
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return quiz

@app.get("/quizzes", response_model=List[QuizResponse], tags=["Tracking - database/schemas/"])
def get_quizzes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db), topic_name: Optional[str] = None):
    query = db.query(Quiz).filter(Quiz.user_id == current_user.id)
    if topic_name:
        topic = db.query(Topic).filter(Topic.name == topic_name).first()
        if topic:
            query = query.filter(Quiz.topic_id == topic.id)
    return query.all()

@app.post("/quizzes/attempt", response_model=QuizAttemptResponse, tags=["Tracking - database/schemas/"])
def attempt_quiz(data: QuizAttemptCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == data.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    is_correct = data.selected_option.lower() == quiz.correct_option.lower()
    attempt = QuizAttempt(quiz_id=quiz.id, user_id=current_user.id, selected_option=data.selected_option, is_correct=is_correct)
    db.add(attempt)
    
    if quiz.topic_id:
        prog = db.query(UserTopicProgress).filter(UserTopicProgress.user_id == current_user.id, UserTopicProgress.topic_id == quiz.topic_id).first()
        if prog:
            prog.mastery_score = update_mastery_after_quiz(prog.mastery_score, is_correct)
            prog.times_studied += 1
            prog.last_studied = datetime.utcnow()
            prog.status = mastery_to_status(prog.mastery_score, prog.times_studied)
    
    db.commit()
    db.refresh(attempt)
    return attempt

# ==================== RECOMMENDATIONS ====================

@app.get("/recommendations", tags=["Recommendations - recommendation/engine/"])
def get_recommendations_endpoint(current_user: User = Depends(get_current_user), db: Session = Depends(get_db), limit: int = 5):
    recs = get_recommendations(db, current_user.id, limit)
    return {
        "user": current_user.email,
        "user_level": current_user.learning_level,
        "count": len(recs),
        "recommendations": [
            {
                "topic": {"name": r["topic"].name, "slug": r["topic"].slug, "category": r["topic"].category, "difficulty": r["topic"].difficulty, "description": r["topic"].description},
                "reason": r["reason"],
                "priority": r["priority"],
                "matched_prerequisites": r["matched_prerequisites"],
                "estimated_time": r["estimated_time"],
                "score": round(r["score"], 1)
            } for r in recs
        ]
    }

@app.get("/analytics/dashboard", tags=["Analytics - docs/"])
def get_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    progress_map = get_user_progress_map(db, current_user.id)
    all_progress = list(progress_map.values())
    total_time = sum([p.total_time_minutes for p in all_progress])
    avg_mastery = sum([p.mastery_score for p in all_progress]) / len(all_progress) if all_progress else 0
    weak = get_weak_areas(db, current_user.id)
    recs = get_recommendations(db, current_user.id, 3)
    recent_history = db.query(WatchHistory).filter(WatchHistory.user_id == current_user.id).order_by(WatchHistory.created_at.desc()).limit(5).all()
    
    from sqlalchemy import func
    by_type = db.query(WatchHistory.content_type, func.count(WatchHistory.id)).filter(WatchHistory.user_id == current_user.id).group_by(WatchHistory.content_type).all()
    
    return {
        "user": current_user.email,
        "stats": {
            "total_topics_studied": len(all_progress),
            "mastered_topics": len([p for p in all_progress if p.mastery_score >= 70]),
            "weak_topics": len(weak),
            "total_study_time_minutes": total_time,
            "total_study_time_hours": round(total_time / 60, 1),
            "average_mastery": round(avg_mastery, 1),
            "learning_level": current_user.learning_level
        },
        "weak_areas": [{"topic": db.query(Topic).filter(Topic.id == w.topic_id).first().name, "mastery": w.mastery_score, "times_studied": w.times_studied} for w in weak],
        "study_by_content_type": [{"type": t[0], "count": t[1]} for t in by_type],
        "next_recommendations": [r["topic"].name for r in recs],
        "recent_activity": [{"title": h.title, "type": h.content_type, "topics": h.topics_detected, "date": h.created_at} for h in recent_history]
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "LearnFlow AI Backend - Member 3 - Follows Required Folder Structure",
        "structure": {
            "auth/": "JWT + password hashing (middleware, providers, utils)",
            "database/": "Models, schemas, seed scripts, vector-db placeholder, migrations",
            "recommendation/": "Knowledge graph + recommendation engine",
            "shared/": "Constants, types, utils",
            "docs/": "Architecture & analytics docs"
        },
        "docs": "/docs",
        "member": "Database, User System & Knowledge Memory",
        "endpoints": {
            "auth": ["/auth/signup", "/auth/login", "/auth/me"],
            "knowledge": ["/topics", "/knowledge-graph"],
            "memory": ["/memory/dashboard", "/progress/update"],
            "tracking": ["/history", "/notes", "/flashcards", "/quizzes"],
            "recommendations": ["/recommendations", "/analytics/dashboard"]
        }
    }
