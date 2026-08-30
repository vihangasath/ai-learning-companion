"""
Database Connection - Neon Postgres ready (FIXED for Windows .env issues)
Works with: 
- SQLite (local): sqlite:///./learnflow.db
- Neon Postgres: postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from pathlib import Path
from dotenv import load_dotenv

# === FIXED: Force load .env from project root, not current working dir ===
# Project root = folder where main.py is (LearnFlow-Member3/)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = PROJECT_ROOT / ".env"

# Load with override=True so .env wins over system env
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH, override=True)
    print(f"✅ Found .env at: {ENV_PATH}")
else:
    # Try also current directory
    load_dotenv(override=True)
    print(f"⚠️ .env not found at {ENV_PATH}, tried current dir. Using default SQLite.")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./learnflow.db")

# Debug print - shows which DB you're actually using
if "neon.tech" in DATABASE_URL:
    print(f"🔌 Connecting to NEON: {DATABASE_URL[:60]}...")
elif "postgres" in DATABASE_URL or "postgresql" in DATABASE_URL:
    print(f"🔌 Connecting to POSTGRES: {DATABASE_URL[:60]}...")
else:
    print(f"🔌 Connecting to SQLITE: {DATABASE_URL}")

# Neon fix: postgres:// -> postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

if "neon.tech" in DATABASE_URL or "postgres" in DATABASE_URL or "postgresql" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL, 
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10
    )
else:
    engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
