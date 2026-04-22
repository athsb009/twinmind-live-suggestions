import { useRef, useState, useCallback } from "react"

interface UseAudioRecorderProps {
  onChunkReady: (blob: Blob) => void
  intervalMs?: number
}

export const useAudioRecorder = ({
  onChunkReady,
  intervalMs = 30000,
}: UseAudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const getMimeType = useCallback(() => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ]
    return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? ""
  }, [])

  const startNewRecorder = useCallback(
    (stream: MediaStream) => {
      const mimeType = getMimeType()
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
      })

      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blobType = mimeType || "audio/webm"
          const blob = new Blob(chunksRef.current, { type: blobType })
          onChunkReady(blob)
          chunksRef.current = []
        }
      }

      recorder.start()
      mediaRecorderRef.current = recorder
    },
    [getMimeType, onChunkReady]
  )

  const startRecording = useCallback(async () => {
    try {
      setError(null)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      startNewRecorder(stream)
      setIsRecording(true)

      intervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop()
          startNewRecorder(stream)
        }
      }, intervalMs)
    } catch (err) {
      setError("Microphone access denied. Please allow mic permissions.")
      console.error("Mic error:", err)
    }
  }, [startNewRecorder, intervalMs])

  const stopRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setIsRecording(false)
  }, [])

  return { isRecording, error, startRecording, stopRecording }
}
