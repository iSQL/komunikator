import { create } from "zustand"
import type { Tile } from "../../data"

interface SentenceState {
  items: Tile[]
  append: (tile: Tile) => void
  removeLast: () => void
  clear: () => void
}

export const useSentenceStore = create<SentenceState>((set) => ({
  items: [],
  append: (tile) => set((s) => ({ items: [...s.items, tile] })),
  removeLast: () => set((s) => ({ items: s.items.slice(0, -1) })),
  clear: () => set({ items: [] }),
}))
