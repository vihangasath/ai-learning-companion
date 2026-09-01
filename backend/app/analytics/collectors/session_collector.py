from typing import Dict, Any
from backend.app.analytics.collectors.schemas import AnalyticsEventSchema

SESSION_START = "session_start"
SESSION_END = "session_end"

class SessionEventCollector:
    """
    Collector responsible for ingesting and processing study session start/end events.
    """
    
    @staticmethod
    def collect(payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and process session start/end events.
        """
        event = AnalyticsEventSchema(**payload)
        
        if event.event_type not in [SESSION_START, SESSION_END]:
            raise ValueError(f"Invalid session event type: {event.event_type}")
            
        meta = event.metadata
        
        processed_data = {
            "user_id": event.user_id,
            "session_id": event.session_id,
            "content_id": event.content_id,
            "event_type": event.event_type,
            "timestamp": event.timestamp,
            "metadata_json": meta
        }
        
        # Optional metadata fields
        if "content_url" in meta:
            processed_data["content_url"] = str(meta["content_url"])
        if "content_type" in meta:  # "video", "pdf", "article"
            processed_data["content_type"] = str(meta["content_type"])
        if "duration_seconds" in meta:
            processed_data["duration_seconds"] = float(meta["duration_seconds"])
            
        return processed_data
