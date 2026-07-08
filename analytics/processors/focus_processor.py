from typing import List, Dict, Any
from datetime import datetime
from analytics.metrics.focus_metrics import calculate_focus_rate, calculate_distraction_frequency, calculate_idle_time

class FocusProcessor:
    """
    Processor responsible for analyzing user activity events to evaluate focus, 
    idle periods, and distraction rates.
    """
    
    def __init__(self, sessions: List[Dict[str, Any]], events: List[Dict[str, Any]]):
        self.sessions = sessions
        self.events = events

    def get_focus_summary(self) -> Dict[str, Any]:
        """
        Calculates aggregated focus statistics.
        """
        total_session_minutes = 0.0
        total_active_minutes = 0.0
        
        # Aggregate study sessions durations
        for session in self.sessions:
            start = session.get("start_time")
            end = session.get("end_time")
            active = session.get("active_time_minutes")
            
            if isinstance(start, str):
                try: start = datetime.fromisoformat(start)
                except ValueError: start = None
            if isinstance(end, str):
                try: end = datetime.fromisoformat(end)
                except ValueError: end = None
                
            if start and end:
                session_duration = (end - start).total_seconds() / 60.0
                total_session_minutes += session_duration
                if active is not None:
                    total_active_minutes += float(active)
                else:
                    total_active_minutes += session_duration
                    
        # If there are no sessions, fallback to events
        if total_session_minutes == 0.0 and self.events:
            # Estimate session time from events span
            timestamps = []
            for e in self.events:
                ts = e.get("timestamp")
                if isinstance(ts, str):
                    try: ts = datetime.fromisoformat(ts)
                    except ValueError: continue
                if isinstance(ts, datetime):
                    timestamps.append(ts)
            if len(timestamps) >= 2:
                total_session_minutes = (max(timestamps) - min(timestamps)).total_seconds() / 60.0
                idle = calculate_idle_time(self.events)
                total_active_minutes = max(0.0, total_session_minutes - idle)
        
        # Calculate rates
        focus_rate = calculate_focus_rate(total_active_minutes, total_session_minutes)
        distractions = calculate_distraction_frequency(self.events)
        
        # Distraction score = distractions per hour of session time
        session_hours = total_session_minutes / 60.0
        distractions_per_hour = distractions / session_hours if session_hours > 0 else 0.0
        
        return {
            "total_session_minutes": round(total_session_minutes, 2),
            "total_active_minutes": round(total_active_minutes, 2),
            "focus_rate": round(focus_rate, 2),
            "distraction_count": distractions,
            "distractions_per_hour": round(distractions_per_hour, 2)
        }
