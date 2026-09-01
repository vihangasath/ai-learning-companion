from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.database import get_db
from backend.app.database.schemas.models import Topic, TopicPrerequisite
from backend.app.database.schemas.schemas import TopicResponse
from backend.app.auth.middleware.auth_middleware import get_current_user
from backend.app.models.user import User
from backend.app.recommendation.engine.knowledge_graph import get_next_topics
from backend.app.recommendation.engine.recommender import get_learning_path
from backend.app.shared.constants.app_constants import TOPIC_TIME_ESTIMATES

router = APIRouter()

@router.get("/topics", response_model=List[TopicResponse])
def list_topics(db: Session = Depends(get_db)):
    return db.query(Topic).all()

@router.get("/graph")
def get_knowledge_graph(db: Session = Depends(get_db)):
    topics = db.query(Topic).all()
    edges = db.query(TopicPrerequisite).all()
    
    graph = {}
    for topic in topics:
        prereqs = db.query(TopicPrerequisite).filter(TopicPrerequisite.topic_id == topic.id).all()
        prereq_names = []
        for p in prereqs:
            prereq_topic = db.query(Topic).filter(Topic.id == p.prerequisite_id).first()
            if prereq_topic:
                prereq_names.append(prereq_topic.name)
        
        graph[topic.name] = {
            "id": topic.id,
            "slug": topic.slug,
            "category": topic.category,
            "difficulty": topic.difficulty,
            "prerequisites": prereq_names,
            "next_topics": get_next_topics(topic.name),
            "estimated_time": TOPIC_TIME_ESTIMATES.get(topic.name, "10 hours")
        }
    
    return {"nodes": len(topics), "edges": len(edges), "graph": graph}

@router.get("/{topic_name}/path")
def get_path_to_topic(topic_name: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.name == topic_name).first()
    if not topic:
        topic = db.query(Topic).filter(Topic.slug == topic_name).first()
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")
        topic_name = topic.name
    
    path = get_learning_path(db, current_user.id, topic_name)
    return {"target": topic_name, "total_steps": len(path), "estimated_total_time": f"{len(path)*8} hours", "path": path}
