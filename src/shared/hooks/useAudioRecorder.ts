import { useState, useRef, useEffect } from "react"

type RecorderState = "idle" | "requesting" | "recording" | "recorded"

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

  const startRecording = async () => {
    setState("requesting")
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
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

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
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
