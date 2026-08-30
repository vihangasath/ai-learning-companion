from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.analytics import AnalyticsEventRequest
from backend.app.services.analytics_service import analytics_service

router = APIRouter()


@router.post("/event")
def record_event(req: AnalyticsEventRequest, db: Session = Depends(get_db)):
    user_id = "default-user-id"
    event = analytics_service.record_event(
        db, user_id, req.event_type, req.content_id, req.session_id, req.metadata
    )

    return {
        "status": "success",
        "data": {"id": event.id, "event_type": event.event_type, "created_at": event.created_at},
        "message": "Event recorded",
    }


@router.get("/study-time")
def get_study_time(days: int = Query(7, ge=1, le=365), db: Session = Depends(get_db)):
    user_id = "default-user-id"
    return {"status": "success", "data": analytics_service.get_study_time(db, user_id, days)}


@router.get("/focus")
def get_focus(days: int = Query(7, ge=1, le=365), db: Session = Depends(get_db)):
    user_id = "default-user-id"
    return {"status": "success", "data": analytics_service.get_focus(db, user_id, days)}


@router.get("/streaks")
def get_streaks(db: Session = Depends(get_db)):
    user_id = "default-user-id"
    return {"status": "success", "data": analytics_service.get_streaks(db, user_id)}


@router.get("/performance")
def get_performance(db: Session = Depends(get_db)):
    user_id = "default-user-id"
    return {"status": "success", "data": analytics_service.get_performance(db, user_id)}


@router.get("/subjects")
def get_subjects(db: Session = Depends(get_db)):
    user_id = "default-user-id"
    return {"status": "success", "data": analytics_service.get_subjects(db, user_id)}


@router.get("/recent")
def get_recent(limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    user_id = "default-user-id"
    return {"status": "success", "data": analytics_service.get_recent(db, user_id, limit)}


@router.get("/heatmap")
def get_heatmap(year: int | None = None, db: Session = Depends(get_db)):
    user_id = "default-user-id"
    return {"status": "success", "data": analytics_service.get_heatmap(db, user_id, year)}
