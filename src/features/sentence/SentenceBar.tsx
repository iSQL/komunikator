import { useSentenceStore } from "./sentence.store"

const SentenceBar = () => {
  const { items, removeLast, clear } = useSentenceStore()

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
            className="px-2 py-1 bg-gray-200 rounded-md text-sm hover:bg-gray-300 transition-colors cursor-pointer"
            onClick={removeLast}
            aria-label="Obriši poslednju"
          >
            ⌫
          </button>
          <button
            className="px-2 py-1 bg-red-200 rounded-md text-sm hover:bg-red-300 transition-colors cursor-pointer"
            onClick={clear}
            aria-label="Obriši sve"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

export default SentenceBar
