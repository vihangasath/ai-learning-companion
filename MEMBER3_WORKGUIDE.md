# Member 3 — Database, Authentication & Recommendation Engine Work Guide

## Your Role
You are responsible for the data foundation and security of LearnFlow AI:
- **Database System** — PostgreSQL schemas, migrations, vector DB setup
- **Authentication Service** — User auth, JWT, OAuth, RBAC
- **Recommendation Engine** — Personalized learning path suggestions

---

## Your Directories

| Directory | Purpose |
|-----------|--------|
| `database/` | PostgreSQL schemas, migrations, seeds, vector DB config |
| `auth/` | Authentication providers, middleware, security |
| `recommendation/` | Recommendation algorithms and models |
| `shared/` | Shared utilities (coordinate with team) |

---

## Branch Workflow

1. Always work on `member3/database-auth` branch
2. Pull latest: `git pull origin member3/database-auth`
3. Make changes in `database/`, `auth/`, `recommendation/`
4. Commit: `git commit -m "feat(database): add study_sessions schema"`
5. Push: `git push origin member3/database-auth`
6. Create a Pull Request to `main` when a feature is complete

---

## Database Development

### Tech Stack
- **PostgreSQL 15+** — Primary relational database
- **SQLAlchemy 2.0** — Python ORM
- **Alembic** — Database migration tool
- **ChromaDB** — Vector database for embeddings
- **Pinecone** (alternative) — Managed vector database

### Database Schemas (`database/schemas/`)

You need to create SQL schema definitions for all tables:

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### notes
```sql
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id VARCHAR(255) NOT NULL,
    content_url TEXT NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    title VARCHAR(500),
    summary TEXT,
    detailed_notes TEXT,
    topics JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### flashcards
```sql
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'medium',
    is_learned BOOLEAN DEFAULT FALSE,
    last_reviewed_at TIMESTAMP,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### quizzes
```sql
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id VARCHAR(255) NOT NULL,
    questions JSONB NOT NULL,
    quiz_type VARCHAR(30) DEFAULT 'mixed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### quiz_results
```sql
CREATE TABLE quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    answers JSONB NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### study_sessions
```sql
CREATE TABLE study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id VARCHAR(255),
    content_url TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    focus_rate DECIMAL(5,2),
    completion_rate DECIMAL(5,2),
    active_time_minutes INTEGER,
    events JSONB DEFAULT '[]'
);
```

#### learning_stats
```sql
CREATE TABLE learning_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    study_time_minutes INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    focus_score DECIMAL(5,2),
    topics_studied JSONB DEFAULT '[]',
    videos_completed INTEGER DEFAULT 0,
    UNIQUE(user_id, date)
);
```

#### analytics_events
```sql
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id UUID REFERENCES study_sessions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### bookmarks
```sql
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id VARCHAR(255) NOT NULL,
    content_url TEXT NOT NULL,
    timestamp_seconds INTEGER,
    category VARCHAR(50),
    label TEXT,
    ai_generated_label TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes
```sql
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_content_id ON notes(content_id);
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_learning_stats_user_date ON learning_stats(user_id, date);
CREATE INDEX idx_analytics_events_user_type ON analytics_events(user_id, event_type);
```

### Migrations (`database/migrations/`)
```bash
alembic init database/migrations
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

### Seed Data (`database/seeds/`)
- `seed_users.py` — Test user accounts
- `seed_content.py` — Sample notes, flashcards, quizzes
- `seed_analytics.py` — Sample study sessions and stats

### Vector Database (`database/vector-db/`)

#### ChromaDB Setup
```python
import chromadb

client = chromadb.PersistentClient(path="./chroma_data")

content_collection = client.get_or_create_collection(
    name="content_embeddings",
    metadata={"hnsw:space": "cosine"}
)

knowledge_collection = client.get_or_create_collection(
    name="knowledge_graph",
    metadata={"hnsw:space": "cosine"}
)
```

---

## Authentication Development

### Tech Stack
- **python-jose** — JWT token creation and validation
- **passlib[bcrypt]** — Password hashing
- **OAuth 2.0** — Google, GitHub login
- **Firebase Auth** (optional) — Managed auth service

### Auth Providers (`auth/providers/`)

| File | Purpose |
|------|--------|
| `jwt_provider.py` | JWT token creation, validation, refresh |
| `oauth_provider.py` | OAuth 2.0 with Google, GitHub |
| `firebase_provider.py` | Firebase Auth integration (optional) |

### Auth Middleware (`auth/middleware/`)

| File | Purpose |
|------|--------|
| `auth_middleware.py` | Validate JWT on protected routes |
| `role_middleware.py` | Check user role (student/admin) for authorization |

### JWT Token Structure
```python
{
    "sub": "user_id_uuid",
    "email": "user@example.com",
    "role": "student",
    "exp": 1234567890,
    "iat": 1234567890
}
```

### RBAC (Role-Based Access Control)

| Role | Access Level |
|------|-------------|
| `student` | Own data: notes, flashcards, quizzes, analytics |
| `admin` | All data + user management + system settings |

### Password Security
- Hash with bcrypt (12 rounds)
- Never store plaintext passwords
- Minimum 8 characters, require mixed case + numbers

---

## Recommendation Engine Development

### How It Works

```
User Learning History + Quiz Results + Knowledge Graph
    ↓
Analysis (weak areas, strong subjects, preferences)
    ↓
Recommendation Algorithm
    ↓
Suggested: Videos, Articles, Learning Paths, Courses
```

### Engine Implementation (`recommendation/engine/`)

| File | Purpose |
|------|--------|
| `recommender.py` | Main recommendation algorithm |
| `knowledge_graph.py` | Build and query topic relationship graph |
| `user_profile.py` | Analyze user's learning profile |
| `content_matcher.py` | Match user needs to available content |

### Knowledge Graph
```
Linear Algebra → Gradient Descent → Neural Networks
Calculus → Optimization → Backpropagation
Statistics → Probability → Bayesian Networks
Python → NumPy → Data Science
```

### Recommendation Types

| Type | Logic |
|------|-------|
| **Weak Area Improvement** | Topics where quiz scores < 60% |
| **Next in Path** | Follow knowledge graph edges from completed topics |
| **Similar Topics** | Semantic similarity to recently studied content |
| **Popular Content** | Highly-rated content in user's interest areas |
| **Streak Maintenance** | Quick content to maintain daily learning streak |

### Recommendation Response Format
```json
{
    "recommendations": [
        {
            "type": "weak_area",
            "topic": "Gradient Descent",
            "reason": "Your quiz score was 45% — review recommended",
            "resources": [
                {"title": "...", "url": "...", "type": "video"}
            ]
        }
    ]
}
```

---

## Coordination with Other Members

| You Need From | What | Member |
|---------------|------|--------|
| Data model requirements | What fields each service needs | Member 2 |
| Analytics event types | What events to store | Member 4 |
| User interaction patterns | What UI flows need auth | Member 1 |

| Others Need From You | What | Member |
|---------------------|------|--------|
| Database connection & ORM models | SQLAlchemy models, connection setup | Member 2 |
| Auth middleware | JWT validation functions for route protection | Member 2 |
| Vector DB client | ChromaDB client setup for embedding storage | Member 2 |
| Recommendation API data | Recommendation response format | Member 1 |
| User data schemas | User profile fields for analytics | Member 4 |

---

## Getting Started

### PostgreSQL Setup
```bash
brew install postgresql@15
brew services start postgresql@15
createdb learnflow_ai
psql learnflow_ai < database/schemas/001_initial.sql
```

### Alembic Setup
```bash
pip install alembic sqlalchemy psycopg2-binary
alembic init database/migrations
# Edit alembic.ini with your database URL
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

### ChromaDB Setup
```bash
pip install chromadb
# See database/vector-db/ for configuration
```

---

## File Naming Conventions
- SQL schemas: `NNN_description.sql` (e.g., `001_initial.sql`)
- Python modules: `snake_case.py`
- Seed scripts: `seed_tablename.py`
- Migration names: descriptive (e.g., `add_bookmarks_table`)
