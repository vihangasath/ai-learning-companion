import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Float
from sqlalchemy.dialects.sqlite import TEXT as SQLITE_TEXT
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content_id = Column(String(255), nullable=True)
    content_url = Column(Text, nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    focus_rate = Column(Float, nullable=True)
    completion_rate = Column(Float, nullable=True)
    active_time_minutes = Column(Integer, nullable=True)
    events = Column(SQLITE_TEXT, default="[]")

    user = relationship("User", back_populates="study_sessions")
