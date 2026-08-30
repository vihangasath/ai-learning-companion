"""
Shared Utils - Helper functions
"""
from datetime import datetime, timedelta

def now_utc():
    return datetime.utcnow()

def slugify(text: str) -> str:
    """ 'Linear Algebra' -> 'linear-algebra' """
    return text.lower().replace(" & ", "-").replace(" ", "-").replace("/", "-")

def truncate_text(text: str, length: int = 100) -> str:
    return text[:length] + "..." if len(text) > length else text

def mastery_to_status(score: float, times_studied: int = 1) -> str:
    """Convert mastery score to status"""
    if score >= 70:
        return "mastered"
    elif score < 40 and times_studied > 2:
        return "weak"
    elif score >= 30:
        return "learning"
    else:
        return "not_started"

def update_mastery_after_quiz(current_score: float, is_correct: bool) -> float:
    """SMART mastery update with diminishing returns"""
    if is_correct:
        gain = 15 * (1 - current_score / 100) + 5
        new_score = min(100, current_score + gain)
    else:
        new_score = max(0, current_score - 5)
    return round(new_score, 1)
