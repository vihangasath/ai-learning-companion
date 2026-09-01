from typing import List, Dict, Any
from backend.app.analytics.processors.focus_processor import FocusProcessor

def get_focus_gauge_data(sessions: List[Dict[str, Any]], events: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate focus score gauge data.
    Output:
    {
        "focus_score": 85.3,
        "label": "Focused",
        "description": "You maintained a high focus rate. Only 2 distractions per hour.",
        "distraction_count": 4,
        "total_active_minutes": 102.5
    }
    """
    processor = FocusProcessor(sessions, events)
    summary = processor.get_focus_summary()
    score = summary["focus_rate"]
    
    # Determine qualitative label
    if score >= 85:
        label = "Excellent"
        desc = f"Exceptional study discipline! Focus rate was {score}% with low distractions."
    elif score >= 70:
        label = "Good"
        desc = f"Solid concentration. Keep up the good work (Focus: {score}%)."
    elif score >= 50:
        label = "Moderate"
        desc = f"Moderate focus ({score}%). Try minimizing open browser tabs to reduce distractions."
    else:
        label = "Needs Focus"
        desc = f"Low focus score ({score}%). Consider studying in shorter intervals or turning off notifications."
        
    return {
        "focus_score": score,
        "label": label,
        "description": desc,
        "distraction_count": summary["distraction_count"],
        "total_active_minutes": summary["total_active_minutes"]
    }
