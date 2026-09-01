from typing import List, Dict, Any
from datetime import datetime, date, timedelta

def get_weekly_activity_data(sessions: List[Dict[str, Any]], target_date: date = None) -> Dict[str, Any]:
    """
    Generate weekly activity chart data (study minutes for the last 7 days ending on target_date).
    Output format:
    {
        "data": [
            {"day": "Mon", "minutes": 45},
            {"day": "Tue", "minutes": 62},
            ...
        ]
    }
    """
    if target_date is None:
        target_date = date.today()
        
    # Get last 7 days
    days = [target_date - timedelta(days=i) for i in range(6, -1, -1)]
    days_map = {d.strftime("%Y-%m-%d"): 0.0 for d in days}
    
    # Aggregate active time from sessions
    for session in sessions:
        start_time = session.get("start_time")
        active_minutes = session.get("active_time_minutes") or 0.0
        
        # Fallback calculation
        if not active_minutes and "start_time" in session and "end_time" in session:
            start = session["start_time"]
            end = session["end_time"]
            if isinstance(start, str):
                try: start = datetime.fromisoformat(start)
                except ValueError: start = None
            if isinstance(end, str):
                try: end = datetime.fromisoformat(end)
                except ValueError: end = None
            if start and end:
                active_minutes = (end - start).total_seconds() / 60.0
                
        if start_time:
            if isinstance(start_time, str):
                try:
                    start_time = datetime.fromisoformat(start_time)
                except ValueError:
                    continue
            if isinstance(start_time, datetime):
                start_date_str = start_time.strftime("%Y-%m-%d")
                if start_date_str in days_map:
                    days_map[start_date_str] += float(active_minutes)
                    
    # Format for chart (e.g. Mon, Tue, etc.)
    chart_data = []
    for d in days:
        date_str = d.strftime("%Y-%m-%d")
        # %a gets weekday abbreviation like 'Mon', 'Tue'
        day_abbr = d.strftime("%a")
        chart_data.append({
            "day": day_abbr,
            "minutes": round(days_map[date_str], 2),
            "date": date_str
        })
        
    return {"data": chart_data}
