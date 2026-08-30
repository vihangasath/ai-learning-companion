from typing import List, Dict, Any
from analytics.metrics.performance_metrics import calculate_quiz_accuracy, calculate_mastery_score, calculate_improvement_rate

class PerformanceProcessor:
    """
    Processor responsible for calculating quiz accuracy, topic mastery scores,
    and progress improvement trends.
    """
    
    def __init__(self, quiz_results: List[Dict[str, Any]], topic_studies: List[Dict[str, Any]] = None):
        self.quiz_results = quiz_results
        self.topic_studies = topic_studies or []

    def get_overall_accuracy(self) -> float:
        """
        Calculate the average score across all quizzes.
        """
        return round(calculate_quiz_accuracy(self.quiz_results), 2)

    def get_improvement(self) -> float:
        """
        Get the difference between early and recent quiz results.
        """
        return round(calculate_improvement_rate(self.quiz_results), 2)

    def get_subject_performance(self) -> Dict[str, Dict[str, Any]]:
        """
        Group quiz results by subject/topic and calculate average accuracy.
        """
        subject_data = {}
        for result in self.quiz_results:
            subject = result.get("subject") or result.get("topic") or "General"
            score = result.get("score")
            
            if score is None and "correct_answers" in result and "total_questions" in result:
                correct = result["correct_answers"]
                total = result["total_questions"]
                score = (correct / total) * 100.0 if total > 0 else 0.0
                
            if score is not None:
                if subject not in subject_data:
                    subject_data[subject] = {"scores_sum": 0.0, "count": 0}
                subject_data[subject]["scores_sum"] += float(score)
                subject_data[subject]["count"] += 1
                
        # Calculate averages
        performance = {}
        for subj, data in subject_data.items():
            avg = data["scores_sum"] / data["count"] if data["count"] > 0 else 0.0
            performance[subj] = {
                "average_score": round(avg, 2),
                "quizzes_taken": data["count"]
            }
            
        return performance

    def get_topic_mastery(self) -> List[Dict[str, Any]]:
        """
        Evaluate mastery score per topic.
        Uses: mastery_score = (quiz_avg * 0.4) + (completion_rate * 0.3) + (review_count * 0.3)
        """
        mastery_list = []
        
        # We process the topic studies list
        # Each element should contain: 'topic', 'quiz_avg', 'completion_rate', 'review_count'
        for study in self.topic_studies:
            topic = study.get("topic")
            quiz_avg = study.get("quiz_avg", 0.0)
            completion = study.get("completion_rate", 0.0)
            reviews = study.get("review_count", 0)
            
            score = calculate_mastery_score(quiz_avg, completion, reviews)
            
            mastery_list.append({
                "topic": topic,
                "quiz_average": round(quiz_avg, 2),
                "completion_rate": round(completion, 2),
                "review_count": reviews,
                "mastery_score": round(score, 2)
            })
            
        return mastery_list
