import { create } from "zustand"
import type { Tile } from "../../data"

interface SentenceState {
  items: Tile[]
  append: (tile: Tile) => void
  removeAt: (index: number) => void
  removeLast: () => void
  clear: () => void
}

export const useSentenceStore = create<SentenceState>((set) => ({
  items: [],
  append: (tile) => set((s) => ({ items: [...s.items, tile] })),
  removeAt: (index) => set((s) => ({ items: s.items.filter((_, i) => i !== index) })),
  removeLast: () => set((s) => ({ items: s.items.slice(0, -1) })),
  clear: () => set({ items: [] }),
}))
