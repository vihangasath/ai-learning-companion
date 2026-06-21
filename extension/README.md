# Browser Extension (Member 1)

> Frontend & Browser Extension Layer

## Owner
Member 1 — Frontend & Browser Extension Engineer

## Tech Stack
- React
- TypeScript
- Tailwind CSS
- Chrome Extension APIs

## Structure
```
extension/
├── public/              # manifest.json, icons, static assets
├── src/
│   ├── components/      # Reusable React UI components
│   ├── content-scripts/  # Scripts injected into web pages
│   ├── background/       # Service worker / background scripts
│   ├── popup/            # Extension popup interface
│   ├── sidepanel/        # AI Side Panel UI
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility/helper functions
│   ├── styles/           # CSS / Tailwind configuration
│   └── types/            # TypeScript type definitions
└── tests/                # Unit & integration tests
```

## Responsibilities
- Capture educational content from web pages
- Extract video information (YouTube, etc.)
- Display AI side panel with real-time explanations
- Show generated notes, flashcards, and quizzes
- Track user interactions and send events to analytics
- Extension popup for quick controls & settings

## Setup
1. `cd extension`
2. `npm install`
3. `npm run dev`
4. Load unpacked extension in Chrome
