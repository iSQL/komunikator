import { create } from "zustand"

interface SettingsState {
  lockEditing: boolean
  sentencePauseMs: number
  toggleLock: () => void
  setSentencePauseMs: (ms: number) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  lockEditing: true,
  sentencePauseMs: 200,
  toggleLock: () => set((s) => ({ lockEditing: !s.lockEditing })),
  setSentencePauseMs: (ms) => set({ sentencePauseMs: Math.max(0, Math.min(2000, ms)) }),
}))
