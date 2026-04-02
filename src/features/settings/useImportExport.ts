import { useRef, useState } from "react"
import { db } from "../../data"
import type { Board, Tile } from "../../data"
import { useBoardStore } from "../board/board.store"

type ImportState = "idle" | "confirm" | "loading" | "done" | "error"

interface ExportPayload {
  version: number
  exportedAt: string
  boards: Board[]
  tiles: Tile[]
  audioClips: { id: string; tileId: string; mimeType: string; durationMs: number; data: string }[]
}

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })

const base64ToBlob = (dataUrl: string, mimeType: string): Blob => {
  const base64 = dataUrl.split(",")[1]
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  return new Blob([bytes], { type: mimeType })
}

export const useImportExport = () => {
  const importInputRef = useRef<HTMLInputElement>(null)
  const [importState, setImportState] = useState<ImportState>("idle")
  const [pendingPayload, setPendingPayload] = useState<ExportPayload | null>(null)

  const handleExport = async () => {
    const [boards, tiles, audioClips] = await Promise.all([
      db.boards.toArray(),
      db.tiles.toArray(),
      db.audioClips.toArray(),
    ])

    const clipsWithData = await Promise.all(
      audioClips.map(async ({ id, tileId, mimeType, durationMs, blob }) => ({
        id,
        tileId,
        mimeType,
        durationMs,
        data: await blobToBase64(blob),
      }))
    )

    const payload: ExportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      boards,
      tiles,
      audioClips: clipsWithData,
    }

    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `aac-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result as string) as ExportPayload
        if (payload.version !== 1 || !payload.boards || !payload.tiles) {
          setImportState("error")
          return
        }
        setPendingPayload(payload)
        setImportState("confirm")
      } catch {
        setImportState("error")
      }
    }
    reader.readAsText(file)
  }

  const confirmImport = async () => {
    if (!pendingPayload) return
    setImportState("loading")
    try {
      await db.transaction("rw", db.boards, db.tiles, db.audioClips, async () => {
        await db.boards.clear()
        await db.tiles.clear()
        await db.audioClips.clear()
        await db.boards.bulkPut(pendingPayload.boards)
        await db.tiles.bulkPut(pendingPayload.tiles)
        await db.audioClips.bulkPut(
          pendingPayload.audioClips.map(({ id, tileId, mimeType, durationMs, data }) => ({
            id,
            tileId,
            mimeType,
            durationMs,
            blob: base64ToBlob(data, mimeType),
          }))
        )
      })
      await useBoardStore.getState().loadBoard("board-root")
      setImportState("done")
      setPendingPayload(null)
    } catch {
      setImportState("error")
    }
  }

  const cancelImport = () => {
    setPendingPayload(null)
    setImportState("idle")
  }

  const dismissResult = () => setImportState("idle")

  return {
    handleExport,
    importInputRef,
    handleImportFile,
    importState,
    confirmImport,
    cancelImport,
    dismissResult,
  }
}
