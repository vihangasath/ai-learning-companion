from typing import List, Dict, Any
from datetime import date, datetime, timedelta
from backend.app.analytics.metrics.streak_metrics import calculate_streaks

def get_streak_timeline_data(sessions: List[Dict[str, Any]], range_days: int = 30) -> Dict[str, Any]:
    """
    Generate daily timeline of study consistency showing completed status and current streak.
    Returns:
    {
        "data": [
            {"date": "2026-06-01", "completed": true, "streak": 1},
            {"date": "2026-06-02", "completed": false, "streak": 0}
        ]
    }
    """
    # Get all study dates
    study_dates = set()
    for session in self.sessions if hasattr(self, 'sessions') else sessions:
        start_time = session.get("start_time")
        if start_time:
            if isinstance(start_time, str):
                try:
                    start_time = datetime.fromisoformat(start_time)
                except ValueError:
                    continue
            if isinstance(start_time, datetime):
                study_dates.add(start_time.date())
                
    today = date.today()
    start_date = today - timedelta(days=range_days - 1)
    
    timeline = []
    
    # We will simulate the streak count day by day
    # Collect chronological dates up to each day to calculate current streak on that day
    dates_list = sorted(list(study_dates))
    
    for i in range(range_days):
        check_date = start_date + timedelta(days=i)
        date_str = check_date.strftime("%Y-%m-%d")
        completed = check_date in study_dates
        
        # Calculate current streak up to this date
        dates_up_to_day = [d for d in dates_list if d <= check_date]
        
        # Calculate streak using a modified version of streak calculator
        streak = 0
        if dates_up_to_day:
            temp_streak = 0
            prev_d = None
            for d in dates_up_to_day:
                if prev_d is None:
                    temp_streak = 1
                elif d == prev_d + timedelta(days=1):
                    temp_streak += 1
                else:
                    temp_streak = 1
                prev_d = d
            
            # Check if streak is still active on check_date (studied on check_date or day before)
            if dates_up_to_day[-1] == check_date or dates_up_to_day[-1] == check_date - timedelta(days=1):
                # Backtrace streak
                streak = 0
                target = dates_up_to_day[-1]
                for d in reversed(dates_up_to_day):
                    if d == target:
                        streak += 1
                        target -= timedelta(days=1)
                    else:
                        break
                        
        timeline.append({
            "date": date_str,
            "completed": completed,
            "streak": streak
        })
        
    return {"data": timeline}
