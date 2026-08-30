import json
import uuid
from datetime import datetime, date, timedelta
from typing import Any
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.app.models.analytics_event import AnalyticsEvent
from backend.app.models.learning_stat import LearningStat
from backend.app.models.quiz import QuizResult


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
        cutoff = date.today() - timedelta(days=days)
        stats = (
            db.query(LearningStat)
            .filter(
                LearningStat.user_id == user_id,
                LearningStat.date >= cutoff,
            )
            .order_by(LearningStat.date.asc())
            .all()
        )
        total_minutes = sum(s.study_time_minutes for s in stats)
        daily_breakdown = [
            {
                "date": s.date.isoformat(),
                "day": s.date.strftime("%a"),
                "minutes": s.study_time_minutes,
                "hours": round(s.study_time_minutes / 60, 2),
            }
            for s in stats
        ]
        return {
            "total_minutes": total_minutes,
            "total_hours": round(total_minutes / 60, 2),
            "daily_breakdown": daily_breakdown,
        }

    def get_focus(self, db: Session, user_id: str, days: int = 7) -> dict:
        cutoff = date.today() - timedelta(days=days)
        stats = (
            db.query(LearningStat)
            .filter(
                LearningStat.user_id == user_id,
                LearningStat.date >= cutoff,
                LearningStat.focus_score.isnot(None),
            )
            .order_by(LearningStat.date.asc())
            .all()
        )
        if not stats:
            return {"focus_rate": 0.0, "total_distractions": 0, "idle_time_minutes": 0.0, "daily_breakdown": []}

        avg_focus = sum(s.focus_score for s in stats if s.focus_score) / len(stats)
        # Count distraction events from analytics_events
        cutoff_dt = datetime.combine(cutoff, datetime.min.time())
        distraction_count = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.user_id == user_id,
                AnalyticsEvent.event_type.in_(["tab_hidden", "user_idle"]),
                AnalyticsEvent.created_at >= cutoff_dt,
            )
            .count()
        )
        daily_breakdown = [
            {
                "date": s.date.isoformat(),
                "day": s.date.strftime("%a"),
                "focus": round(s.focus_score or 0.0, 1),
            }
            for s in stats
        ]
        return {
            "focus_rate": round(avg_focus, 2),
            "total_distractions": distraction_count,
            "idle_time_minutes": 0.0,
            "daily_breakdown": daily_breakdown,
        }

    def get_streaks(self, db: Session, user_id: str) -> dict:
        stats = (
            db.query(LearningStat.date)
            .filter(
                LearningStat.user_id == user_id,
                LearningStat.study_time_minutes > 0,
            )
            .order_by(LearningStat.date.desc())
            .all()
        )
        study_dates = sorted(set(s.date for s in stats))

        if not study_dates:
            return {"current_streak": 0, "longest_streak": 0, "consistency_score": 0.0}

        # Current streak — count consecutive days ending today or yesterday
        current_streak = 0
        check_date = date.today()
        for d in reversed(study_dates):
            if d == check_date or d == check_date - timedelta(days=1):
                current_streak += 1
                check_date = d - timedelta(days=1)
            elif d < check_date:
                break

        # Longest streak
        longest_streak = 1
        temp = 1
        for i in range(1, len(study_dates)):
            if (study_dates[i] - study_dates[i - 1]).days == 1:
                temp += 1
                longest_streak = max(longest_streak, temp)
            else:
                temp = 1

        # Consistency score: active days / days since first study
        if len(study_dates) > 1:
            total_span = (study_dates[-1] - study_dates[0]).days + 1
            consistency_score = round((len(study_dates) / total_span) * 100, 2)
        else:
            consistency_score = 100.0

        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "consistency_score": consistency_score,
        }

    def get_performance(self, db: Session, user_id: str) -> dict:
        results = (
            db.query(QuizResult)
            .filter(QuizResult.user_id == user_id)
            .order_by(QuizResult.completed_at.desc())
            .all()
        )
        if not results:
            return {"overall_accuracy": 0.0, "subject_breakdown": [], "total_quizzes": 0}

        overall = sum(r.score for r in results) / len(results)
        return {
            "overall_accuracy": round(overall, 2),
            "total_quizzes": len(results),
            "subject_breakdown": [
                {
                    "quiz_id": r.quiz_id,
                    "score": r.score,
                    "total_questions": r.total_questions,
                    "correct_answers": r.correct_answers,
                    "completed_at": r.completed_at.isoformat() if r.completed_at else None,
                }
                for r in results[:10]
            ],
        }

    def get_subjects(self, db: Session, user_id: str) -> dict:
        stats = (
            db.query(LearningStat)
            .filter(LearningStat.user_id == user_id)
            .all()
        )
        topic_counts: dict[str, int] = {}
        for s in stats:
            try:
                topics = json.loads(s.topics_studied or "[]")
                for topic in topics:
                    topic_counts[topic] = topic_counts.get(topic, 0) + 1
            except (json.JSONDecodeError, TypeError):
                pass
        subjects = [
            {"name": topic, "sessions": count}
            for topic, count in sorted(topic_counts.items(), key=lambda x: -x[1])
        ]
        return {"subjects": subjects}

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
                "content_id": json.loads(e.event_data).get("content_id", "") if e.event_data else "",
                "timestamp": e.created_at.isoformat() if e.created_at else None,
                "metadata": json.loads(e.event_data) if isinstance(e.event_data, str) else (e.event_data or {}),
            }
            for e in events
        ]

    def get_heatmap(self, db: Session, user_id: str, year: int | None = None) -> dict:
        target_year = year or date.today().year
        stats = (
            db.query(LearningStat)
            .filter(
                LearningStat.user_id == user_id,
                func.strftime("%Y", LearningStat.date) == str(target_year),
            )
            .all()
        )
        data = [
            {
                "date": s.date.isoformat(),
                "count": s.study_time_minutes,
                "level": min(4, s.study_time_minutes // 30),  # 0-4 intensity
            }
            for s in stats
        ]
        return {"data": data, "year": target_year}


analytics_service = AnalyticsService()
