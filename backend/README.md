# Backend API (Member 2)

> Central API Layer — FastAPI Backend

## Owner
Member 2 — Backend & AI Engineer

## Tech Stack
- Python
- FastAPI
- SQLAlchemy
- Pydantic

## Structure
```
backend/
├── app/
│   ├── api/
│   │   └── routes/      # API endpoint handlers
│   ├── core/            # Config, security, settings
│   ├── models/          # Database ORM models
│   ├── schemas/         # Pydantic request/response schemas
│   ├── services/        # Business logic layer
│   └── utils/           # Utility functions
├── tests/               # API tests
└── requirements.txt     # Python dependencies
```

## Responsibilities
- Handle all API requests from extension & dashboard
- User authentication coordination
- Coordinate AI processing pipeline
- Manage database access (CRUD operations)
- Serve analytics data to dashboard

## API Modules
- **Auth Routes** — Registration, login, session validation
- **Notes Routes** — Note generation, storage, retrieval
- **Flashcard Routes** — Flashcard CRUD & learning history
- **Quiz Routes** — Quiz generation, evaluation, scoring
- **Recommendation Routes** — Learning paths & topic suggestions
- **Analytics Routes** — Productivity & learning metrics

## Setup
1. `cd backend`
2. `python -m venv venv`
3. `source venv/bin/activate`
4. `pip install -r requirements.txt`
5. `uvicorn app.main:app --reload`
