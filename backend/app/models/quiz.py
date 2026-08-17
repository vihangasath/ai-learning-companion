import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Float
from sqlalchemy.dialects.sqlite import TEXT as SQLITE_TEXT
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content_id = Column(String(255), nullable=False)
    questions = Column(SQLITE_TEXT, nullable=False)
    quiz_type = Column(String(30), default="mixed")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="quizzes")
    results = relationship("QuizResult", back_populates="quiz", cascade="all, delete-orphan")


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_id = Column(String(36), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    answers = Column(SQLITE_TEXT, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    quiz = relationship("Quiz", back_populates="results")
    user = relationship("User", back_populates="quiz_results")
