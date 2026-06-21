# Learning Analytics Engine (Member 4)

> Learning Behavior Analysis & Productivity Insights

## Owner
Member 4 — Analytics & Advanced Features Engineer

## Tech Stack
- Python / FastAPI (backend processors)
- React / Recharts (dashboard visualizations)
- PostgreSQL (metrics storage)

## Structure
```
analytics/
├── collectors/       # Event collection modules
├── processors/       # Analytics data processing
├── metrics/          # Metric calculation modules
├── visualizations/   # Chart components & configurations
├── utils/            # Utility functions
└── tests/            # Analytics tests
```

## Metrics Tracked

### Productivity Metrics
- Study duration (daily/weekly/monthly)
- Daily activity & consistency
- Learning streaks
- Most productive hours

### Focus Metrics
- Active engagement time
- Video completion rate
- Session consistency
- Tab switching frequency

### Performance Metrics
- Quiz accuracy
- Topic mastery levels
- Learning trends over time

## Key Formulas
```
Consistency Score = (Active Days / Total Days) × 100
Focus Rate = (Active Study Time / Total Session Time) × 100
Completion Rate = (Watched Duration / Total Video Duration) × 100
```

## Events Captured
- Video: play, pause, seek, complete
- User: mouse movement, keyboard, tab visibility
- AI: summary generated, quiz generated, flashcard opened

## Dashboard Widgets
- Daily study hours chart
- Weekly consistency graph
- Focus score meter
- Learning streak counter
- Most studied topics
