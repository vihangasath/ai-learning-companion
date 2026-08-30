"""
Seed script - Run to populate knowledge graph
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from database.connection import SessionLocal, engine
from database.schemas.models import Topic, TopicPrerequisite
from recommendation.engine.knowledge_graph import KNOWLEDGE_GRAPH_TOPICS, KNOWLEDGE_GRAPH_EDGES
from database.connection import Base

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    print("🌱 Seeding LearnFlow AI Database...")
    
    existing = db.query(Topic).count()
    if existing > 0:
        print(f"Found {existing} topics, clearing...")
        db.query(TopicPrerequisite).delete()
        db.query(Topic).delete()
        db.commit()
    
    topic_map = {}
    for topic_data in KNOWLEDGE_GRAPH_TOPICS:
        topic = Topic(**topic_data)
        db.add(topic)
        db.commit()
        db.refresh(topic)
        topic_map[topic.name] = topic.id
        print(f"  + {topic.name}")
    
    edge_count = 0
    for topic_name, prereqs in KNOWLEDGE_GRAPH_EDGES.items():
        if topic_name not in topic_map:
            continue
        topic_id = topic_map[topic_name]
        for prereq_name in prereqs:
            if prereq_name not in topic_map:
                continue
            prereq_id = topic_map[prereq_name]
            edge = TopicPrerequisite(topic_id=topic_id, prerequisite_id=prereq_id)
            db.add(edge)
            edge_count += 1
    
    db.commit()
    print(f"\n✅ Seed complete! Topics: {len(topic_map)}, Edges: {edge_count}")
    db.close()

if __name__ == "__main__":
    seed()
