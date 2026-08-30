from typing import Dict, Any
from analytics.collectors.schemas import AnalyticsEventSchema

# Event constants
TAB_VISIBLE = "tab_visible"
TAB_HIDDEN = "tab_hidden"
USER_ACTIVE = "user_active"
USER_IDLE = "user_idle"

class UserActivityCollector:
    """
    Collector responsible for ingesting and processing tab switching, visibility,
    and user keyboard/mouse activity events.
    """
    
    @staticmethod
    def collect(payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and process a user activity event.
        """
        event = AnalyticsEventSchema(**payload)
        
        valid_types = [TAB_VISIBLE, TAB_HIDDEN, USER_ACTIVE, USER_IDLE]
        if event.event_type not in valid_types:
            raise ValueError(f"Invalid user activity event type: {event.event_type}")
            
        meta = event.metadata
        
        processed_data = {
            "user_id": event.user_id,
            "session_id": event.session_id,
            "content_id": event.content_id,
            "event_type": event.event_type,
            "timestamp": event.timestamp,
            "metadata_json": meta
        }
        
        # Capture optional details
        if "device_type" in meta:
            processed_data["device_type"] = str(meta["device_type"])
        if "activity_type" in meta:  # "mouse_move", "keydown", etc.
            processed_data["activity_type"] = str(meta["activity_type"])
        if "duration_seconds" in meta:
            processed_data["duration_seconds"] = float(meta["duration_seconds"])
            
        return processed_data
