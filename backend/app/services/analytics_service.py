import json
import uuid
from datetime import datetime
from typing import Any
from sqlalchemy.orm import Session

from backend.app.models.analytics_event import AnalyticsEvent


class AnalyticsService:
    def record_event(
        self,
        db: Session,
        user_id: str,
        event_type: str,
        content_id: str,
        session_id: str,
        metadata: dict[str, Any],
    ) -> AnalyticsEvent:
        event = AnalyticsEvent(
            id=str(uuid.uuid4()),
            user_id=user_id,
            event_type=event_type,
            event_data=json.dumps({
                "content_id": content_id,
                "session_id": session_id,
                **metadata,
            }),
            session_id=session_id,
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    def get_study_time(self, db: Session, user_id: str, days: int = 7) -> dict:
        return {"total_minutes": 0, "daily_breakdown": []}

    def get_focus(self, db: Session, user_id: str, days: int = 7) -> dict:
        return {"focus_rate": 0, "total_distractions": 0, "idle_time_minutes": 0}

    def get_streaks(self, db: Session, user_id: str) -> dict:
        return {"current_streak": 0, "longest_streak": 0, "consistency_score": 0}

    def get_performance(self, db: Session, user_id: str) -> dict:
        return {"overall_accuracy": 0, "subject_breakdown": []}

    def get_subjects(self, db: Session, user_id: str) -> dict:
        return {"subjects": []}

    def get_recent(self, db: Session, user_id: str, limit: int = 20) -> list:
        events = (
            db.query(AnalyticsEvent)
            .filter(AnalyticsEvent.user_id == user_id)
            .order_by(AnalyticsEvent.created_at.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "event_type": e.event_type,
                "content_id": json.loads(e.event_data).get("content_id", ""),
                "timestamp": e.created_at,
                "metadata": json.loads(e.event_data) if isinstance(e.event_data, str) else e.event_data,
            }
            for e in events
        ]

    def get_heatmap(self, db: Session, user_id: str, year: int | None = None) -> dict:
        return {"data": []}


analytics_service = AnalyticsService()
