import { create } from "zustand"

interface SettingsState {
  lockEditing: boolean
  toggleLock: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  lockEditing: true,
  toggleLock: () => set((s) => ({ lockEditing: !s.lockEditing })),
}))
