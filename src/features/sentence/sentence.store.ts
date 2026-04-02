import { create } from "zustand"
import type { Tile } from "../../data"

interface SentenceState {
  items: Tile[]
  playingIndex: number | null
  append: (tile: Tile) => void
  removeAt: (index: number) => void
  removeLast: () => void
  clear: () => void
  setPlayingIndex: (index: number | null) => void
}

export const useSentenceStore = create<SentenceState>((set) => ({
  items: [],
  playingIndex: null,
  append: (tile) => set((s) => ({ items: [...s.items, tile] })),
  removeAt: (index) => set((s) => ({ items: s.items.filter((_, i) => i !== index) })),
  removeLast: () => set((s) => ({ items: s.items.slice(0, -1) })),
  clear: () => set({ items: [], playingIndex: null }),
  setPlayingIndex: (index) => set({ playingIndex: index }),
}))
