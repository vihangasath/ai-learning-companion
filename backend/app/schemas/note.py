import json
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime


class NoteResponse(BaseModel):
    id: str
    content_id: str
    content_url: str
    content_type: str
    title: Optional[str] = None
    summary: Optional[str] = None
    detailed_notes: Optional[str] = None
    topics: List[str] = []
    created_at: datetime

    @field_validator("topics", mode="before")
    @classmethod
    def parse_topics(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            return json.loads(v)
        return v or []

    model_config = {"from_attributes": True}


class NoteListResponse(BaseModel):
    notes: List[NoteResponse]
    total: int
