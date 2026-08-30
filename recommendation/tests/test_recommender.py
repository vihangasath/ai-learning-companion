"""
Recommendation tests
"""
def test_knowledge_graph():
    from recommendation.engine.knowledge_graph import get_prerequisites, get_next_topics
    assert "Calculus" in get_prerequisites("Linear Algebra")
    assert "Gradient Descent" in get_next_topics("Calculus")
    print("✅ Knowledge graph test passed")

def test_scoring():
    # Simulate: user mastered Calculus + Linear Algebra, should get high score for Gradient Descent
    progress_map = {
        "Calculus": type('obj', (object,), {'mastery_score': 85})(),
        "Linear Algebra": type('obj', (object,), {'mastery_score': 80})()
    }
    from recommendation.engine.recommender import calculate_topic_score
    score, reason, matched = calculate_topic_score("Gradient Descent", progress_map, "beginner")
    assert score > 70, f"Expected high score, got {score}"
    print(f"✅ Recommendation scoring test passed: {score} - {reason}")

if __name__ == "__main__":
    test_knowledge_graph()
    test_scoring()
