from pydantic import BaseModel, Field
from typing import List, Dict, Any
from datetime import datetime


class QuizResponse(BaseModel):
    id: str
    content_id: str
    questions: List[Dict[str, Any]]
    quiz_type: str
    created_at: datetime

    model_config = {"from_attributes": True}


class QuizSubmitRequest(BaseModel):
    quiz_id: str
    answers: List[Dict[str, Any]]


class QuizResultResponse(BaseModel):
    quiz_id: str
    score: float
    total_questions: int
    correct_answers: int
    answers: List[Dict[str, Any]]
    completed_at: datetime

    model_config = {"from_attributes": True}
