from typing import List, Dict, Any
from datetime import date, datetime, timedelta
from analytics.metrics.streak_metrics import calculate_streaks, calculate_consistency_score

class ConsistencyProcessor:
    """
    Processor responsible for tracking study consistency, learning streaks, 
    and skipped learning days.
    """
    
    def __init__(self, sessions: List[Dict[str, Any]], range_days: int = 30):
        self.sessions = sessions
        self.range_days = range_days

    def get_study_dates(self) -> List[date]:
        """
        Extract study dates (unique date objects) from sessions.
        """
        study_dates = []
        for session in self.sessions:
            start_time = session.get("start_time")
            if start_time:
                if isinstance(start_time, str):
                    try:
                        start_time = datetime.fromisoformat(start_time)
                    except ValueError:
                        continue
                if isinstance(start_time, datetime):
                    study_dates.append(start_time.date())
        return list(set(study_dates))

    def get_consistency_summary(self) -> Dict[str, Any]:
        """
        Generates streaks, consistency scores, and missed days count.
        """
        study_dates = self.get_study_dates()
        current_streak, longest_streak = calculate_streaks(study_dates)
        
        # Calculate active days within the specified range (default 30 days)
        today = date.today()
        start_range = today - timedelta(days=self.range_days - 1)
        
        active_days_in_range = sum(1 for d in study_dates if start_range <= d <= today)
        consistency_score = calculate_consistency_score(active_days_in_range, self.range_days)
        missed_days = self.range_days - active_days_in_range
        
        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "consistency_score_last_30_days": round(consistency_score, 2),
            "active_days_count": len(study_dates),
            "missed_days_in_range": missed_days
        }
