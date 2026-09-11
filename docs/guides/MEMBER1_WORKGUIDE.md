# Member 1 — Frontend & Browser Extension Work Guide

## Your Role
You are responsible for all user-facing interfaces in LearnFlow AI:
- **Chrome Browser Extension** — the primary interaction point
- **Learning Dashboard** — analytics visualization web app

---

## Your Directories

| Directory | Purpose |
|-----------|--------|
| `extension/` | Chrome browser extension (React + TypeScript) |
| `dashboard/` | Learning analytics dashboard (React + Recharts) |
| `shared/` | Shared utilities (coordinate with team) |

---

## Branch Workflow

1. Always work on `member1/frontend-extension` branch
2. Pull latest: `git pull origin member1/frontend-extension`
3. Make your changes in `extension/` and `dashboard/`
4. Commit with clear messages: `git commit -m "feat(extension): add side panel UI"`
5. Push: `git push origin member1/frontend-extension`
6. Create a Pull Request to `main` when a feature is complete

---

## Extension Development

### Tech Stack
- **React** — UI components
- **TypeScript** — Type-safe development
- **Tailwind CSS** — Styling
- **Chrome Extension APIs** — Browser integration (Manifest V3)

### What You Need to Build

#### Content Script (`extension/src/content-scripts/`)
- Detect when user is on an educational page (YouTube, article sites)
- Extract page content / video transcript info
- Inject the AI Side Panel into the page
- Send extracted content to the backend API via `fetch`
- Listen for and forward user interaction events to analytics

#### Extension Popup (`extension/src/popup/`)
- Quick controls (enable/disable, settings)
- Current session overview (what's being studied)
- Login/logout controls
- Link to open the full dashboard

#### AI Side Panel (`extension/src/sidepanel/`)
- Display AI-generated summaries in real-time
- Show generated notes with formatting
- Interactive flashcard viewer (flip cards, mark learned)
- Quiz interface (MCQ, True/False, with scoring)
- "Ask AI" input for follow-up questions
- Difficulty level selector (Beginner/Intermediate/Advanced)

#### Background Script (`extension/src/background/`)
- Service worker (Manifest V3)
- Handle communication between content script, popup, and side panel
- Manage API calls to backend
- Handle authentication token storage

#### Shared Components (`extension/src/components/`)
- Reusable UI components: buttons, cards, modals, loading spinners
- Note display component
- Flashcard component
- Quiz question component
- Summary display component

### manifest.json (`extension/public/manifest.json`)
You'll need to create this with:
- `manifest_version: 3`
- Permissions: `activeTab`, `storage`, `sidePanel`, `tabs`
- Content scripts matching educational sites
- Background service worker
- Popup and side panel declarations

### API Integration Points
Your extension communicates with Member 2's backend at these endpoints (coordinate with them):

| Action | Expected Endpoint | Method |
|--------|------------------|--------|
| Send content for processing | `POST /api/content/analyze` | POST |
| Get generated notes | `GET /api/notes/{content_id}` | GET |
| Get flashcards | `GET /api/flashcards/{content_id}` | GET |
| Get quiz | `GET /api/quiz/{content_id}` | GET |
| Submit quiz answers | `POST /api/quiz/submit` | POST |
| User login | `POST /api/auth/login` | POST |
| User register | `POST /api/auth/register` | POST |
| Get recommendations | `GET /api/recommendations` | GET |
| Log analytics event | `POST /api/analytics/event` | POST |

---

## Dashboard Development

### Tech Stack
- **React** — UI framework
- **Tailwind CSS** — Styling
- **Recharts** — Chart library
- **Framer Motion** — Animations
- **Shadcn UI** — Component library

### What You Need to Build

#### Pages (`dashboard/src/pages/`)
- **Home/Overview** — Main dashboard with summary cards
- **Analytics** — Detailed study time & focus charts
- **Performance** — Quiz scores, subject strengths/weaknesses
- **Recommendations** — Suggested next topics & resources
- **Settings** — User preferences, account management

#### Dashboard Components (`dashboard/src/components/`)

| Component | Description |
|-----------|------------|
| `OverviewCards` | 4 stat cards: Total Study Hours, Learning Streak, Videos Completed, Focus Score |
| `WeeklyActivityChart` | Line chart showing daily study time for the week |
| `SubjectPerformance` | Bar chart comparing quiz accuracy across subjects |
| `LearningHeatmap` | GitHub-style heatmap showing study consistency |
| `RecommendationsList` | Cards showing suggested next topics and resources |
| `RecentActivity` | Timeline of recent learning sessions |
| `FocusScoreMeter` | Gauge/meter showing current focus score |
| `StreakCounter` | Visual streak counter with fire emoji |
| `TopicDistribution` | Pie chart of time spent per topic |

#### Design Guidelines
- **Theme**: Modern, minimal, AI-inspired
- **Primary Colors**: Indigo (#4F46E5), Blue (#3B82F6), Purple (#8B5CF6)
- **Accent Colors**: Cyan (#06B6D4), Emerald (#10B981)
- **Dark Mode**: Support both light and dark themes
- **Typography**: Inter or Outfit font (Google Fonts)
- **Responsive**: Desktop, Tablet, Mobile layouts
- **Performance**: Use aggregated analytics data, avoid rendering raw datasets

#### API Integration Points
Dashboard fetches data from Member 2's backend:

| Data | Expected Endpoint |
|------|------------------|
| Study time stats | `GET /api/analytics/study-time` |
| Focus metrics | `GET /api/analytics/focus` |
| Learning streaks | `GET /api/analytics/streaks` |
| Quiz performance | `GET /api/analytics/performance` |
| Subject breakdown | `GET /api/analytics/subjects` |
| Recommendations | `GET /api/recommendations` |
| Recent activity | `GET /api/analytics/recent` |
| Heatmap data | `GET /api/analytics/heatmap` |

---

## Coordination with Other Members

| You Need From | What | Member |
|---------------|------|--------|
| API endpoints for all data | Backend routes & response formats | Member 2 |
| Authentication flow | JWT token format, login/register API | Member 3 |
| Analytics data format | What metrics are available, response schemas | Member 4 |
| Recommendation data | Format of suggested topics/resources | Member 3 |

| Others Need From You | What | Member |
|---------------------|------|--------|
| Event tracking calls | What user events you send to analytics | Member 4 |
| API request formats | What data you send to backend | Member 2 |
| UI for auth flows | Login/register/logout UI implementation | Member 3 |

---

## Getting Started

### Extension Setup
```bash
cd extension
npm init -y
npm install react react-dom typescript @types/react @types/react-dom
npm install -D tailwindcss postcss autoprefixer
npm install -D webpack webpack-cli ts-loader css-loader style-loader
npx tailwindcss init
```

### Dashboard Setup
```bash
cd dashboard
npx -y create-vite@latest ./ -- --template react-ts
npm install
npm install recharts framer-motion
npm install -D tailwindcss postcss autoprefixer
npm run dev
```

---

## File Naming Conventions
- Components: `PascalCase.tsx` (e.g., `OverviewCards.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useStudyTime.ts`)
- Utilities: `camelCase.ts` (e.g., `apiClient.ts`)
- Styles: `kebab-case.css` (e.g., `side-panel.css`)
- Types: `PascalCase.ts` (e.g., `AnalyticsTypes.ts`)
