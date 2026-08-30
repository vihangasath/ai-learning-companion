from typing import List, Dict, Any, Tuple
from analytics.metrics.engagement_metrics import calculate_completion_rate

class CompletionProcessor:
    """
    Processor responsible for evaluating video completion rates, including
    handling seek/rewatch segments.
    """
    
    def __init__(self, sessions: List[Dict[str, Any]] = None):
        self.sessions = sessions or []

    def get_average_completion(self) -> float:
        """
        Compute the average completion rate across all sessions.
        """
        if not self.sessions:
            return 0.0
        
        rates = []
        for s in self.sessions:
            rate = s.get("completion_rate")
            if rate is not None:
                rates.append(float(rate))
            else:
                watched = s.get("watched_duration") or s.get("active_time_minutes", 0.0) * 60.0
                total = s.get("total_video_duration") or s.get("duration_seconds", 0.0)
                if total > 0:
                    rates.append(calculate_completion_rate(watched, total))
                    
        return sum(rates) / len(rates) if rates else 0.0

    @staticmethod
    def calculate_from_segments(segments: List[Tuple[float, float]], total_duration: float) -> float:
        """
        Merge overlapping watched intervals [start, end] and calculate the total unique 
        time watched, divided by total video duration.
        """
        if total_duration <= 0 or not segments:
            return 0.0
            
        # Sort segments by start time
        sorted_segs = sorted(segments, key=lambda x: x[0])
        
        # Merge overlapping segments
        merged: List[Tuple[float, float]] = []
        for seg in sorted_segs:
            if not merged:
                merged.append(seg)
            else:
                last_start, last_end = merged[-1]
                curr_start, curr_end = seg
                
                if curr_start <= last_end:
                    # Overlap, merge them
                    merged[-1] = (last_start, max(last_end, curr_end))
                else:
                    merged.append(seg)
                    
        # Sum merged segment durations
        unique_watched = 0.0
        for start, end in merged:
            # Clamp duration to total_duration
            s = max(0.0, min(start, total_duration))
            e = max(0.0, min(end, total_duration))
            unique_watched += (e - s)
            
        return calculate_completion_rate(unique_watched, total_duration)
