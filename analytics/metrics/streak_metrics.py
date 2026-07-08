from typing import List, Dict, Any, Tuple
from datetime import date, timedelta, datetime

def calculate_streaks(study_dates: List[date]) -> Tuple[int, int]:
    """
    Calculate the current study streak and the longest study streak.
    Dates should be a list of date objects.
    """
    # Remove duplicates and sort dates chronologically
    unique_dates = sorted(list(set(study_dates)))
    if not unique_dates:
        return 0, 0

    longest_streak = 0
    current_streak = 0
    
    # We iterate and find consecutive date ranges
    temp_streak = 0
    prev_date = None
    
    for d in unique_dates:
        if prev_date is None:
            temp_streak = 1
        elif d == prev_date + timedelta(days=1):
            temp_streak += 1
        else:
            if temp_streak > longest_streak:
                longest_streak = temp_streak
            temp_streak = 1
        prev_date = d
        
    if temp_streak > longest_streak:
        longest_streak = temp_streak
        
    # Calculate current streak
    # Current streak counts if the last study date is today or yesterday
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    if unique_dates[-1] == today:
        # User studied today
        # Find how many consecutive days up to today
        current_streak = 0
        check_date = today
        for d in reversed(unique_dates):
            if d == check_date:
                current_streak += 1
                check_date -= timedelta(days=1)
            else:
                break
    elif unique_dates[-1] == yesterday:
        # User studied yesterday but not yet today
        current_streak = 0
        check_date = yesterday
        for d in reversed(unique_dates):
            if d == check_date:
                current_streak += 1
                check_date -= timedelta(days=1)
            else:
                break
    else:
        # Streak is broken
        current_streak = 0
        
    return current_streak, longest_streak

def calculate_consistency_score(active_days: int, total_days: int) -> float:
    """
    Consistency Score = (Active Days / Total Days) * 100
    """
    if total_days <= 0:
        return 0.0
    score = (active_days / total_days) * 100.0
    return min(100.0, max(0.0, score))
