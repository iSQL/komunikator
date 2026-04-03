import { useState, useRef } from "react"
import { db } from "../../data"
import type { Tile } from "../../data"
import { useBoardStore } from "../board/board.store"
import useAudioRecorder from "../../shared/hooks/useAudioRecorder"
import { evictClip } from "../speech/audioCache"

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
  const [type, setType] = useState<"symbol" | "folder">(tile.type)
  const [targetBoardId, setTargetBoardId] = useState(tile.targetBoardId ?? "")
  const [hasAudio, setHasAudio] = useState(!!tile.audioClipId)
  const [arasaacId, setArasaacId] = useState("")
  const [arasaacPreviewUrl, setArasaacPreviewUrl] = useState<string | null>(null)
  const [arasaacError, setArasaacError] = useState(false)
  const [arasaacLoading, setArasaacLoading] = useState(false)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const symbolInputRef = useRef<HTMLInputElement>(null)
  const { currentBoard, loadBoard, deleteTile } = useBoardStore()
  const recorder = useAudioRecorder()

  const handleArasaacPreview = () => {
    const id = arasaacId.trim()
    if (!id) return
    setArasaacError(false)
    setArasaacPreviewUrl(`https://static.arasaac.org/pictograms/${id}/${id}_2500.png`)
  }

  const handleArasaacApply = async () => {
    if (!arasaacPreviewUrl) return
    setArasaacLoading(true)
    try {
      const response = await fetch(arasaacPreviewUrl)
      if (!response.ok) throw new Error()
      const blob = await response.blob()
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })
      await db.tiles.update(tile.id, { symbolPath: dataUrl })
      if (currentBoard) await loadBoard(currentBoard.id)
      setArasaacPreviewUrl(null)
      setArasaacId("")
    } catch {
      setArasaacError(true)
    } finally {
      setArasaacLoading(false)
    }
  }

  const handleSetFolder = async () => {
    setType("folder")
    if (!targetBoardId) {
      const newBoard = {
        id: `board-${Date.now()}`,
        parentId: tile.boardId,
        name: label || "Nova tabla",
        gridColumns: 4,
        gridRows: 4,
        tileIds: [] as string[],
      }
      await db.boards.add(newBoard)
      setTargetBoardId(newBoard.id)
    }
  }


  const handleSave = async () => {
    if (type === "folder" && targetBoardId) {
      await db.boards.update(targetBoardId, { name: label })
    }
    await db.tiles.update(tile.id, {
      label,
      backgroundColor,
      type,
      targetBoardId: type === "folder" ? targetBoardId : undefined,
    })
    if (currentBoard) await loadBoard(currentBoard.id)
    onClose()
  }

  const handleDelete = async () => {
    if (type === "folder" && targetBoardId) {
      await db.boards.delete(targetBoardId)
    }
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
      evictClip(clipId)
      await db.audioClips.put({
        id: clipId,
        tileId: tile.id,
        blob,
        mimeType: file.type,
        durationMs: Math.round(audio.duration * 1000),
      })
      await db.tiles.update(tile.id, { audioClipId: clipId })
      URL.revokeObjectURL(audio.src)
      setHasAudio(true)
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

  const handleRemoveAudio = async () => {
    evictClip(`clip-${tile.id}`)
    await db.audioClips.where("tileId").equals(tile.id).delete()
    await db.tiles.update(tile.id, { audioClipId: null })
    setHasAudio(false)
  }

  const handleSaveRecording = async () => {
    if (!recorder.recordedBlob) return
    const clipId = `clip-${tile.id}`
    evictClip(clipId)
    await db.audioClips.put({
      id: clipId,
      tileId: tile.id,
      blob: recorder.recordedBlob,
      mimeType: recorder.recordedBlob.type,
      durationMs: recorder.recordedDurationMs,
    })
    await db.tiles.update(tile.id, { audioClipId: clipId })
    setHasAudio(true)
    recorder.discard()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-[90vw] max-w-md p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
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
          <span className="text-sm font-medium text-gray-600">Vrsta pločice</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${type === "symbol" ? "bg-blue-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              onClick={() => setType("symbol")}
            >
              🔤 Reč
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${type === "folder" ? "bg-blue-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              onClick={handleSetFolder}
            >
              📁 Fascikla
            </button>
          </div>
        </div>


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

        {type === "symbol" && <div className="flex flex-col gap-2">
          <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} />
          <button
            className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer text-left"
            onClick={() => audioInputRef.current?.click()}
          >
            Ubaci audio snimak
          </button>

          {hasAudio && (
            <button
              className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors cursor-pointer text-left"
              onClick={handleRemoveAudio}
            >
              Ukloni audio snimak
            </button>
          )}

          {(recorder.state === "idle" || recorder.state === "error") && (
            <button
              className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer text-left"
              onClick={recorder.startRecording}
            >
              Snimi audio snimak
            </button>
          )}

          {recorder.state === "error" && (
            <p className="text-xs text-red-600 px-1">
              Mikrofon nije dostupan. Proveri dozvole u podešavanjima telefona.
            </p>
          )}

          {recorder.state === "requesting" && (
            <button disabled className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-400 text-left cursor-default">
              🎙 Tražim mikrofon...
            </button>
          )}

          {recorder.state === "recording" && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-red-700 font-medium flex-1">{recorder.elapsedSeconds}s</span>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 transition-colors cursor-pointer"
                onClick={recorder.stopRecording}
              >
                ⏹ Zaustavi
              </button>
            </div>
          )}

          {recorder.state === "recorded" && (
            <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              {/* biome-ignore lint/a11y/useMediaCaption: preview of user's own recording */}
              <audio controls src={recorder.previewUrl ?? undefined} className="w-full h-8" />
              <div className="flex gap-2">
                <button
                  className="flex-1 px-2 py-1.5 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600 transition-colors cursor-pointer"
                  onClick={handleSaveRecording}
                >
                  ✔ Koristi snimak
                </button>
                <button
                  className="px-2 py-1.5 bg-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-300 transition-colors cursor-pointer"
                  onClick={recorder.discard}
                >
                  ✖ Odbaci
                </button>
              </div>
            </div>
          )}

          <input ref={symbolInputRef} type="file" accept="image/*" className="hidden" onChange={handleSymbolUpload} />
          <button
            className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer text-left"
            onClick={() => symbolInputRef.current?.click()}
          >
            Ubaci simbol
          </button>

          <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-600">ARASAAC piktogram</span>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="ID piktograma (npr. 2842)"
                value={arasaacId}
                onChange={(e) => { setArasaacId(e.target.value); setArasaacPreviewUrl(null); setArasaacError(false) }}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                onClick={handleArasaacPreview}
              >
                Pregled
              </button>
            </div>
            {arasaacError && (
              <p className="text-xs text-red-600">Piktogram nije pronađen. Proveri ID.</p>
            )}
            {arasaacPreviewUrl && !arasaacError && (
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <img
                  src={arasaacPreviewUrl}
                  alt="ARASAAC preview"
                  className="w-16 h-16 object-contain rounded"
                  onError={() => { setArasaacError(true); setArasaacPreviewUrl(null) }}
                />
                <button
                  className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors cursor-pointer disabled:opacity-50"
                  onClick={handleArasaacApply}
                  disabled={arasaacLoading}
                >
                  {arasaacLoading ? "Preuzimam..." : "✔ Koristi"}
                </button>
              </div>
            )}
          </div>
        </div>}

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
