import { useSettingsStore } from "./settings.store"

interface SettingsPanelProps {
  onClose: () => void
}

const SettingsPanel = ({ onClose }: SettingsPanelProps) => {
  const { sentencePauseMs, setSentencePauseMs } = useSettingsStore()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-6 max-w-sm w-[90vw]">
        <h2 className="text-lg font-bold text-gray-800">Podešavanja</h2>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="sentence-pause">
            Pauza između reči u rečenici
          </label>
          <div className="flex items-center gap-3">
            <input
              id="sentence-pause"
              type="range"
              min={0}
              max={2000}
              step={50}
              value={sentencePauseMs}
              onChange={(e) => setSentencePauseMs(Number(e.target.value))}
              className="flex-1 accent-blue-500"
            />
            <span className="text-sm font-mono text-gray-600 w-16 text-right">
              {sentencePauseMs} ms
            </span>
          </div>
          <span className="text-xs text-gray-400">
            0 ms = bez pauze, 2000 ms = maksimalna pauza
          </span>
        </div>

        <button
          className="px-4 py-2 bg-gray-200 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors cursor-pointer self-end"
          onClick={onClose}
        >
          Zatvori
        </button>
      </div>
    </div>
  )
}

export default SettingsPanel
