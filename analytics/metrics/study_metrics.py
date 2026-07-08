from typing import List, Dict, Any
from datetime import datetime
from collections import Counter

def calculate_total_study_time(sessions: List[Dict[str, Any]]) -> float:
    """
    Calculate the total study time in minutes from a list of sessions.
    Each session dict should have 'active_time_minutes' or 'start_time' and 'end_time'.
    """
    total_minutes = 0.0
    for session in sessions:
        if "active_time_minutes" in session and session["active_time_minutes"] is not None:
            total_minutes += float(session["active_time_minutes"])
        elif "start_time" in session and "end_time" in session:
            start = session["start_time"]
            end = session["end_time"]
            if isinstance(start, str):
                start = datetime.fromisoformat(start)
            if isinstance(end, str):
                end = datetime.fromisoformat(end)
            if start and end:
                duration = (end - start).total_seconds() / 60.0
                total_minutes += max(0.0, duration)
    return total_minutes

def calculate_average_daily_study_time(sessions: List[Dict[str, Any]], num_days: int) -> float:
    """
    Calculate average daily study time in minutes.
    """
    if num_days <= 0:
        return 0.0
    total_time = calculate_total_study_time(sessions)
    return total_time / num_days

def calculate_peak_hours(sessions: List[Dict[str, Any]]) -> List[int]:
    """
    Find peak study hours (0-23) sorted by activity frequency.
    We look at the 'start_time' of sessions to see what hour the study started.
    """
    hours = []
    for session in sessions:
        start = session.get("start_time")
        if start:
            if isinstance(start, str):
                try:
                    start = datetime.fromisoformat(start)
                except ValueError:
                    continue
            hours.append(start.hour)
    
    if not hours:
        return []
    
    counts = Counter(hours)
    # Return hours sorted by count descending, then by hour ascending
    sorted_hours = sorted(counts.keys(), key=lambda h: (-counts[h], h))
    return sorted_hours
