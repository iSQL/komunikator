import { db } from "../../data"

let audioContext: AudioContext | null = null
const decodedCache = new Map<string, AudioBuffer>()

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

const SILENCE_THRESHOLD = 0.02

const trimTrailingSilence = (buffer: AudioBuffer): AudioBuffer => {
  const channels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  let lastLoudSample = 0

  for (let ch = 0; ch < channels; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = data.length - 1; i >= 0; i--) {
      if (Math.abs(data[i]) > SILENCE_THRESHOLD) {
        lastLoudSample = Math.max(lastLoudSample, i)
        break
      }
    }
  }

  const fadeOutSamples = Math.min(Math.round(sampleRate * 0.01), 512)
  const trimmedLength = Math.min(lastLoudSample + 1 + fadeOutSamples, buffer.length)

  if (trimmedLength >= buffer.length) return buffer

  const ctx = getAudioContext()
  const trimmed = ctx.createBuffer(channels, trimmedLength, sampleRate)

  for (let ch = 0; ch < channels; ch++) {
    const source = buffer.getChannelData(ch)
    const dest = trimmed.getChannelData(ch)
    dest.set(source.subarray(0, trimmedLength))

    for (let i = 0; i < fadeOutSamples; i++) {
      const fadeIndex = lastLoudSample + 1 + i
      if (fadeIndex < trimmedLength) {
        dest[fadeIndex] *= 1 - i / fadeOutSamples
      }
    }
  }

  return trimmed
}

const getDecodedBuffer = async (audioClipId: string): Promise<AudioBuffer | null> => {
  if (decodedCache.has(audioClipId)) return decodedCache.get(audioClipId)!
  const clip = await db.audioClips.get(audioClipId)
  if (!clip) return null
  const ctx = getAudioContext()
  const raw = await ctx.decodeAudioData(await clip.blob.arrayBuffer())
  const trimmed = trimTrailingSilence(raw)
  decodedCache.set(audioClipId, trimmed)
  return trimmed
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
