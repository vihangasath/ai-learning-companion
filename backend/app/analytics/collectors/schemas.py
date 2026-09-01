from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, Any, Optional

class AnalyticsEventSchema(BaseModel):
    event_type: str = Field(..., description="Type of the event, e.g. video_play, tab_visible, etc.")
    user_id: str = Field(..., description="UUID of the user")
    session_id: str = Field(..., description="UUID of the study session")
    content_id: str = Field(..., description="ID of the content (YouTube video ID, URL, or document ID)")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Event-specific metadata details")
