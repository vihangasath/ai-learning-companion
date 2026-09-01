from typing import List, Dict, Any

def calculate_completion_rate(watched_duration: float, total_video_duration: float) -> float:
    """
    Video Completion Rate = (watched_duration / total_video_duration) * 100
    """
    if total_video_duration <= 0:
        return 0.0
    rate = (watched_duration / total_video_duration) * 100.0
    return min(100.0, max(0.0, rate))

def count_completed_videos(videos: List[Dict[str, Any]], completion_threshold: float = 90.0) -> int:
    """
    Count the number of videos with completion_rate >= completion_threshold.
    """
    completed_count = 0
    for video in videos:
        watched = video.get("watched_duration", 0.0)
        total = video.get("total_video_duration", 0.0)
        
        rate = video.get("completion_rate")
        if rate is None:
            rate = calculate_completion_rate(watched, total)
            
        if rate >= completion_threshold:
            completed_count += 1
            
    return completed_count

def count_notes_generated(notes: List[Dict[str, Any]]) -> int:
    """
    Simple count of generated notes.
    """
    return len(notes)

def count_flashcards_reviewed(flashcard_history: List[Dict[str, Any]]) -> int:
    """
    Count total flashcards reviewed. We sum the 'review_count' or length of reviews.
    """
    total_reviews = 0
    for card in flashcard_history:
        total_reviews += card.get("review_count", 0)
    return total_reviews
