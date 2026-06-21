# Database & Knowledge System (Member 3)

> Data Persistence & Knowledge Management

## Owner
Member 3 — Database & Knowledge System Engineer

## Tech Stack
- PostgreSQL
- SQLAlchemy (ORM)
- Alembic (Migrations)
- ChromaDB / Pinecone (Vector DB)

## Structure
```
database/
├── migrations/      # Alembic migration files
├── schemas/         # SQL schema definitions
├── seeds/           # Seed data for development/testing
├── scripts/         # DB utility & maintenance scripts
└── vector-db/       # Vector database configuration
```

## Data Stored
### PostgreSQL
- Users & profiles
- Notes
- Flashcards
- Quiz results & scores
- Learning statistics
- Study sessions

### Vector Database
- Content embeddings
- Semantic representations
- Knowledge graph vectors

### File Storage
- PDFs
- Generated assets
- Uploaded documents

## Key Schemas
- `users` — User accounts & profiles
- `notes` — AI-generated notes
- `flashcards` — Generated flashcards
- `quizzes` — Quiz questions & results
- `study_sessions` — Session tracking data
- `learning_stats` — Aggregated learning metrics

## Setup
1. Install PostgreSQL
2. Create database: `createdb learnflow_ai`
3. Run migrations: `alembic upgrade head`
4. (Optional) Seed data: `python scripts/seed.py`
