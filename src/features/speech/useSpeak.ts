import { useCallback, useRef } from "react"
import { playClip } from "./audioCache"
import type { Tile } from "../../data"

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
      for (const tile of tiles) {
        if (tile.audioClipId) {
          await playClip(tile.audioClipId)
        }
      }
    } finally {
      speaking.current = false
    }
  }, [])

  return { speakTile, speakSentence }
}
