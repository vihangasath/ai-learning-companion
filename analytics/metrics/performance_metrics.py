from typing import List, Dict, Any

def calculate_quiz_accuracy(quiz_results: List[Dict[str, Any]]) -> float:
    """
    Calculate average quiz accuracy as a percentage.
    Each result can contain 'score' (percentage 0-100) or 'correct_answers' and 'total_questions'.
    """
    if not quiz_results:
        return 0.0
    
    total_percentage = 0.0
    valid_count = 0
    
    for result in quiz_results:
        if "score" in result and result["score"] is not None:
            total_percentage += float(result["score"])
            valid_count += 1
        elif "correct_answers" in result and "total_questions" in result:
            correct = result["correct_answers"]
            total = result["total_questions"]
            if total > 0:
                total_percentage += (correct / total) * 100.0
                valid_count += 1
                
    if valid_count == 0:
        return 0.0
    return total_percentage / valid_count

def calculate_improvement_rate(quiz_results: List[Dict[str, Any]]) -> float:
    """
    Calculate the difference between the average score of the first 3 quizzes
    and the average score of the last 3 quizzes.
    Returns a positive percentage for improvement, negative for regression.
    """
    if len(quiz_results) < 2:
        return 0.0
    
    # Sort results by completion time if available
    from datetime import datetime
    sorted_results = []
    for r in quiz_results:
        completed_at = r.get("completed_at") or r.get("created_at")
        if isinstance(completed_at, str):
            try:
                completed_at = datetime.fromisoformat(completed_at)
            except ValueError:
                completed_at = datetime.min
        elif not isinstance(completed_at, datetime):
            completed_at = datetime.min
        sorted_results.append((completed_at, r))
        
    sorted_results.sort(key=lambda x: x[0])
    results_ordered = [x[1] for x in sorted_results]
    
    # Calculate scores
    scores = []
    for r in results_ordered:
        if "score" in r and r["score"] is not None:
            scores.append(float(r["score"]))
        elif "correct_answers" in r and "total_questions" in r:
            total = r["total_questions"]
            if total > 0:
                scores.append((r["correct_answers"] / total) * 100.0)
                
    if len(scores) < 2:
        return 0.0
        
    # Take first half vs second half or first 3 vs last 3
    num_items = min(3, len(scores) // 2)
    if num_items == 0:
        num_items = 1
        
    initial_avg = sum(scores[:num_items]) / num_items
    recent_avg = sum(scores[-num_items:]) / num_items
    
    return recent_avg - initial_avg

def calculate_mastery_score(quiz_avg: float, completion_rate: float, review_count: int) -> float:
    """
    Mastery Score (per topic)
    mastery_score = (quiz_avg * 0.4) + (completion_rate * 0.3) + (review_count * 0.3)
    Assuming quiz_avg and completion_rate are 0-100. review_count is capped at 10 to represent full reviews.
    """
    # Cap review count contribution at 10 reviews (or 100% of review weight)
    review_weight = min(10.0, float(review_count)) * 10.0  # scales 0-100
    
    mastery = (quiz_avg * 0.4) + (completion_rate * 0.3) + (review_weight * 0.3)
    return min(100.0, max(0.0, mastery))

def calculate_learning_velocity(topics_completed: int, weeks_active: float) -> float:
    """
    Learning Velocity (topics completed per week)
    """
    if weeks_active <= 0:
        return 0.0
    return topics_completed / weeks_active
