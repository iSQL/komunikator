import { useState, useRef, useEffect } from "react"
import { Capacitor, registerPlugin } from "@capacitor/core"

type RecorderState = "idle" | "requesting" | "recording" | "recorded" | "error"

interface NativeRecorderPlugin {
  start(): Promise<void>
  stop(): Promise<{ base64: string; mimeType: string; durationMs: number }>
}

const NativeAudioRecorder = registerPlugin<NativeRecorderPlugin>("NativeAudioRecorder")

const isNative = Capacitor.isNativePlatform()

interface AudioRecorderResult {
  state: RecorderState
  previewUrl: string | null
  recordedBlob: Blob | null
  recordedDurationMs: number
  elapsedSeconds: number
  startRecording: () => Promise<void>
  stopRecording: () => void
  discard: () => void
}

const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const bytes = atob(base64)
  const buffer = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i)
  return new Blob([buffer], { type: mimeType })
}

const useAudioRecorder = (): AudioRecorderResult => {
  const [state, setState] = useState<RecorderState>("idle")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedDurationMs, setRecordedDurationMs] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const startTimeRef = useRef<number>(0)
  const previewUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    if (state !== "recording") return
    setElapsedSeconds(0)
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [state])

  const startNativeRecording = async () => {
    setState("requesting")
    try {
      await NativeAudioRecorder.start()
      setState("recording")
    } catch (err) {
      setState("error")
    }
  }

  const stopNativeRecording = async () => {
    try {
      const result = await NativeAudioRecorder.stop()
      const blob = base64ToBlob(result.base64, result.mimeType)
      const url = URL.createObjectURL(blob)
      previewUrlRef.current = url
      setRecordedBlob(blob)
      setRecordedDurationMs(result.durationMs)
      setPreviewUrl(url)
      setState("recorded")
    } catch (err) {
      setState("error")
    }
  }

  const startWebRecording = async () => {
    setState("requesting")
    let stream: MediaStream
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 8000)
      )
      stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({ audio: true }),
        timeout,
      ])
    } catch (err) {
      setState("error")
      return
    }
    streamRef.current = stream
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    chunksRef.current = []
    startTimeRef.current = Date.now()

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    mediaRecorder.onstop = () => {
      const durationMs = Date.now() - startTimeRef.current
      const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType })
      const url = URL.createObjectURL(blob)
      previewUrlRef.current = url
      setRecordedBlob(blob)
      setRecordedDurationMs(durationMs)
      setPreviewUrl(url)
      setState("recorded")
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    mediaRecorder.start()
    setState("recording")
  }

  const startRecording = isNative ? startNativeRecording : startWebRecording

  const stopRecording = () => {
    if (isNative) {
      stopNativeRecording()
    } else {
      mediaRecorderRef.current?.stop()
    }
  }

  const discard = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setPreviewUrl(null)
    setRecordedBlob(null)
    setRecordedDurationMs(0)
    setElapsedSeconds(0)
    setState("idle")
  }

  return { state, previewUrl, recordedBlob, recordedDurationMs, elapsedSeconds, startRecording, stopRecording, discard }
}

export default useAudioRecorder
