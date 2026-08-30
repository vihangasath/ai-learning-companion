"""
Pydantic Schemas for API validation
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    learning_level: str = "beginner"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    learning_level: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TopicResponse(BaseModel):
    id: int
    name: str
    slug: str
    category: str
    difficulty: str
    description: Optional[str]
    class Config:
        from_attributes = True

class ProgressUpdate(BaseModel):
    topic_name: str
    mastery_score: Optional[float] = None
    time_spent_minutes: int = 5
    is_correct: Optional[bool] = None

class ProgressResponse(BaseModel):
    id: int
    topic: TopicResponse
    mastery_score: float
    status: str
    times_studied: int
    total_time_minutes: int
    last_studied: datetime
    class Config:
        from_attributes = True

class HistoryCreate(BaseModel):
    content_type: str
    content_url: Optional[str] = None
    content_id: Optional[str] = None
    title: str
    duration_seconds: int = 0
    watched_seconds: int = 0
    completed: bool = False
    topics_detected: List[str] = []
    summary: Optional[str] = None

class HistoryResponse(BaseModel):
    id: int
    content_type: str
    content_url: Optional[str]
    title: str
    completed: bool
    topics_detected: List[str]
    created_at: datetime
    class Config:
        from_attributes = True

class NoteCreate(BaseModel):
    history_id: Optional[int] = None
    topic_name: Optional[str] = None
    title: str
    content: str
    key_concepts: List[str] = []
    source_url: Optional[str] = None

class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    key_concepts: List[str]
    created_at: datetime
    class Config:
        from_attributes = True

class FlashcardCreate(BaseModel):
    topic_name: Optional[str] = None
    front: str
    back: str
    difficulty: str = "medium"

class FlashcardResponse(BaseModel):
    id: int
    front: str
    back: str
    difficulty: str
    next_review: datetime
    review_count: int
    class Config:
        from_attributes = True

class FlashcardReview(BaseModel):
    quality: int

class QuizCreate(BaseModel):
    topic_name: Optional[str] = None
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    explanation: Optional[str] = None

class QuizResponse(BaseModel):
    id: int
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: Optional[str] = None
    explanation: Optional[str] = None
    class Config:
        from_attributes = True

class QuizAttemptCreate(BaseModel):
    quiz_id: int
    selected_option: str

class QuizAttemptResponse(BaseModel):
    id: int
    quiz_id: int
    is_correct: bool
    attempted_at: datetime
    class Config:
        from_attributes = True

class RecommendationItem(BaseModel):
    topic: TopicResponse
    reason: str
    priority: int
    matched_prerequisites: List[str]
    estimated_time: str

class KnowledgeMemoryResponse(BaseModel):
    learned_topics: List[ProgressResponse]
    weak_areas: List[ProgressResponse]
    in_progress: List[ProgressResponse]
    total_study_time: int
    overall_mastery: float
    streak: Optional[int] = 0
