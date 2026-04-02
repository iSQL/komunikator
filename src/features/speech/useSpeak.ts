import { useCallback, useRef } from "react"
import { playClip } from "./audioCache"
import { useSettingsStore } from "../settings"
import type { Tile } from "../../data"

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export const useSpeak = () => {
  const speaking = useRef(false)

  const speakTile = useCallback(async (tile: Tile) => {
    if (speaking.current || !tile.audioClipId) return
    speaking.current = true
    try {
      await playClip(tile.audioClipId)
    } finally {
      speaking.current = false
    }
  }, [])

  const speakSentence = useCallback(async (tiles: Tile[]) => {
    if (speaking.current || tiles.length === 0) return
    speaking.current = true
    try {
      const pauseMs = useSettingsStore.getState().sentencePauseMs
      const playable = tiles.filter((t) => t.audioClipId)
      for (let i = 0; i < playable.length; i++) {
        await playClip(playable[i].audioClipId!)
        if (i < playable.length - 1 && pauseMs > 0) {
          await delay(pauseMs)
        }
      }
    } finally {
      speaking.current = false
    }
  }, [])

  return { speakTile, speakSentence }
}
