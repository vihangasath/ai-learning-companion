"""
Recommendation Models - Pydantic for recommendation responses
"""
from pydantic import BaseModel
from typing import List

class TopicSimple(BaseModel):
    name: str
    slug: str
    category: str
    difficulty: str
    description: str = ""

class RecommendationResponse(BaseModel):
    topic: TopicSimple
    reason: str
    priority: int
    matched_prerequisites: List[str]
    estimated_time: str
    score: float
