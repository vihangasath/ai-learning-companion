"""
Shared Types - Common enums and type defs
"""
from enum import Enum

class LearningLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

class ContentType(str, Enum):
    youtube = "youtube"
    course = "course"
    pdf = "pdf"
    blog = "blog"
    docs = "docs"
    paper = "paper"

class ProgressStatus(str, Enum):
    not_started = "not_started"
    learning = "learning"
    mastered = "mastered"
    weak = "weak"

class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"
