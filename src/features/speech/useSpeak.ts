import { useCallback, useRef } from "react"
import { playClip } from "./audioCache"
import { useSettingsStore } from "../settings"
import { useSentenceStore } from "../sentence/sentence.store"
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
    const { setPlayingIndex } = useSentenceStore.getState()
    try {
      const pauseMs = useSettingsStore.getState().sentencePauseMs
      let played = false
      for (let i = 0; i < tiles.length; i++) {
        if (!tiles[i].audioClipId) continue
        if (played && pauseMs > 0) {
          await delay(pauseMs)
        }
        setPlayingIndex(i)
        await playClip(tiles[i].audioClipId!)
        played = true
      }
    } finally {
      setPlayingIndex(null)
      speaking.current = false
    }
  }, [])

  return { speakTile, speakSentence }
}
