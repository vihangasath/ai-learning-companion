import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.sqlite import TEXT as SQLITE_TEXT
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class Note(Base):
    __tablename__ = "notes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content_id = Column(String(255), nullable=False, index=True)
    content_url = Column(Text, nullable=False)
    content_type = Column(String(50), nullable=False)
    title = Column(String(500), nullable=True)
    summary = Column(Text, nullable=True)
    detailed_notes = Column(Text, nullable=True)
    topics = Column(SQLITE_TEXT, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notes")
