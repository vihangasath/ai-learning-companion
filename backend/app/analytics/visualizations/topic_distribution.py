from typing import List, Dict, Any

def get_topic_distribution_data(sessions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate topic distribution data for a pie/donut chart representing time spent per topic.
    Returns:
    {
        "data": [
            {"name": "Topic A", "value": 120},  # value in minutes
            {"name": "Topic B", "value": 85}
        ]
    }
    """
    topic_map = {}
    
    for session in sessions:
        topic = session.get("topic") or session.get("subject") or "Uncategorized"
        minutes = session.get("active_time_minutes") or 0.0
        
        # Fallback calculation if active time not given
        if not minutes and "start_time" in session and "end_time" in session:
            from datetime import datetime
            start = session["start_time"]
            end = session["end_time"]
            if isinstance(start, str):
                try: start = datetime.fromisoformat(start)
                except ValueError: start = None
            if isinstance(end, str):
                try: end = datetime.fromisoformat(end)
                except ValueError: end = None
            if start and end:
                minutes = (end - start).total_seconds() / 60.0
                
        topic_map[topic] = topic_map.get(topic, 0.0) + float(minutes)
        
    chart_data = []
    for topic, val in topic_map.items():
        if val > 0:
            chart_data.append({
                "name": topic,
                "value": round(val, 2)
            })
            
    # Sort by value descending
    chart_data.sort(key=lambda x: x["value"], reverse=True)
    
    return {"data": chart_data}
