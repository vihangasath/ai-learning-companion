# LearnFlow AI — Chrome Extension

A Chrome side-panel extension that detects YouTube videos and articles, then generates AI-powered study kits (summaries, flashcards, and quizzes) via the LearnFlow backend.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** with [CRXJS](https://crxjs.dev/) for Chrome Extension bundling
- **Manifest V3** (service worker + content script + side panel)

## Architecture

| Component | File | Purpose |
|---|---|---|
| Side Panel UI | `src/App.tsx` | Main React app rendered in Chrome's side panel |
| Background | `src/background/service-worker.ts` | Registers side panel behavior on toolbar click |
| Content Script | `src/content-scripts/content.ts` | Extracts page text, title, and YouTube transcripts |

## Development

```bash
# Install dependencies
npm install

# Dev mode (with HMR via CRXJS)
npm run dev

# Production build
npm run build
```

## Loading in Chrome

1. Run `npm run build` to generate the `dist/` folder
2. Open `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked** → select the `dist/` folder
5. Click the LearnFlow AI icon in the toolbar to open the side panel

## API Connection

The extension communicates with the backend at `http://localhost:8000`. Ensure the backend is running before using the extension:

```bash
# From the project root
PYTHONPATH=. .venv312/bin/python run.py
```
