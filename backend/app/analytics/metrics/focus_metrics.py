from typing import List, Dict, Any

def calculate_focus_rate(active_study_time: float, total_session_time: float) -> float:
    """
    Calculate focus rate as a percentage: (active_study_time / total_session_time) * 100.
    """
    if total_session_time <= 0:
        return 0.0
    rate = (active_study_time / total_session_time) * 100.0
    return min(100.0, max(0.0, rate))

def calculate_distraction_frequency(events: List[Dict[str, Any]]) -> int:
    """
    Calculate distraction frequency. A distraction event is defined as a
    tab hidden ('tab_hidden') or user idle ('user_idle') event.
    """
    distractions = 0
    for event in events:
        event_type = event.get("event_type")
        if event_type in ["tab_hidden", "user_idle", "window_blur"]:
            distractions += 1
    return distractions

def calculate_idle_time(events: List[Dict[str, Any]]) -> float:
    """
    Estimate total idle time in minutes from a sequence of events.
    We track time between 'user_idle' and 'user_active' (or session end) events.
    Each event must contain a timestamp (isoformat string or datetime).
    """
    from datetime import datetime
    idle_minutes = 0.0
    idle_start = None
    
    # Sort events by timestamp to ensure chronological order
    sorted_events = []
    for e in events:
        ts = e.get("timestamp")
        if not ts:
            continue
        if isinstance(ts, str):
            try:
                ts = datetime.fromisoformat(ts)
            except ValueError:
                continue
        sorted_events.append((ts, e))
    
    sorted_events.sort(key=lambda x: x[0])
    
    for ts, event in sorted_events:
        etype = event.get("event_type")
        if etype == "user_idle":
            if idle_start is None:
                idle_start = ts
        elif etype in ["user_active", "user_active_movement"]:
            if idle_start is not None:
                duration = (ts - idle_start).total_seconds() / 60.0
                idle_minutes += max(0.0, duration)
                idle_start = None
                
    # If the session ended and user was still idle
    if idle_start is not None and sorted_events:
        last_ts = sorted_events[-1][0]
        if last_ts > idle_start:
            idle_minutes += (last_ts - idle_start).total_seconds() / 60.0
            
    return idle_minutes
