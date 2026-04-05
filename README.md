# AAC Communicator

Serbian-first Augmentative and Alternative Communication (AAC) PWA. Users tap symbol tiles to build sentences and speak them. Primary audio is pre-recorded Serbian clips per symbol; Web Speech API is the fallback.

**Live demo: [komunikator.cloudfrog.cc](https://komunikator.cloudfrog.cc)**

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
- **ARASAAC symbols** — tiles can use any ARASAAC pictogram by ID; image is fetched at seed/edit time and stored as a data URL in IndexedDB for offline use
- **Responsive layout** — sentence bar shows 4 tiles per row on mobile; board grid adapts to viewport; minimum 48×48dp touch targets (WCAG)
- **Accessibility** — `aria-label` on all tiles, `role="log"` sentence bar, keyboard navigation, high contrast mode, switch scanning

## Default Board

On first launch the app seeds three starter tiles: **Ja**, **Hoću**, **vodu**, and **jabuku** (ARASAAC #2462). All ARASAAC images are fetched and stored in IndexedDB during seeding so they are available offline immediately.

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

## Deployment

The app is deployed as a Docker container served by nginx. A `Dockerfile` and `nginx.conf` are included in the repo.

- `nginx.conf` serves `sw.js` with `no-cache` headers (required for PWA updates), sets the correct MIME type for `.webmanifest`, and falls back all routes to `index.html` for SPA routing
- Hashed JS/CSS/asset files are served with `immutable` cache headers

Coolify (connected to GitHub) handles CI/CD: every push to `master` triggers a rebuild and redeploy. TLS is terminated by Coolify's Traefik reverse proxy; nginx listens on port 80.

## License

GNU Affero General Public License v3.0 — see [LICENSE](LICENSE).