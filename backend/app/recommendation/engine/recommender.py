"""
Recommendation Engine - Core Deliverable
Explainable, personalized recommendations based on knowledge graph + mastery
"""
from typing import List, Dict
from sqlalchemy.orm import Session
from backend.app.models.user import User
from backend.app.database.schemas.models import Topic, UserTopicProgress
from backend.app.recommendation.engine.knowledge_graph import KNOWLEDGE_GRAPH_EDGES, get_prerequisites


from backend.app.shared.constants.app_constants import TOPIC_TIME_ESTIMATES

def get_user_progress_map(db: Session, user_id: str | int) -> Dict[str, UserTopicProgress]:
    progresses = db.query(UserTopicProgress).filter(UserTopicProgress.user_id == str(user_id)).all()
    progress_map = {}
    for p in progresses:
        topic = db.query(Topic).filter(Topic.id == p.topic_id).first()
        if topic:
            progress_map[topic.name] = p
    return progress_map

def calculate_topic_score(topic_name: str, progress_map: Dict, user_level: str):
    prereqs = get_prerequisites(topic_name)
    
    if not prereqs:
        if topic_name not in progress_map:
            return (80, f"Great starting point for {user_level} learners", [])
        else:
            return (0, "Already studied", [])
    
    if topic_name in progress_map and progress_map[topic_name].mastery_score >= 70:
        return (0, "Already mastered", [])
    
    mastered_prereqs = []
    total_prereq_score = 0
    
    for prereq in prereqs:
        if prereq in progress_map:
            score = progress_map[prereq].mastery_score
            total_prereq_score += score
            if score >= 70:
                mastered_prereqs.append(prereq)
        else:
            total_prereq_score += 0
    
    if len(mastered_prereqs) == 0 and len(prereqs) > 0:
        learning_prereqs = [p for p in prereqs if p in progress_map and progress_map[p].mastery_score >= 30]
        if not learning_prereqs:
            return (0, f"Need to learn {', '.join(prereqs)} first", [])
    
    prereq_completion = len(mastered_prereqs) / len(prereqs) if prereqs else 1
    avg_prereq_score = total_prereq_score / len(prereqs) if prereqs else 100
    
    score = prereq_completion * 60 + (avg_prereq_score / 100) * 40
    
    if prereq_completion == 1.0:
        score += 20
        reason = f"You've mastered all prerequisites: {', '.join(mastered_prereqs)}. Ready for next step!"
    elif prereq_completion >= 0.5:
        reason = f"You're {int(prereq_completion*100)}% ready - mastered {', '.join(mastered_prereqs)}"
    else:
        reason = f"Builds on {', '.join(prereqs)} - you've started {', '.join([p for p in prereqs if p in progress_map])}"
    
    return (score, reason, mastered_prereqs)

def get_recommendations(db: Session, user_id: str | int | None = None, limit: int = 5) -> List[Dict]:
    user = None
    if user_id:
        user = db.query(User).filter(User.id == str(user_id)).first()
    if not user:
        user = db.query(User).first()
    
    learning_level = user.learning_level if user and hasattr(user, "learning_level") else "beginner"
    progress_map = get_user_progress_map(db, user.id) if user else {}
    all_topics = db.query(Topic).all()
    
    scored_topics = []
    
    for topic in all_topics:
        score, reason, matched = calculate_topic_score(topic.name, progress_map, learning_level)
        if score > 0:
            scored_topics.append({
                "topic": topic,
                "score": score,
                "reason": reason,
                "matched_prerequisites": matched,
                "estimated_time": TOPIC_TIME_ESTIMATES.get(topic.name, "10 hours")
            })
    
    scored_topics.sort(key=lambda x: x["score"], reverse=True)
    
    recommendations = []
    for idx, item in enumerate(scored_topics[:limit]):
        recommendations.append({
            "id": str(item["topic"].id),
            "title": item["topic"].name,
            "subject": item["topic"].category or "General",
            "topic": item["topic"],
            "reason": item["reason"],
            "priority": idx + 1,
            "difficulty": item["topic"].difficulty or "beginner",
            "matched_prerequisites": item["matched_prerequisites"],
            "duration": item["estimated_time"],
            "estimated_time": item["estimated_time"],
            "match_score": round(item["score"], 1),
            "score": round(item["score"], 1)
        })
    
    if len(recommendations) == 0:
        from recommendation.engine.knowledge_graph import KNOWLEDGE_GRAPH_TOPICS
        for idx, t in enumerate(KNOWLEDGE_GRAPH_TOPICS[:limit]):
            recommendations.append({
                "id": str(idx + 1),
                "title": t["name"],
                "subject": t.get("category", "General"),
                "reason": f"Perfect starting point for {learning_level} learners",
                "priority": idx + 1,
                "difficulty": t.get("difficulty", "beginner"),
                "matched_prerequisites": [],
                "duration": TOPIC_TIME_ESTIMATES.get(t["name"], "10 hours"),
                "estimated_time": TOPIC_TIME_ESTIMATES.get(t["name"], "10 hours"),
                "match_score": 90 - idx * 5,
                "score": 90 - idx * 5
            })
    
    return recommendations


def get_weak_areas(db: Session, user_id: int):
    weak = db.query(UserTopicProgress).filter(
        UserTopicProgress.user_id == user_id,
        UserTopicProgress.mastery_score < 50,
        UserTopicProgress.times_studied > 0
    ).all()
    return weak

def get_learning_path(db: Session, user_id: int, target_topic: str) -> List[Dict]:
    def get_path_recursive(topic_name, visited=None):
        if visited is None:
            visited = set()
        if topic_name in visited:
            return []
        visited.add(topic_name)
        
        prereqs = get_prerequisites(topic_name)
        path = []
        for prereq in prereqs:
            path.extend(get_path_recursive(prereq, visited))
            if prereq not in [p["name"] for p in path]:
                topic_obj = db.query(Topic).filter(Topic.name == prereq).first()
                path.append({"name": prereq, "topic": topic_obj})
        
        topic_obj = db.query(Topic).filter(Topic.name == topic_name).first()
        path.append({"name": topic_name, "topic": topic_obj})
        return path
    
    raw_path = get_path_recursive(target_topic)
    seen = set()
    final_path = []
    for item in raw_path:
        if item["name"] not in seen:
            seen.add(item["name"])
            final_path.append(item)
    
    progress_map = get_user_progress_map(db, user_id)
    enriched_path = []
    for step in final_path:
        status = "not_started"
        mastery = 0
        if step["name"] in progress_map:
            prog = progress_map[step["name"]]
            mastery = prog.mastery_score
            if mastery >= 70:
                status = "mastered"
            elif mastery >= 30:
                status = "learning"
            else:
                status = "weak"
        
        enriched_path.append({
            "topic": step["topic"],
            "status": status,
            "mastery_score": mastery
        })
    
    return enriched_path
