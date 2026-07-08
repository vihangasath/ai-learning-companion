from typing import Dict, Any, Tuple
from datetime import datetime
from analytics.collectors.schemas import AnalyticsEventSchema

# Event constants
VIDEO_PLAY = "video_play"
VIDEO_PAUSE = "video_pause"
VIDEO_SEEK = "video_seek"
VIDEO_COMPLETE = "video_complete"

class VideoEventCollector:
    """
    Collector responsible for ingesting and processing video interaction events.
    """
    
    @staticmethod
    def collect(payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and process a video event payload.
        Returns a dictionary formatted for the database.
        """
        event = AnalyticsEventSchema(**payload)
        
        # Check event type is valid for video
        valid_types = [VIDEO_PLAY, VIDEO_PAUSE, VIDEO_SEEK, VIDEO_COMPLETE]
        if event.event_type not in valid_types:
            raise ValueError(f"Invalid video event type: {event.event_type}")
            
        # Extract specific video metadata
        meta = event.metadata
        playhead = meta.get("playhead_seconds", 0.0)
        total_duration = meta.get("total_duration_seconds", 0.0)
        
        processed_data = {
            "user_id": event.user_id,
            "session_id": event.session_id,
            "content_id": event.content_id,
            "event_type": event.event_type,
            "timestamp": event.timestamp,
            "playhead_seconds": float(playhead),
            "total_duration_seconds": float(total_duration),
            "metadata_json": meta
        }
        
        # Additional fields
        if "playback_speed" in meta:
            processed_data["playback_speed"] = float(meta["playback_speed"])
            
        return processed_data
