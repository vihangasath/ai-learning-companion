"""
Database Models - Member 3 Core + Knowledge Graph
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

from database.connection import Base


class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    category = Column(String(100))
    difficulty = Column(String(50), default="beginner")
    description = Column(Text)


class TopicPrerequisite(Base):
    __tablename__ = "topic_prerequisites"
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    prerequisite_id = Column(Integer, ForeignKey("topics.id"), nullable=False)


class UserTopicProgress(Base):
    __tablename__ = "user_topic_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    mastery_score = Column(Float, default=0.0)
    status = Column(String(50), default="not_started")
    times_studied = Column(Integer, default=0)
    total_time_minutes = Column(Integer, default=0)
    last_studied = Column(DateTime, default=datetime.utcnow)

    topic = relationship("Topic")


class WatchHistory(Base):
    __tablename__ = "watch_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    content_type = Column(String(50), nullable=False)
    content_url = Column(Text)
    content_id = Column(String(255), nullable=True)
    title = Column(String(500))
    duration_seconds = Column(Integer, default=0)
    watched_seconds = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    topics_detected = Column(JSON, default=list)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(String(36), ForeignKey("quizzes.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    selected_option = Column(String(255))
    is_correct = Column(Boolean)
    attempted_at = Column(DateTime, default=datetime.utcnow)

