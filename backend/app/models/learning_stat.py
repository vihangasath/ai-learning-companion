import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Date, UniqueConstraint
from sqlalchemy.dialects.sqlite import TEXT as SQLITE_TEXT
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class LearningStat(Base):
    __tablename__ = "learning_stats"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    study_time_minutes = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    focus_score = Column(Float, nullable=True)
    topics_studied = Column(SQLITE_TEXT, default="[]")
    videos_completed = Column(Integer, default=0)

    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_user_date"),)

    user = relationship("User", back_populates="learning_stats")
