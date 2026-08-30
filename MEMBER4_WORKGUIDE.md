# Member 4 — Analytics & Advanced Features Work Guide

## Your Role
You are responsible for making LearnFlow AI intelligent and data-driven:
- **Analytics Engine** — Track, measure, and analyze learning behavior
- **Advanced Features** — AI-powered educational tools (formula extraction, semantic search, mind maps, etc.)

---

## Your Directories

| Directory | Purpose |
|-----------|--------|
| `analytics/` | Event collection, metric processing, dashboard data |
| `advanced-features/` | Formula extraction, semantic search, mind maps, bookmarks, voice |
| `shared/` | Shared utilities (coordinate with team) |

---

## Branch Workflow

1. Always work on `member4/analytics-features` branch
2. Pull latest: `git pull origin member4/analytics-features`
3. Make changes in `analytics/` and `advanced-features/`
4. Commit: `git commit -m "feat(analytics): add focus rate calculator"`
5. Push: `git push origin member4/analytics-features`
6. Create a Pull Request to `main` when a feature is complete

---

## Analytics Engine Development

### Tech Stack
- **Python** — Core processing logic
- **FastAPI** — Analytics API endpoints (integrated with Member 2's backend)
- **PostgreSQL** — Metrics storage
- **React + Recharts** — Visualization components (coordinate with Member 1)

### Event Collection (`analytics/collectors/`)

Capture user learning events from the browser extension:

| File | Events Collected |
|------|----------------|
| `video_collector.py` | play, pause, seek, complete, rewatch |
| `user_activity_collector.py` | mouse movement, keyboard interaction, tab visibility |
| `ai_interaction_collector.py` | summary generated, quiz generated, flashcard opened |
| `session_collector.py` | session start, session end, session duration |

#### Event Schema
```python
class AnalyticsEvent:
    event_type: str        # "video_play", "tab_switch", "quiz_generated"
    user_id: str
    session_id: str
    content_id: str
    timestamp: datetime
    metadata: dict         # event-specific data
```

#### Event Types
```python
# Video Events
VIDEO_PLAY = "video_play"
VIDEO_PAUSE = "video_pause"
VIDEO_SEEK = "video_seek"
VIDEO_COMPLETE = "video_complete"

# User Activity Events
TAB_VISIBLE = "tab_visible"
TAB_HIDDEN = "tab_hidden"
USER_ACTIVE = "user_active"
USER_IDLE = "user_idle"

# AI Interaction Events
SUMMARY_GENERATED = "summary_generated"
QUIZ_GENERATED = "quiz_generated"
FLASHCARD_OPENED = "flashcard_opened"
NOTE_VIEWED = "note_viewed"
```

### Metric Processing (`analytics/processors/`)

Process raw events into meaningful metrics:

| File | What It Calculates |
|------|------------------|
| `study_time_processor.py` | Daily, weekly, monthly study duration |
| `focus_processor.py` | Focus rate = Active Time / Total Session Time × 100 |
| `consistency_processor.py` | Streak days, consistency score, missed days |
| `completion_processor.py` | Video completion rate = Watched / Total Duration × 100 |
| `performance_processor.py` | Quiz accuracy, topic mastery, learning trends |
| `productivity_processor.py` | Most productive hours, session patterns |

### Metric Calculation (`analytics/metrics/`)

| File | Metrics |
|------|--------|
| `study_metrics.py` | Total study time, average daily study, peak hours |
| `focus_metrics.py` | Focus rate, idle time, distraction frequency |
| `streak_metrics.py` | Current streak, longest streak, streak history |
| `performance_metrics.py` | Average quiz score, topic mastery %, improvement rate |
| `engagement_metrics.py` | Videos completed, notes generated, flashcards reviewed |

### Key Formulas

```python
# Focus Rate
focus_rate = (active_study_time / total_session_time) * 100

# Consistency Score
consistency_score = (active_days / total_days) * 100

# Video Completion Rate
completion_rate = (watched_duration / total_video_duration) * 100

# Learning Velocity (topics per week)
learning_velocity = topics_completed / weeks_active

# Mastery Score (per topic)
mastery_score = (quiz_avg * 0.4) + (completion_rate * 0.3) + (review_count * 0.3)
```

### Visualization Data Providers (`analytics/visualizations/`)

Provide chart-ready data (coordinate with Member 1 for UI rendering):

| File | Chart Type | Data Provided |
|------|-----------|---------------|
| `weekly_activity.py` | Line chart data | Daily study minutes for 7 days |
| `subject_performance.py` | Bar chart data | Quiz accuracy by subject |
| `heatmap_data.py` | Heatmap data | Study activity by day (365 days) |
| `topic_distribution.py` | Pie chart data | Time spent per topic |
| `streak_timeline.py` | Timeline data | Streak history over time |
| `focus_gauge.py` | Gauge/meter data | Current focus score 0-100 |

### Data Response Formats

#### Weekly Activity
```json
{
    "data": [
        {"day": "Mon", "minutes": 45},
        {"day": "Tue", "minutes": 62},
        {"day": "Wed", "minutes": 30}
    ]
}
```

#### Overview Stats
```json
{
    "total_study_hours": 23.5,
    "current_streak": 7,
    "videos_completed": 12,
    "focus_score": 85.3
}
```

---

## Advanced Features Development

### 1. Formula Extraction (`advanced-features/formula-extraction/`)

**Goal**: Detect math/science formulas from educational text.

| File | Purpose |
|------|--------|
| `extractor.py` | Main formula extraction logic |
| `patterns.py` | Regex patterns for common formula formats |
| `formatter.py` | Convert extracted formulas to LaTeX/MathML |
| `llm_extractor.py` | Use LLM to identify formulas in natural language |

**Examples**:
- Input: "Force equals mass times acceleration" → Output: `F = ma`
- Input: "The area of a circle is pi times radius squared" → Output: `A = πr²`

**Tech Options**: OCR APIs, LLM prompting, Mathpix API, Regex patterns

---

### 2. Semantic Search (`advanced-features/semantic-search/`)

**Goal**: Concept-based search instead of keyword matching.

| File | Purpose |
|------|--------|
| `search_engine.py` | Main semantic search interface |
| `query_embedder.py` | Embed user search queries |
| `result_ranker.py` | Rank results by semantic similarity |
| `index_manager.py` | Manage vector index for searchable content |

**How it works**:
1. User types: "optimization techniques"
2. Query → embedding vector
3. Cosine similarity search in vector DB
4. Returns: Gradient Descent, Adam Optimizer, Backpropagation

**Tech**: OpenAI embeddings, ChromaDB/Pinecone, cosine similarity

---

### 3. Mind Map Generation (`advanced-features/mind-maps/`)

**Goal**: Convert learning content into visual topic trees.

| File | Purpose |
|------|--------|
| `generator.py` | Generate mind map structure from content |
| `layout.py` | Calculate node positions for visualization |
| `renderer.py` | Render mind map (JSON for React Flow or Mermaid syntax) |

**Output Format** (for React Flow):
```json
{
    "nodes": [
        {"id": "1", "label": "Machine Learning", "position": {"x": 0, "y": 0}},
        {"id": "2", "label": "Supervised Learning", "position": {"x": -100, "y": 100}},
        {"id": "3", "label": "Unsupervised Learning", "position": {"x": 100, "y": 100}}
    ],
    "edges": [
        {"source": "1", "target": "2"},
        {"source": "1", "target": "3"}
    ]
}
```

**Libraries**: React Flow, Mermaid.js, D3.js

---

### 4. Smart Bookmarking (`advanced-features/smart-bookmarks/`)

**Goal**: AI-labeled bookmarks with intelligent categorization.

| File | Purpose |
|------|--------|
| `bookmark_manager.py` | CRUD for bookmarks |
| `auto_labeler.py` | AI-generated labels for bookmarks |
| `categorizer.py` | Auto-categorize: Definition, Concept, Example, Formula, Question |
| `search.py` | Search through bookmarks |

**Categories**: Definitions, Important Concepts, Examples, Questions, Formulas

**Features**: Timestamp saving (video position), AI-generated labels, full-text search

---

### 5. Research Paper Summarization (`advanced-features/research-summarizer/`)

**Goal**: AI-powered analysis of PDFs and research papers.

| File | Purpose |
|------|--------|
| `pdf_extractor.py` | Extract text from PDF files |
| `section_parser.py` | Identify paper sections (Abstract, Methods, Results, etc.) |
| `summarizer.py` | Generate section-by-section summaries |
| `findings_extractor.py` | Extract key findings and contributions |

**Pipeline**: PDF → Text Extraction → Section Detection → Chunking → Embedding → LLM Summary → Structured Notes

---

### 6. Voice Interaction (`advanced-features/voice-interaction/`)

**Goal**: Enable voice commands for learning assistance.

| File | Purpose |
|------|--------|
| `speech_recognizer.py` | Convert speech to text |
| `command_parser.py` | Parse voice commands into actions |
| `tts_engine.py` | Text-to-speech for AI responses |

**Example Commands**: "Explain this again", "Summarize this section", "Generate quiz questions"

**Tech**: Web Speech API, Whisper API, OpenAI TTS

---

## Coordination with Other Members

| You Need From | What | Member |
|---------------|------|--------|
| User events from extension | What interaction events are sent | Member 1 |
| Analytics API endpoints | Backend routes to serve your processed data | Member 2 |
| Database schemas | Tables for storing events and metrics | Member 3 |
| Vector DB access | ChromaDB client for semantic search | Member 3 |

| Others Need From You | What | Member |
|---------------------|------|--------|
| Processed metrics data | Chart-ready data formats | Member 1 |
| Analytics event definitions | What events to log and their schema | Member 1 |
| Metric calculation logic | How metrics are computed | Member 2 |
| Search results format | Semantic search response structure | Member 2 |

---

## Getting Started

### Analytics Engine
```bash
cd analytics
pip install pandas numpy
# Start building collectors and processors
```

### Advanced Features
```bash
cd advanced-features
pip install openai langchain chromadb PyPDF2
# Start with formula extraction or semantic search
```

---

## Priority Order (Suggested)

1. **Analytics Event Collection** — Define and implement event schema
2. **Study Time & Focus Processors** — Core metrics
3. **Visualization Data Providers** — Chart-ready data for dashboard
4. **Formula Extraction** — High-impact feature
5. **Semantic Search** — Differentiating feature
6. **Mind Maps** — Visual learning tool
7. **Smart Bookmarks** — Enhancement
8. **Research Summarizer** — Advanced feature
9. **Voice Interaction** — Future enhancement

---

## File Naming Conventions
- Modules: `snake_case.py` (e.g., `focus_processor.py`)
- Classes: `PascalCase` (e.g., `FocusProcessor`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `VIDEO_PLAY`)
- Test files: `test_module_name.py`
