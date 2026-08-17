from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class FlashcardResponse(BaseModel):
    id: str
    content_id: str
    question: str
    answer: str
    difficulty: str
    is_learned: bool
    last_reviewed_at: Optional[datetime] = None
    review_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class FlashcardListResponse(BaseModel):
    flashcards: List[FlashcardResponse]
    total: int


class FlashcardUpdateRequest(BaseModel):
    is_learned: bool = True
