# Member 2 — Backend & AI Engine Work Guide

## Your Role
You are responsible for the server-side intelligence of LearnFlow AI:
- **Backend API** — Central FastAPI server handling all requests
- **AI Processing Engine** — All AI/ML pipelines that generate educational content

---

## Your Directories

| Directory | Purpose |
|-----------|--------|
| `backend/` | FastAPI application — routes, models, services |
| `ai-engine/` | AI pipelines — LLM integration, content generation |
| `shared/` | Shared utilities (coordinate with team) |

---

## Branch Workflow

1. Always work on `member2/backend-ai` branch
2. Pull latest: `git pull origin member2/backend-ai`
3. Make changes in `backend/` and `ai-engine/`
4. Commit: `git commit -m "feat(backend): add notes generation endpoint"`
5. Push: `git push origin member2/backend-ai`
6. Create a Pull Request to `main` when a feature is complete

---

## Backend API Development

### Tech Stack
- **Python 3.10+**
- **FastAPI** — Async web framework
- **SQLAlchemy** — ORM for PostgreSQL
- **Pydantic** — Data validation & schemas
- **Alembic** — Database migrations
- **python-jose** — JWT authentication
- **passlib** — Password hashing

### Application Structure

#### Entry Point (`backend/app/main.py`)
- Create FastAPI app instance
- Include all routers
- Configure CORS middleware (allow extension & dashboard origins)
- Set up database connection on startup

#### API Routes (`backend/app/api/routes/`)

| File | Endpoints | Description |
|------|----------|------------|
| `auth.py` | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` | User authentication |
| `content.py` | `POST /api/content/analyze` | Receive content from extension, trigger AI pipeline |
| `notes.py` | `GET /api/notes/{content_id}`, `GET /api/notes/user/all` | Retrieve generated notes |
| `flashcards.py` | `GET /api/flashcards/{content_id}`, `PUT /api/flashcards/{id}/learned` | Flashcard CRUD & learning status |
| `quiz.py` | `GET /api/quiz/{content_id}`, `POST /api/quiz/submit` | Quiz generation & scoring |
| `recommendations.py` | `GET /api/recommendations` | Get personalized recommendations |
| `analytics.py` | `POST /api/analytics/event`, `GET /api/analytics/study-time`, `GET /api/analytics/focus`, `GET /api/analytics/streaks`, `GET /api/analytics/performance`, `GET /api/analytics/subjects`, `GET /api/analytics/recent`, `GET /api/analytics/heatmap` | Analytics events & metrics |

#### Database Models (`backend/app/models/`)

| Model | Fields |
|-------|--------|
| `User` | id, email, password_hash, name, role, created_at |
| `Note` | id, user_id, content_id, content_url, title, summary, detailed_notes, created_at |
| `Flashcard` | id, user_id, content_id, question, answer, is_learned, created_at |
| `Quiz` | id, user_id, content_id, questions_json, created_at |
| `QuizResult` | id, quiz_id, user_id, score, answers_json, completed_at |
| `StudySession` | id, user_id, content_id, start_time, end_time, focus_rate, completion_rate, active_time_minutes |
| `LearningStats` | id, user_id, date, study_time_minutes, streak_days, topics_json |
| `AnalyticsEvent` | id, user_id, event_type, event_data_json, timestamp |

#### Pydantic Schemas (`backend/app/schemas/`)
Create request/response schemas for each route. Example:
```python
class ContentAnalyzeRequest(BaseModel):
    url: str
    content_type: str  # "youtube", "article", "pdf"
    raw_text: Optional[str] = None
    transcript: Optional[str] = None

class NoteResponse(BaseModel):
    id: str
    title: str
    summary: str
    detailed_notes: str
    created_at: datetime
```

#### Services (`backend/app/services/`)
Business logic layer between routes and AI engine:
- `content_service.py` — Orchestrates content processing pipeline
- `note_service.py` — Note CRUD operations
- `flashcard_service.py` — Flashcard CRUD operations
- `quiz_service.py` — Quiz generation & scoring logic
- `analytics_service.py` — Metric aggregation & processing

#### Core Config (`backend/app/core/`)
- `config.py` — Environment variables, API keys, DB URL
- `security.py` — JWT token creation/validation, password hashing
- `database.py` — SQLAlchemy engine & session setup

---

## AI Engine Development

### Tech Stack
- **OpenAI API** (GPT-4 / GPT-3.5) — LLM for content generation
- **LangChain** — LLM orchestration framework
- **YouTube Transcript API** — Extract YouTube transcripts
- **Whisper** — Audio transcription (for lectures)
- **ChromaDB** — Vector database for embeddings
- **tiktoken** — Token counting for chunking

### AI Pipeline Flow

```
Input (URL/text) → Transcript Extraction → Text Cleaning → Chunking → Embedding → LLM Analysis
```

#### Pipeline Implementation (`ai-engine/pipelines/`)

| File | Purpose |
|------|--------|
| `content_pipeline.py` | Main orchestrator — runs the full pipeline |
| `youtube_pipeline.py` | YouTube-specific: extract transcript, process |
| `article_pipeline.py` | Article/web page processing |
| `pdf_pipeline.py` | PDF extraction and processing |

#### Processors (`ai-engine/processors/`)

| File | Purpose |
|------|--------|
| `transcript_extractor.py` | YouTube Transcript API / Whisper integration |
| `text_cleaner.py` | Remove noise, normalize text, fix formatting |
| `chunker.py` | Split text into optimal chunks (by token count) |
| `embedding_generator.py` | Generate embeddings via OpenAI / sentence-transformers |

#### Generators (`ai-engine/generators/`)

| File | Purpose |
|------|--------|
| `summary_generator.py` | Short summaries, detailed summaries, study notes |
| `note_generator.py` | Structured notes with headings, bullet points |
| `flashcard_generator.py` | Q&A flashcards, revision cards |
| `quiz_generator.py` | MCQ, True/False, conceptual questions |
| `topic_detector.py` | Extract main concepts, keywords, learning domains |
| `formula_extractor.py` | Detect math/science formulas from text |

#### Prompt Templates (`ai-engine/prompts/`)
Store LLM prompts as separate files for easy iteration:
- `summary_prompt.txt`
- `notes_prompt.txt`
- `flashcard_prompt.txt`
- `quiz_prompt.txt`
- `topic_prompt.txt`
- `formula_prompt.txt`
- `adaptive_beginner_prompt.txt`
- `adaptive_intermediate_prompt.txt`
- `adaptive_advanced_prompt.txt`

#### Model Configs (`ai-engine/models/`)
- `llm_config.py` — OpenAI model selection, temperature, max tokens
- `embedding_config.py` — Embedding model configuration

### Adaptive Learning
Generate explanations at 3 difficulty levels:
- **Beginner**: Simple everyday language, analogies
- **Intermediate**: Technical terms, code examples
- **Advanced**: Academic depth, mathematical formulations

---

## API Response Formats

Standardize all API responses:
```python
# Success
{
    "status": "success",
    "data": { ... },
    "message": "Notes generated successfully"
}

# Error
{
    "status": "error",
    "detail": "Content not found",
    "code": 404
}
```

---

## Coordination with Other Members

| You Need From | What | Member |
|---------------|------|--------|
| Database schemas & migrations | Table definitions, connection strings | Member 3 |
| Auth middleware | JWT validation, user session management | Member 3 |
| Vector DB setup | ChromaDB/Pinecone configuration | Member 3 |
| Analytics event format | What events to process and store | Member 4 |

| Others Need From You | What | Member |
|---------------------|------|--------|
| API endpoint documentation | All routes, request/response schemas | Member 1 |
| Generated content format | JSON structure of notes, flashcards, quizzes | Member 1 |
| Analytics API endpoints | Routes for fetching processed metrics | Member 4 |
| Webhook/callback format | How AI results are delivered | Member 1 |

---

## Environment Variables (.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/learnflow_ai
OPENAI_API_KEY=sk-...
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440
CHROMA_PERSIST_DIR=./chroma_data
CORS_ORIGINS=http://localhost:3000,chrome-extension://your-extension-id
```

---

## Getting Started

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Create backend/app/main.py
uvicorn app.main:app --reload --port 8000
```

### AI Engine
```bash
cd ai-engine
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Set OPENAI_API_KEY in .env
```

---

## File Naming Conventions
- Modules: `snake_case.py` (e.g., `content_pipeline.py`)
- Classes: `PascalCase` (e.g., `ContentPipeline`)
- Functions: `snake_case` (e.g., `generate_summary`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_CHUNK_SIZE`)
- Prompts: `snake_case.txt` (e.g., `summary_prompt.txt`)
