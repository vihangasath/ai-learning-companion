from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from backend.app.core.database import get_db
from backend.app.database.schemas.models import Topic, UserTopicProgress, WatchHistory
from backend.app.database.schemas.schemas import ProgressUpdate, ProgressResponse, HistoryCreate, HistoryResponse
from backend.app.auth.middleware.auth_middleware import get_current_user
from backend.app.models.user import User
from backend.app.shared.utils.helpers import update_mastery_after_quiz, mastery_to_status

router = APIRouter()

@router.post("/progress/update", response_model=ProgressResponse)
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

@router.get("/progress", response_model=List[ProgressResponse])
def get_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(UserTopicProgress).filter(UserTopicProgress.user_id == current_user.id).all()

@router.get("/dashboard")
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

@router.post("/history", response_model=HistoryResponse)
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

@router.get("/history", response_model=List[HistoryResponse])
def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db), limit: int = 50):
    return db.query(WatchHistory).filter(WatchHistory.user_id == current_user.id).order_by(WatchHistory.created_at.desc()).limit(limit).all()
