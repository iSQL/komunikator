import { useSentenceStore } from "./sentence.store"
import { useSpeak } from "../speech"

const SentenceBar = () => {
  const { items, removeLast, clear } = useSentenceStore()
  const { speakSentence } = useSpeak()

  return (
    <div
      className="flex items-center gap-2 p-3 bg-white border-b-2 border-gray-200 min-h-[56px]"
      role="log"
      aria-live="polite"
      aria-label="Rečenica"
    >
      <div className="flex-1 flex gap-1 overflow-x-auto">
        {items.length === 0 && (
          <span className="text-gray-400 text-sm italic">Dodirni sličice da napraviš rečenicu...</span>
        )}
        {items.map((item, i) => (
          <span
            key={`${item.id}-${i}`}
            className="px-2 py-1 rounded-md text-sm font-medium text-white shrink-0"
            style={{ backgroundColor: item.backgroundColor }}
          >
            {item.label}
          </span>
        ))}
      </div>
      {items.length > 0 && (
        <div className="flex gap-1 shrink-0">
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors cursor-pointer"
            onClick={() => speakSentence(items)}
            aria-label="Izgovori rečenicu"
          >
            🔊
          </button>
          <button
            className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded-md text-sm hover:bg-gray-300 transition-colors cursor-pointer"
            onClick={removeLast}
            aria-label="Obriši poslednju"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
            Obriši poslednju
          </button>
          <button
            className="flex items-center gap-1 px-2 py-1 bg-red-200 rounded-md text-sm hover:bg-red-300 transition-colors cursor-pointer"
            onClick={clear}
            aria-label="Obriši sve"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Obriši sve
          </button>
        </div>
      )}
    </div>
  )
}

export default SentenceBar
