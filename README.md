# LearnFlow AI

> AI-Powered Personalized Learning Ecosystem

LearnFlow AI is an intelligent browser extension and learning platform that transforms passive educational content consumption into an active, personalized, and AI-assisted learning experience. It detects YouTube videos and articles, then generates AI-powered study kits — summaries, flashcards, quizzes, and more.

---

## 🏗️ Project Structure

```
LearnFlow AI/
│
├── extension/                         # Chrome Extension (Side Panel)
│   ├── src/
│   │   ├── background/               # Service worker (side panel registration)
│   │   ├── content-scripts/           # Page text & transcript extraction
│   │   ├── App.tsx                    # React side panel UI
│   │   └── main.tsx                   # Entry point
│   ├── public/icons/                  # Extension icons (16–128px)
│   ├── vite.config.ts                 # CRXJS manifest + Vite config
│   └── package.json
│
├── dashboard/                         # Learning Dashboard (Web App)
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   ├── pages/                     # Dashboard pages (Analytics, Quizzes, etc.)
│   │   ├── hooks/                     # Custom React hooks
│   │   └── services/                  # API client
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                           # Python Backend (FastAPI)
│   ├── app/
│   │   ├── main.py                    # FastAPI application entry
│   │   ├── core/                      # Config, database engine, security
│   │   ├── api/routes/                # REST API endpoints
│   │   ├── models/                    # SQLAlchemy ORM models
│   │   ├── schemas/                   # Pydantic request/response schemas
│   │   ├── services/                  # Business logic layer
│   │   ├── auth/                      # JWT authentication & middleware
│   │   ├── database/                  # DB connection, seeds, vector-db client
│   │   ├── recommendation/            # Knowledge graph & recommendation engine
│   │   ├── shared/                    # Constants, types, utility helpers
│   │   ├── ai_engine/                 # AI/LLM processing engine
│   │   │   ├── generators/            # Summary, notes, flashcard, quiz generators
│   │   │   ├── pipelines/             # Content processing pipelines
│   │   │   ├── processors/            # Text cleaning, chunking, embeddings
│   │   │   ├── models/                # LLM & embedding configuration
│   │   │   └── prompts/               # LLM prompt templates
│   │   ├── analytics/                 # Analytics & learning metrics
│   │   │   ├── collectors/            # Event collection modules
│   │   │   ├── processors/            # Data processing pipelines
│   │   │   ├── metrics/               # Metric calculation functions
│   │   │   └── visualizations/        # Chart data formatters
│   │   └── advanced_features/         # Extended capabilities
│   │       ├── formula_extraction/    # LaTeX formula detection & extraction
│   │       ├── semantic_search/       # ChromaDB-backed vector search
│   │       ├── mind_maps/             # Mind map generation & layout
│   │       ├── smart_bookmarks/       # Auto-categorized bookmarks
│   │       ├── research_summarizer/   # Academic paper summarization
│   │       └── voice_interaction/     # Voice command parsing
│   └── tests/                         # Backend integration tests
│
├── scripts/                           # Utility scripts
│   ├── check_neon.py                  # PostgreSQL/Neon connection tester
│   └── demo.py                        # Member 4 feature demo runner
│
├── docs/                              # Documentation
│   ├── ARCHITECTURE.md                # System architecture overview
│   ├── ADVANCED_FEATURES.md           # Advanced features specification
│   ├── ANALYTICS_OVERVIEW.md          # Analytics module overview
│   ├── ANALYTICS_DASHBOARD_UI.md      # Dashboard UI wireframes
│   ├── PRODUCTIVITY_TRACKING_SYSTEM.md# Focus & streak algorithms
│   ├── FUTURE_SCOPE.md                # Roadmap
│   └── guides/                        # Team member work guides
│
├── .env.example                       # Environment variable template
├── requirements.txt                   # Python dependencies
├── run.py                             # Backend server launcher
└── run_tests.py                       # Test suite runner
```

---

## 👥 Team Responsibilities

| Member | Area | Directories |
|--------|------|-------------|
| **Member 1** | Frontend & Browser Extension | `extension/`, `dashboard/` |
| **Member 2** | Backend & AI Engine | `backend/app/main.py`, `backend/app/api/`, `backend/app/ai_engine/` |
| **Member 3** | Database & Knowledge System | `backend/app/database/`, `backend/app/auth/`, `backend/app/recommendation/` |
| **Member 4** | Analytics & Advanced Features | `backend/app/analytics/`, `backend/app/advanced_features/` |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Extension** | React 19, TypeScript, CRXJS, Chrome MV3 APIs |
| **Dashboard** | React 19, TypeScript, Tailwind CSS, Recharts |
| **Backend** | Python, FastAPI, Uvicorn |
| **AI Engine** | Gemini / OpenAI, LangChain, tiktoken |
| **Database** | SQLite (dev) / PostgreSQL (prod), ChromaDB |
| **Auth** | JWT (python-jose), bcrypt |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- A Gemini or OpenAI API key

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd ai-learning-companion

# 2. Create a virtual environment and install dependencies
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY or OPENAI_API_KEY

# 4. Start the backend
python run.py
# Backend runs at http://localhost:8000
# API docs at http://localhost:8000/docs

# 5. Build and load the Chrome extension
cd extension
npm install
npm run build
# Load extension/dist/ as an unpacked extension in chrome://extensions/

# 6. (Optional) Run the learning dashboard
cd dashboard
npm install
npm run dev
# Dashboard runs at http://localhost:5173
```

### Running Tests

```bash
# Run the full test suite
PYTHONPATH=. python run_tests.py

# Run the Member 4 feature demo
PYTHONPATH=. python scripts/demo.py
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and get JWT token |
| `GET` | `/api/auth/me` | Get current user |
| `POST` | `/api/content/analyze` | Analyze content and generate study kit |
| `GET` | `/api/notes/user/all` | Get all user notes |
| `GET` | `/api/flashcards/user/all` | Get all user flashcards |
| `GET` | `/api/quiz/user/all` | Get all user quizzes |
| `POST` | `/api/quiz/submit` | Submit quiz answers |
| `GET` | `/api/recommendations` | Get personalized recommendations |
| `GET` | `/api/knowledge/graph` | Get knowledge graph |
| `GET` | `/api/analytics/study-time` | Get study time analytics |
| `GET` | `/api/search` | Search across notes, flashcards, topics |

---

## 📄 Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Advanced Features](docs/ADVANCED_FEATURES.md)
- [Analytics Overview](docs/ANALYTICS_OVERVIEW.md)
- [Analytics Dashboard UI](docs/ANALYTICS_DASHBOARD_UI.md)
- [Productivity Tracking](docs/PRODUCTIVITY_TRACKING_SYSTEM.md)
- [Future Scope](docs/FUTURE_SCOPE.md)
