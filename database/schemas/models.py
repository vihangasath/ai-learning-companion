"""
Database Models - Member 3 Core
These are the tables you will show to judges
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database.connection import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    learning_level = Column(String, default="beginner")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    progresses = relationship("UserTopicProgress", back_populates="user")
    histories = relationship("WatchHistory", back_populates="user")
    notes = relationship("Note", back_populates="user")
    flashcards = relationship("Flashcard", back_populates="user")

class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  # e.g., "Calculus"
    slug = Column(String, unique=True, nullable=False)
    category = Column(String)
    difficulty = Column(String, default="beginner")
    description = Column(Text)

class TopicPrerequisite(Base):
    __tablename__ = "topic_prerequisites"
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    prerequisite_id = Column(Integer, ForeignKey("topics.id"), nullable=False)

class UserTopicProgress(Base):
    __tablename__ = "user_topic_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    mastery_score = Column(Float, default=0.0)
    status = Column(String, default="not_started")
    times_studied = Column(Integer, default=0)
    total_time_minutes = Column(Integer, default=0)
    last_studied = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="progresses")
    topic = relationship("Topic")

class WatchHistory(Base):
    __tablename__ = "watch_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content_type = Column(String, nullable=False)
    content_url = Column(String)
    content_id = Column(String, nullable=True)
    title = Column(String)
    duration_seconds = Column(Integer, default=0)
    watched_seconds = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    topics_detected = Column(JSON, default=list)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="histories")

class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    history_id = Column(Integer, ForeignKey("watch_history.id"), nullable=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    title = Column(String)
    content = Column(Text)
    key_concepts = Column(JSON, default=list)
    source_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="notes")

class Flashcard(Base):
    __tablename__ = "flashcards"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    difficulty = Column(String, default="medium")
    ease_factor = Column(Float, default=2.5)
    interval_days = Column(Integer, default=1)
    next_review = Column(DateTime, default=datetime.utcnow)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="flashcards")

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    question = Column(Text, nullable=False)
    option_a = Column(String)
    option_b = Column(String)
    option_c = Column(String)
    option_d = Column(String)
    correct_option = Column(String)
    explanation = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    selected_option = Column(String)
    is_correct = Column(Boolean)
    attempted_at = Column(DateTime, default=datetime.utcnow)
