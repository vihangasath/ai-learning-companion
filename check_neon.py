"""
Check if Neon connection is working
Run: python check_neon.py
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./learnflow.db")

if "neon.tech" not in DATABASE_URL and "postgres" not in DATABASE_URL:
    print("[INFO] You are on SQLite, not Neon!")
    print(f"Current: {DATABASE_URL}")
    exit(0)

# Fix postgres:// -> postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"[INFO] Testing connection to: {DATABASE_URL[:50]}...")

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    with engine.connect() as conn:
        # Test connection
        result = conn.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print(f"[OK] Connected to Neon! Postgres version: {version[:60]}...")
        
        # Check tables
        result = conn.execute(text("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema='public' ORDER BY table_name;
        """))
        tables = [r[0] for r in result.fetchall()]
        print(f"\nTables found: {tables}")
        
        expected = ["users", "topics", "topic_prerequisites", "user_topic_progress", "watch_history", "notes", "flashcards", "quizzes", "quiz_attempts"]
        missing = [t for t in expected if t not in tables]
        
        if missing:
            print(f"\n[WARNING] Missing tables: {missing}")
            print("Run: python database/scripts/seed.py")
        else:
            print("\n[OK] All tables exist! Your DB is ready.")
            
            # Count data
            for table in ["users", "topics", "user_topic_progress"]:
                result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.fetchone()[0]
                print(f"   - {table}: {count} rows")
        
        print("\nNeon database is ready and working!")
        
except Exception as e:
    print(f"\n[ERROR] Neon connection failed: {e}")
