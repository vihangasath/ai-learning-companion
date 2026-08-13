from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ContentAnalyzeRequest(BaseModel):
    url: str
    content_type: str = Field(..., pattern="^(youtube|article|pdf)$")
    raw_text: Optional[str] = None
    transcript: Optional[str] = None


class FlashcardItem(BaseModel):
    question: str
    answer: str
    difficulty: str = "medium"


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    type: str = "multiple_choice"
    explanation: Optional[str] = None


class TopicItem(BaseModel):
    topic: str
    keywords: List[str]
    confidence: float


class FormulaItem(BaseModel):
    name: str
    raw_text: str
    latex: str
    display_math: str
    source: str


class ContentAnalysisResponse(BaseModel):
    content_id: str
    content_url: str
    content_type: str
    title: str
    summary: str
    detailed_notes: str
    flashcards: List[FlashcardItem]
    quiz: List[QuizQuestion]
    topics: List[TopicItem]
    formulas: List[FormulaItem]
    created_at: datetime
