import json
from pydantic import BaseModel, field_validator
from typing import List, Dict, Any, Optional
from datetime import datetime


class QuizResponse(BaseModel):
    id: str
    content_id: str
    questions: List[Dict[str, Any]]
    quiz_type: str
    created_at: datetime

    @field_validator("questions", mode="before")
    @classmethod
    def parse_questions(cls, v: Any) -> List[Dict[str, Any]]:
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return []
        return v or []

    model_config = {"from_attributes": True}


class QuizListResponse(BaseModel):
    quizzes: List[QuizResponse]
    total: int


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
