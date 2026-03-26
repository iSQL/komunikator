import { useCallback, useRef } from "react"
import { playClip } from "./audioCache"
import { speakText } from "./ttsEngine"
import type { Tile } from "../../data"

export const useSpeak = () => {
  const speaking = useRef(false)

  const speakTile = useCallback(async (tile: Tile) => {
    if (speaking.current) return
    speaking.current = true
    try {
      if (tile.audioClipId) {
        const played = await playClip(tile.audioClipId)
        if (played) return
      }
      await speakText(tile.label)
    } finally {
      speaking.current = false
    }
  }, [])

  const speakSentence = useCallback(async (tiles: Tile[]) => {
    if (speaking.current || tiles.length === 0) return
    speaking.current = true
    try {
      const fullText = tiles.map((t) => t.label).join(" ")
      await speakText(fullText)
    } finally {
      speaking.current = false
    }
  }, [])

  return { speakTile, speakSentence }
}
