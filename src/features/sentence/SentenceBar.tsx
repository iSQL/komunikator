import { useSentenceStore } from "./sentence.store"
import { useSpeak } from "../speech"

const SentenceBar = () => {
  const { items, playingIndex, removeAt, removeLast, clear } = useSentenceStore()
  const { speakSentence } = useSpeak()

  return (
    <div
      className="flex items-center gap-2 p-2 bg-white border-b-2 border-gray-200 min-h-[100px] md:min-h-[256px]"
      role="log"
      aria-live="polite"
      aria-label="Rečenica"
    >
      <div className="flex-1 flex gap-1 overflow-x-auto">
        {items.length === 0 && (
          <span className="text-gray-400 text-sm italic">Dodirni sličice da napraviš rečenicu...</span>
        )}
        {items.map((item, i) => (
          <div
            key={`${item.id}-${i}`}
            className={`flex flex-col items-center gap-1 rounded-xl p-1 md:p-2 shrink-0 w-[calc((100vw-80px)/4)] h-[calc((100vw-80px)/4)] md:w-[240px] md:h-[240px] cursor-pointer hover:brightness-90 active:scale-95 transition-all ${
              playingIndex === i ? "ring-4 ring-blue-500 scale-120" : ""
            }`}
            style={{ backgroundColor: item.backgroundColor }}
            onClick={() => removeAt(i)}
            aria-label={`Ukloni ${item.label}`}
            role="button"
          >
            <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
              {item.symbolPath.startsWith("data:") ? (
                <img src={item.symbolPath} alt="" className="max-w-full max-h-full object-contain rounded" />
              ) : (
                <span className="text-2xl md:text-7xl leading-none">{item.type === "folder" ? "📁" : "🖼"}</span>
              )}
            </div>
            <span className="text-xs md:text-sm font-semibold text-white drop-shadow-sm text-center leading-tight w-full truncate">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <div className="flex flex-col gap-1 md:gap-2 shrink-0 self-stretch justify-center items-center">
          <button
            className="flex items-center justify-center h-9 w-9 md:h-[77px] md:w-[77px] bg-blue-500 text-white rounded-xl hover:bg-blue-600 active:scale-95 transition-all cursor-pointer"
            onClick={() => speakSentence(items)}
            aria-label="Izgovori rečenicu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          </button>
          <button
            className="flex items-center justify-center h-9 w-9 md:h-[77px] md:w-[77px] bg-gray-200 rounded-xl hover:bg-gray-300 active:scale-95 transition-all cursor-pointer"
            onClick={removeLast}
            aria-label="Obriši poslednju"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          </button>
          <button
            className="flex items-center justify-center h-9 w-9 md:h-[77px] md:w-[77px] bg-red-200 rounded-xl hover:bg-red-300 active:scale-95 transition-all cursor-pointer"
            onClick={clear}
            aria-label="Obriši sve"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default SentenceBar
