"""
Database Connection - Neon Postgres ready (FIXED for Windows .env issues)
Works with: 
- SQLite (local): sqlite:///./learnflow.db
- Neon Postgres: postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os
from pathlib import Path
from dotenv import load_dotenv

# === Force load .env from project root ===
PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = PROJECT_ROOT / ".env"

if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH, override=False)
else:
    load_dotenv(override=False)


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./learnflow.db")

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


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

