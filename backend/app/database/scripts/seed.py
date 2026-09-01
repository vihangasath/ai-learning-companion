"""
Seed script - Run to populate knowledge graph
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.app.database.connection import SessionLocal, engine, Base
import backend.app.models
from backend.app.database.schemas.models import Topic, TopicPrerequisite
from backend.app.recommendation.engine.knowledge_graph import KNOWLEDGE_GRAPH_TOPICS, KNOWLEDGE_GRAPH_EDGES
from sqlalchemy import text




def seed():
    # Sync legacy schemas on PostgreSQL/Neon if needed
    with engine.connect() as conn:
        try:
            # Check if users table has integer id (legacy)
            res = conn.execute(text("SELECT data_type FROM information_schema.columns WHERE table_name='users' AND column_name='id';"))
            row = res.fetchone()
            if row and "int" in row[0].lower():
                print("Resetting legacy table schemas to UUID standard...")
                conn.execute(text("DROP TABLE IF EXISTS quiz_attempts, quiz_results, quizzes, notes, flashcards, study_sessions, learning_stats, analytics_events, user_topic_progress, watch_history, users CASCADE;"))
            conn.commit()
        except Exception:
            pass

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    print("Seeding LearnFlow AI Database...")


    
    topic_map = {}
    for topic_data in KNOWLEDGE_GRAPH_TOPICS:
        topic = db.query(Topic).filter(Topic.name == topic_data["name"]).first()
        if not topic:
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
            existing_edge = db.query(TopicPrerequisite).filter(
                TopicPrerequisite.topic_id == topic_id,
                TopicPrerequisite.prerequisite_id == prereq_id
            ).first()
            if not existing_edge:
                edge = TopicPrerequisite(topic_id=topic_id, prerequisite_id=prereq_id)
                db.add(edge)
                edge_count += 1
    db.commit()

    # Seed demo user
    from backend.app.models.user import User
    from auth.utils.password import get_password_hash

    demo_user = db.query(User).filter(User.email == "demo@learnflow.ai").first()
    if not demo_user:
        demo_user = User(
            email="demo@learnflow.ai",
            password_hash=get_password_hash("demo123"),
            name="Demo Learner",
            role="student",
            learning_level="beginner"
        )
        db.add(demo_user)
        db.commit()
        print("  + Demo user (demo@learnflow.ai)")

    total_topics = db.query(Topic).count()
    total_edges = db.query(TopicPrerequisite).count()
    print(f"\nSeed complete! Total Topics in DB: {total_topics}, Total Edges in DB: {total_edges}")

    db.close()



if __name__ == "__main__":
    seed()

