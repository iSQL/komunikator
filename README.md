# AAC Communicator

Serbian-first Augmentative and Alternative Communication (AAC) PWA. Users tap symbol tiles to build sentences and speak them. Primary audio is pre-recorded Serbian clips per symbol; Web Speech API is the fallback.

## Tech Stack

- **React 19** + TypeScript
- **Vite 6** + vite-plugin-pwa (Workbox) — offline-first PWA
- **Tailwind CSS 4**
- **Zustand** — state management
- **Dexie.js** — IndexedDB storage (boards, tiles, audio clips)
- **Mulberry symbols** — open-source SVG symbol set
- **Vitest** + **Playwright** — unit and e2e tests
- **Biome** — linting and formatting

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Commands

```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build locally
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright e2e tests
npm run lint         # Biome check
```

## Project Structure

```
src/
├── app/              # App shell, router, PWA registration
├── features/
│   ├── board/        # Board grid, tile rendering, navigation
│   ├── sentence/     # Sentence bar (built sentence display)
│   ├── speech/       # Audio playback + TTS fallback
│   ├── editor/       # Board/tile editing
│   └── settings/     # Language, voice, display, lock/unlock
├── data/             # Dexie schema, seed data, TypeScript interfaces
├── shared/           # Reusable components, hooks, utilities
└── assets/
    ├── symbols/      # Mulberry SVGs
    └── audio/        # Pre-recorded Serbian mp3 clips
```

## Key Features

- **Offline-first** — all boards, symbols, and audio stored in IndexedDB; works fully offline after first load
- **Sentence building** — tap tiles to append to sentence bar; tap speaker icon to speak the full sentence
- **Folder navigation** — folder tiles push sub-boards onto a navigation stack; back/home buttons for navigation
- **Edit mode** — unlocked via PIN; drag-reorder, add/remove tiles, upload custom symbols and audio
- **Responsive grid** — tiles adapt to viewport; minimum 48×48dp touch targets (WCAG)
- **Accessibility** — `aria-label` on all tiles, `role="log"` sentence bar, keyboard navigation, high contrast mode, switch scanning

## Audio Playback

1. If tile has an `audioClipId` → load blob from Dexie → play via AudioContext
2. Otherwise → speak `tile.label` via SpeechSynthesis with `sr-RS` voice
3. If no `sr-RS` voice available → speak with default voice

AudioContext is preferred over `new Audio()` for lower latency on mobile.

## PWA

- Service worker via `vite-plugin-pwa` (`generateSW` strategy)
- Precaches app shell, symbol SVGs, and default audio clips
- Runtime cache for user-uploaded content (CacheFirst)
- In-app install prompt and update toast with reload button
