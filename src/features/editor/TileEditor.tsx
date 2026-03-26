import { useState, useRef } from "react"
import { db } from "../../data"
import type { Tile } from "../../data"
import { useBoardStore } from "../board/board.store"

const COLORS = [
  "#F87171", "#FB923C", "#FBBF24", "#A3E635",
  "#34D399", "#22D3EE", "#60A5FA", "#A78BFA",
  "#F472B6", "#9CA3AF", "#FCA5A5", "#FDE68A",
]

interface TileEditorProps {
  tile: Tile
  onClose: () => void
}

const TileEditor = ({ tile, onClose }: TileEditorProps) => {
  const [label, setLabel] = useState(tile.label)
  const [backgroundColor, setBackgroundColor] = useState(tile.backgroundColor)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const symbolInputRef = useRef<HTMLInputElement>(null)
  const { currentBoard, loadBoard, deleteTile } = useBoardStore()

  const handleSave = async () => {
    await db.tiles.update(tile.id, { label, backgroundColor })
    if (currentBoard) await loadBoard(currentBoard.id)
    onClose()
  }

  const handleDelete = async () => {
    if (currentBoard) {
      await deleteTile(tile.id, currentBoard.id)
    }
    onClose()
  }

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const blob = new Blob([await file.arrayBuffer()], { type: file.type })
    const clipId = `clip-${tile.id}`
    const audio = new Audio(URL.createObjectURL(blob))
    audio.addEventListener("loadedmetadata", async () => {
      await db.audioClips.put({
        id: clipId,
        tileId: tile.id,
        blob,
        mimeType: file.type,
        durationMs: Math.round(audio.duration * 1000),
      })
      await db.tiles.update(tile.id, { audioClipId: clipId })
      URL.revokeObjectURL(audio.src)
    })
  }

  const handleSymbolUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
    await db.tiles.update(tile.id, { symbolPath: dataUrl })
    if (currentBoard) await loadBoard(currentBoard.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-[90vw] max-w-md p-5 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-800">Uredi pločicu</h2>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">Naziv</span>
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">Boja pozadine</span>
          <div className="grid grid-cols-6 gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                className={`w-9 h-9 rounded-lg cursor-pointer border-2 transition-transform ${
                  backgroundColor === color ? "border-gray-800 scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setBackgroundColor(color)}
                aria-label={color}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} />
          <button
            className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer text-left"
            onClick={() => audioInputRef.current?.click()}
          >
            🔊 Otpremi audio snimak
          </button>

          <input ref={symbolInputRef} type="file" accept="image/*" className="hidden" onChange={handleSymbolUpload} />
          <button
            className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer text-left"
            onClick={() => symbolInputRef.current?.click()}
          >
            🖼 Otpremi simbol
          </button>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
            onClick={handleSave}
          >
            Sačuvaj
          </button>
          <button
            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors cursor-pointer"
            onClick={handleDelete}
          >
            Obriši
          </button>
          <button
            className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
            onClick={onClose}
          >
            Otkaži
          </button>
        </div>
      </div>
    </div>
  )
}

export default TileEditor
