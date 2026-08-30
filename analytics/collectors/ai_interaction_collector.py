from typing import Dict, Any
from analytics.collectors.schemas import AnalyticsEventSchema

# Event constants
SUMMARY_GENERATED = "summary_generated"
QUIZ_GENERATED = "quiz_generated"
FLASHCARD_OPENED = "flashcard_opened"
NOTE_VIEWED = "note_viewed"

class AIInteractionCollector:
    """
    Collector responsible for ingesting and processing interactions with the AI side panel.
    """
    
    @staticmethod
    def collect(payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and process an AI interaction event.
        """
        event = AnalyticsEventSchema(**payload)
        
        valid_types = [SUMMARY_GENERATED, QUIZ_GENERATED, FLASHCARD_OPENED, NOTE_VIEWED]
        if event.event_type not in valid_types:
            raise ValueError(f"Invalid AI interaction event type: {event.event_type}")
            
        meta = event.metadata
        
        processed_data = {
            "user_id": event.user_id,
            "session_id": event.session_id,
            "content_id": event.content_id,
            "event_type": event.event_type,
            "timestamp": event.timestamp,
            "metadata_json": meta
        }
        
        # Extract optional fields
        if "tool_name" in meta:
            processed_data["tool_name"] = str(meta["tool_name"])
        if "tokens_used" in meta:
            processed_data["tokens_used"] = int(meta["tokens_used"])
        if "rating" in meta:
            processed_data["rating"] = int(meta["rating"])  # Feedback score (1-5)
            
        return processed_data
