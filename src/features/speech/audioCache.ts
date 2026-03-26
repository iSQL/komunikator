import { db } from "../../data"

let audioContext: AudioContext | null = null

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

export const playClip = async (audioClipId: string): Promise<boolean> => {
  const clip = await db.audioClips.get(audioClipId)
  if (!clip) return false

  const ctx = getAudioContext()
  if (ctx.state === "suspended") {
    await ctx.resume()
  }
  const arrayBuffer = await clip.blob.arrayBuffer()
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
  const source = ctx.createBufferSource()
  source.buffer = audioBuffer
  source.connect(ctx.destination)

  return new Promise((resolve) => {
    source.onended = () => resolve(true)
    source.start()
  })
}
