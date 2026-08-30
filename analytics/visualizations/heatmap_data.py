from typing import List, Dict, Any
from datetime import datetime, date, timedelta

def get_heatmap_data(sessions: List[Dict[str, Any]], range_days: int = 365) -> Dict[str, Any]:
    """
    Generate study heatmap data for a GitHub-style activity grid (date -> activity count/minutes).
    Returns list of dicts: [{"date": "2026-06-01", "count": 1, "minutes": 45.0}, ...]
    """
    today = date.today()
    start_date = today - timedelta(days=range_days - 1)
    
    # Initialize all dates in the range with 0
    days_map = {}
    for i in range(range_days):
        d = start_date + timedelta(days=i)
        days_map[d.strftime("%Y-%m-%d")] = {"count": 0, "minutes": 0.0}
        
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
                date_str = start_time.strftime("%Y-%m-%d")
                if date_str in days_map:
                    days_map[date_str]["count"] += 1
                    days_map[date_str]["minutes"] += float(active_minutes)
                    
    # Format to list of dicts
    heatmap_list = []
    for date_str, stats in sorted(days_map.items()):
        heatmap_list.append({
            "date": date_str,
            "count": stats["count"],
            "minutes": round(stats["minutes"], 2)
        })
        
    return {"data": heatmap_list}
