"""
Scoring utils - isolated math for recommendations
"""
def calculate_prereq_completion(mastered_prereqs: list, all_prereqs: list) -> float:
    if not all_prereqs:
        return 1.0
    return len(mastered_prereqs) / len(all_prereqs)

def calculate_weighted_score(completion: float, avg_mastery: float) -> float:
    return completion * 60 + (avg_mastery / 100) * 40
