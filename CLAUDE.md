# AAC Communicator PWA

## Project Overview

Serbian-first AAC (Augmentative and Alternative Communication) PWA, similar to Proloquo2Go / Cboard.
Users tap symbol tiles to build sentences and speak them. Primary audio is pre-recorded Serbian clips per symbol; browser SpeechSynthesis API is the fallback.

## Tech Stack

- **Runtime**: React 19 + TypeScript
- **Build**: Vite 6 + vite-plugin-pwa (Workbox)
- **Styling**: Tailwind CSS 4
- **State**: Zustand
- **Storage**: Dexie.js (IndexedDB wrapper)
- **Audio**: Pre-recorded clips (mp3/ogg) + Web Speech API fallback
- **Symbols**: Mulberry open-source symbol set (SVG)
- **Testing**: Vitest + Playwright
- **Linting**: Biome

## Architecture

```
src/
├── app/                    # App shell, router, PWA registration
│   ├── App.tsx
│   ├── routes.tsx
│   └── pwa.ts              # registerSW, update prompt
├── features/
│   ├── board/              # Board grid, tile rendering, navigation
│   │   ├── BoardView.tsx   # Main grid — renders tiles from current board
│   │   ├── Tile.tsx        # Single tile — symbol image + label
│   │   ├── FolderTile.tsx  # Tile that navigates into a sub-board
│   │   └── board.store.ts  # Zustand slice: currentBoardId, navigation stack
│   ├── sentence/           # Sentence bar (top strip showing built sentence)
│   │   ├── SentenceBar.tsx
│   │   └── sentence.store.ts
│   ├── speech/             # Audio playback + TTS fallback
│   │   ├── useSpeak.ts     # Hook: play clip or fallback to SpeechSynthesis
│   │   ├── audioCache.ts   # Preload & cache audio blobs in IndexedDB
│   │   └── ttsEngine.ts    # SpeechSynthesis wrapper, voice selection
│   ├── editor/             # Board/tile editing (add, remove, reorder, upload)
│   │   ├── TileEditor.tsx
│   │   └── BoardEditor.tsx
│   └── settings/           # Language, voice, display, lock/unlock
│       ├── SettingsView.tsx
│       └── settings.store.ts
├── data/
│   ├── db.ts               # Dexie schema: boards, tiles, audioClips, settings
│   ├── seed.ts             # Default Serbian board data (import on first run)
│   └── types.ts            # Board, Tile, AudioClip, Settings interfaces
├── shared/
│   ├── components/         # Button, Modal, Icon wrappers
│   ├── hooks/              # useOnline, useLongPress, useAudioPreload
│   └── utils/              # array helpers, id generators
└── assets/
    ├── symbols/            # Mulberry SVGs (bundled subset)
    └── audio/              # Pre-recorded Serbian mp3 clips
```

## Data Model

```typescript
interface Board {
  id: string
  parentId: string | null
  name: string
  gridColumns: number
  gridRows: number
  tileIds: string[]          // ordered
}

interface Tile {
  id: string
  boardId: string
  label: string              // Serbian display text
  symbolPath: string         // path to SVG in assets or user-uploaded
  audioClipId: string | null // FK to AudioClip, null = use TTS
  backgroundColor: string
  type: "symbol" | "folder"  // folder navigates into a sub-board
  targetBoardId?: string     // only if type === "folder"
}

interface AudioClip {
  id: string
  tileId: string
  blob: Blob                 // mp3/ogg stored in IndexedDB
  mimeType: string
  durationMs: number
}

interface AppSettings {
  locale: string             // "sr-RS" default
  ttsVoice: string | null    // SpeechSynthesis voice name
  ttsRate: number            // 0.5 - 2.0
  ttsPitch: number           // 0.5 - 2.0
  lockEditing: boolean       // prevent accidental edits
  highContrast: boolean
  scanningEnabled: boolean   // switch access scanning
}
```

## Audio Playback Logic

```
onTilePress(tile):
  1. if tile.audioClipId exists → load blob from Dexie → play via AudioContext
  2. else → speak tile.label via SpeechSynthesis with available voice
```

Always prefer AudioContext over `new Audio()` for lower latency on mobile.

## Key Behaviors

- **Offline-first**: All boards, symbols, and audio clips are in IndexedDB. App works fully offline after first load.
- **Sentence building**: Tapping tiles appends to sentence bar. Tap sentence bar speaker icon to speak full sentence (concatenate clips or TTS the full string).
- **Folder navigation**: Tiles of type "folder" push onto a board stack. Back button pops. Home button resets to root.
- **Edit mode**: Unlocked via settings (protected by simple PIN). Allows drag-reorder, add/remove tiles, upload custom symbols/audio.
- **Responsive grid**: Board fills available viewport. Tile size adapts. Min touch target 48x48dp (WCAG).

## Conventions

- No comments in code — self-documenting names only
- Barrel exports per feature folder (index.ts)
- All async storage ops via Dexie — never use localStorage
- Zustand stores: one per feature, named `*.store.ts`
- Components: one per file, PascalCase filename = default export name
- Keep components under 150 lines; extract hooks when logic grows
- Use `const` arrow functions for components
- Prefer early returns over nested ternaries in JSX

## PWA Requirements

- `vite-plugin-pwa` with `generateSW` strategy
- Precache: app shell, symbol SVGs, default audio clips
- Runtime cache: user-uploaded symbols and audio (CacheFirst)
- Install prompt: custom in-app banner
- Update flow: `registerSW({ onNeedRefresh })` → show toast with reload button

## Accessibility

- All tiles have `aria-label={tile.label}`
- Sentence bar is `role="log" aria-live="polite"`
- Tab/Enter navigation works on desktop
- High contrast mode swaps to black/white/yellow palette
- Switch scanning: auto-scan rows then columns with configurable interval

## Commands

```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build locally
npm run test         # Vitest
npm run test:e2e     # Playwright
npm run lint         # Biome check
```

## Do NOT

- Do not add a backend or API server — this is 100% client-side
- Do not use Next.js, Remix, or any SSR framework
- Do not use localStorage — Dexie/IndexedDB only
- Do not add Redux, MobX, or Context for state — Zustand only
- Do not use CSS modules or styled-components — Tailwind only
- Do not hardcode symbol/audio paths — always resolve from Dexie records
- Do not add code comments — write clear names instead

## Allowed Tools

Claude Code can run these without asking:
- git status, git add, git commit, git push, git pull, git log, git diff, git checkout, git branch
- npm run dev, npm run build, npm run test, npm run lint
- npx cap sync