from typing import List, Dict, Any
from datetime import datetime
from collections import Counter
from backend.app.analytics.metrics.study_metrics import calculate_peak_hours

class ProductivityProcessor:
    """
    Processor responsible for identifying user learning behaviors by time of day
    and mapping focus levels to specific hours.
    """
    
    def __init__(self, sessions: List[Dict[str, Any]]):
        self.sessions = sessions

    def get_peak_hours(self) -> List[int]:
        """
        Get hours sorted by number of sessions started.
        """
        return calculate_peak_hours(self.sessions)

    def get_hourly_activity(self) -> Dict[str, float]:
        """
        Groups active study minutes by hour of the day (e.g. '09:00', '10:00').
        """
        hourly_minutes = {f"{h:02d}:00": 0.0 for h in range(24)}
        
        for session in self.sessions:
            start = session.get("start_time")
            active = session.get("active_time_minutes") or 0.0
            
            if start:
                if isinstance(start, str):
                    try: start = datetime.fromisoformat(start)
                    except ValueError: continue
                if isinstance(start, datetime):
                    hour_key = f"{start.hour:02d}:00"
                    hourly_minutes[hour_key] += float(active)
                    
        # Round values
        for h in hourly_minutes:
            hourly_minutes[h] = round(hourly_minutes[h], 2)
            
        return hourly_minutes

    def get_focus_by_time_of_day(self) -> Dict[str, float]:
        """
        Calculates average focus rate by time segment:
        - Morning (06:00 - 12:00)
        - Afternoon (12:00 - 18:00)
        - Evening (18:00 - 24:00)
        - Night (00:00 - 06:00)
        """
        segments = {
            "Morning": {"focus_sum": 0.0, "count": 0},
            "Afternoon": {"focus_sum": 0.0, "count": 0},
            "Evening": {"focus_sum": 0.0, "count": 0},
            "Night": {"focus_sum": 0.0, "count": 0}
        }
        
        for s in self.sessions:
            start = s.get("start_time")
            focus = s.get("focus_rate")
            
            if start and focus is not None:
                if isinstance(start, str):
                    try: start = datetime.fromisoformat(start)
                    except ValueError: continue
                
                h = start.hour
                if 6 <= h < 12:
                    seg = "Morning"
                elif 12 <= h < 18:
                    seg = "Afternoon"
                elif 18 <= h < 24:
                    seg = "Evening"
                else:
                    seg = "Night"
                    
                segments[seg]["focus_sum"] += float(focus)
                segments[seg]["count"] += 1
                
        # Calculate averages
        avg_focus = {}
        for seg, data in segments.items():
            avg = data["focus_sum"] / data["count"] if data["count"] > 0 else 0.0
            avg_focus[seg] = round(avg, 2)
            
        return avg_focus
