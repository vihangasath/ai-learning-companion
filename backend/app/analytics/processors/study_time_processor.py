from typing import List, Dict, Any
from datetime import datetime, date, timedelta
from backend.app.analytics.metrics.study_metrics import calculate_total_study_time, calculate_average_daily_study_time

class StudyTimeProcessor:
    """
    Processor responsible for calculating aggregated study time metrics.
    """
    
    def __init__(self, sessions: List[Dict[str, Any]]):
        self.sessions = sessions

    def get_summary(self) -> Dict[str, Any]:
        """
        Compute total study time and daily average.
        """
        total_time = calculate_total_study_time(self.sessions)
        
        # Calculate distinct study days
        study_days = set()
        for session in self.sessions:
            start_time = session.get("start_time")
            if start_time:
                if isinstance(start_time, str):
                    try:
                        start_time = datetime.fromisoformat(start_time)
                    except ValueError:
                        continue
                if isinstance(start_time, datetime):
                    study_days.add(start_time.date())
                    
        num_days = len(study_days) if study_days else 1
        avg_time = calculate_average_daily_study_time(self.sessions, num_days)
        
        return {
            "total_study_minutes": total_time,
            "total_study_hours": round(total_time / 60.0, 2),
            "study_days_count": len(study_days),
            "daily_average_minutes": round(avg_time, 2)
        }

    def get_time_by_period(self, period: str = "daily") -> Dict[str, float]:
        """
        Groups study time by period.
        period can be: 'daily', 'weekly', 'monthly'.
        Returns a dictionary mapping date-string keys to study minutes.
        """
        period_data = {}
        for session in self.sessions:
            start_time = session.get("start_time")
            active_time = session.get("active_time_minutes") or 0.0
            
            if not active_time and "start_time" in session and "end_time" in session:
                # Fallback calculation
                start = session["start_time"]
                end = session["end_time"]
                if isinstance(start, str):
                    try: start = datetime.fromisoformat(start)
                    except ValueError: start = None
                if isinstance(end, str):
                    try: end = datetime.fromisoformat(end)
                    except ValueError: end = None
                if start and end:
                    active_time = (end - start).total_seconds() / 60.0
            
            if start_time:
                if isinstance(start_time, str):
                    try:
                        start_time = datetime.fromisoformat(start_time)
                    except ValueError:
                        continue
                
                # Determine grouping key
                if period == "daily":
                    key = start_time.strftime("%Y-%m-%d")
                elif period == "weekly":
                    # Use the Monday of the week as key
                    monday = start_time - timedelta(days=start_time.weekday())
                    key = monday.strftime("%Y-W%W")
                elif period == "monthly":
                    key = start_time.strftime("%Y-%m")
                else:
                    key = start_time.strftime("%Y-%m-%d")
                    
                period_data[key] = period_data.get(key, 0.0) + float(active_time)
                
        # Round values
        for k in period_data:
            period_data[k] = round(period_data[k], 2)
            
        return period_data
