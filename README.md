# LearnFlow AI

> AI-Powered Personalized Learning Ecosystem

LearnFlow AI is an intelligent browser extension and learning platform that transforms passive educational content consumption into an active, personalized, and AI-assisted learning experience.

---

## 🏗️ Project Structure

```
LearnFlow AI/
│
├── docs/                          # Project documentation
│
├── extension/                     # 🔵 Browser Extension (Member 1)
│   ├── public/                    # Static assets & manifest.json
│   ├── src/
│   │   ├── components/            # React UI components
│   │   ├── content-scripts/       # Content scripts for page interaction
│   │   ├── background/            # Service worker / background scripts
│   │   ├── popup/                 # Extension popup interface
│   │   ├── sidepanel/             # AI Side Panel UI
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── utils/                 # Utility functions
│   │   ├── styles/                # CSS / Tailwind styles
│   │   └── types/                 # TypeScript type definitions
│   └── tests/                     # Extension tests
│
├── dashboard/                     # 🔵 Learning Dashboard (Member 1)
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── components/            # Dashboard React components
│   │   ├── pages/                 # Dashboard pages/routes
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── utils/                 # Utility functions
│   │   ├── styles/                # CSS / Tailwind styles
│   │   └── types/                 # TypeScript type definitions
│   └── tests/                     # Dashboard tests
│
├── backend/                       # 🟢 Backend API (Member 2)
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/            # API route handlers
│   │   ├── core/                  # App config, security, settings
│   │   ├── models/                # SQLAlchemy / DB models
│   │   ├── schemas/               # Pydantic schemas
│   │   ├── services/              # Business logic services
│   │   └── utils/                 # Utility functions
│   ├── tests/                     # Backend tests
│   └── requirements.txt           # Python dependencies
│
├── ai-engine/                     # 🟢 AI Processing Engine (Member 2)
│   ├── pipelines/                 # AI processing pipelines
│   ├── models/                    # ML model configs & wrappers
│   ├── prompts/                   # LLM prompt templates
│   ├── processors/                # Text processors (chunking, cleaning)
│   ├── generators/                # Content generators (notes, quiz, flashcards)
│   ├── utils/                     # AI utility functions
│   └── tests/                     # AI engine tests
│
├── database/                      # 🟡 Database & Knowledge System (Member 3)
│   ├── migrations/                # Database migration files
│   ├── schemas/                   # SQL schema definitions
│   ├── seeds/                     # Seed data for development
│   ├── scripts/                   # DB utility scripts
│   └── vector-db/                 # Vector database configuration
│
├── auth/                          # 🟡 Authentication Service (Member 3)
│   ├── providers/                 # Auth providers (JWT, OAuth, Firebase)
│   ├── middleware/                 # Auth middleware
│   ├── utils/                     # Auth utility functions
│   └── tests/                     # Auth tests
│
├── recommendation/                # 🟡 Recommendation Engine (Member 3)
│   ├── engine/                    # Recommendation algorithms
│   ├── models/                    # Recommendation models
│   ├── utils/                     # Utility functions
│   └── tests/                     # Recommendation tests
│
├── analytics/                     # 🔴 Analytics Engine (Member 4)
│   ├── collectors/                # Event collection modules
│   ├── processors/                # Analytics data processors
│   ├── metrics/                   # Metric calculation modules
│   ├── visualizations/            # Chart components & configs
│   ├── utils/                     # Utility functions
│   └── tests/                     # Analytics tests
│
├── advanced-features/             # 🔴 Advanced Features (Member 4)
│   ├── formula-extraction/        # Formula detection & extraction
│   ├── semantic-search/           # Semantic search system
│   ├── mind-maps/                 # Mind map generation
│   ├── smart-bookmarks/           # Smart bookmarking system
│   ├── research-summarizer/       # Research paper summarization
│   ├── voice-interaction/         # Voice command features
│   └── tests/                     # Advanced features tests
│
└── shared/                        # 🔗 Shared utilities (All members)
    ├── constants/                 # Shared constants
    ├── types/                     # Shared type definitions
    └── utils/                     # Shared utility functions
```

---

## 👥 Team Responsibilities

| Member | Area | Directories |
|--------|------|-------------|
| **Member 1** | Frontend & Browser Extension | `extension/`, `dashboard/` |
| **Member 2** | Backend & AI Engine | `backend/`, `ai-engine/` |
| **Member 3** | Database & Knowledge System | `database/`, `auth/`, `recommendation/` |
| **Member 4** | Analytics & Advanced Features | `analytics/`, `advanced-features/` |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Extension** | React, TypeScript, Tailwind CSS, Chrome APIs |
| **Dashboard** | React, Tailwind CSS, Recharts, Framer Motion |
| **Backend** | Python, FastAPI |
| **AI Engine** | OpenAI API, LangChain, Whisper |
| **Database** | PostgreSQL, ChromaDB/Pinecone |
| **Auth** | JWT, OAuth, Firebase/Auth0 |

---

## 🚀 Getting Started

1. Clone the repository
2. Navigate to your team's directory
3. Follow the README in your specific folder for setup instructions

---

## 📄 Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Advanced Features](docs/ADVANCED_FEATURES.md)
- [Analytics Dashboard UI](docs/ANALYTICS_DASHBOARD_UI.md)
- [Analytics Overview](docs/ANALYTICS_OVERVIEW.md)
- [Productivity Tracking](docs/PRODUCTIVITY_TRACKING_SYSTEM.md)
- [Future Scope](docs/FUTURE_SCOPE.md)
