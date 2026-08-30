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
    print("❌ You are still on SQLite, not Neon!")
    print(f"Current: {DATABASE_URL}")
    print("👉 Edit .env file and set DATABASE_URL to your Neon URL")
    exit(1)

# Fix postgres:// -> postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"🔌 Testing connection to: {DATABASE_URL[:50]}...")

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    with engine.connect() as conn:
        # Test connection
        result = conn.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print(f"✅ Connected to Neon! Postgres version: {version[:60]}...")
        
        # Check tables
        result = conn.execute(text("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema='public' ORDER BY table_name;
        """))
        tables = [r[0] for r in result.fetchall()]
        print(f"\n📊 Tables found: {tables}")
        
        expected = ["users", "topics", "topic_prerequisites", "user_topic_progress", "watch_history", "notes", "flashcards", "quizzes", "quiz_attempts"]
        missing = [t for t in expected if t not in tables]
        
        if missing:
            print(f"\n⚠️ Missing tables: {missing}")
            print("👉 Run: python database\\scripts\\seed.py  (Windows) or python database/scripts/seed.py")
        else:
            print("\n✅ All 8 tables exist! Your DB is ready.")
            
            # Count data
            for table in ["users", "topics", "user_topic_progress"]:
                result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.fetchone()[0]
                print(f"   - {table}: {count} rows")
        
        print("\n🎉 Neon is working! Now run: python run.py")
        
except Exception as e:
    print(f"\n❌ Neon connection failed: {e}")
    print("\nTroubleshooting:")
    print("1. Check .env file has: DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require")
    print("2. Must include ?sslmode=require at end")
    print("3. Use DIRECT connection, not pooled (Neon dashboard toggle)")
    print("4. Try copying URL again from Neon console")
