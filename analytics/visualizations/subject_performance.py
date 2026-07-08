from typing import List, Dict, Any
from analytics.processors.performance_processor import PerformanceProcessor

def get_subject_performance_data(quiz_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate subject performance data for a bar chart.
    Output format:
    {
        "data": [
            {"subject": "Linear Algebra", "accuracy": 85.0, "quizzes_taken": 4},
            {"subject": "Machine Learning", "accuracy": 72.3, "quizzes_taken": 3}
        ]
    }
    """
    processor = PerformanceProcessor(quiz_results)
    subj_perf = processor.get_subject_performance()
    
    chart_data = []
    for subject, stats in subj_perf.items():
        chart_data.append({
            "subject": subject,
            "accuracy": stats["average_score"],
            "quizzes_taken": stats["quizzes_taken"]
        })
        
    # Sort by accuracy descending
    chart_data.sort(key=lambda x: x["accuracy"], reverse=True)
    
    return {"data": chart_data}
