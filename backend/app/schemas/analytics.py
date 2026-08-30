from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class AnalyticsEventRequest(BaseModel):
    event_type: str
    content_id: str
    session_id: str
    metadata: Dict[str, Any] = {}


class AnalyticsEventResponse(BaseModel):
    id: str
    event_type: str
    event_data: Dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}


class StudyTimeData(BaseModel):
    total_minutes: float
    daily_breakdown: List[Dict[str, Any]]


class FocusData(BaseModel):
    focus_rate: float
    total_distractions: int
    idle_time_minutes: float


class StreakData(BaseModel):
    current_streak: int
    longest_streak: int
    consistency_score: float


class PerformanceData(BaseModel):
    overall_accuracy: float
    subject_breakdown: List[Dict[str, Any]]


class SubjectData(BaseModel):
    subjects: List[Dict[str, Any]]


class RecentActivityItem(BaseModel):
    event_type: str
    content_id: str
    timestamp: datetime
    metadata: Dict[str, Any]


class HeatmapData(BaseModel):
    data: List[Dict[str, Any]]
