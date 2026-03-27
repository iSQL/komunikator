import { db } from "../../data"

let audioContext: AudioContext | null = null
const decodedCache = new Map<string, AudioBuffer>()

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

const getDecodedBuffer = async (audioClipId: string): Promise<AudioBuffer | null> => {
  if (decodedCache.has(audioClipId)) return decodedCache.get(audioClipId)!
  const clip = await db.audioClips.get(audioClipId)
  if (!clip) return null
  const ctx = getAudioContext()
  const audioBuffer = await ctx.decodeAudioData(await clip.blob.arrayBuffer())
  decodedCache.set(audioClipId, audioBuffer)
  return audioBuffer
}

export const playClip = async (audioClipId: string): Promise<boolean> => {
  const ctx = getAudioContext()
  if (ctx.state === "suspended") await ctx.resume()
  const audioBuffer = await getDecodedBuffer(audioClipId)
  if (!audioBuffer) return false

  const source = ctx.createBufferSource()
  source.buffer = audioBuffer
  source.connect(ctx.destination)

  return new Promise((resolve) => {
    source.onended = () => resolve(true)
    source.start()
  })
}

export const evictClip = (audioClipId: string) => {
  decodedCache.delete(audioClipId)
}
