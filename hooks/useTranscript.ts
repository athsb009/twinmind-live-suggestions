import { useState, useCallback } from "react"
import { TranscriptChunk } from "@/types"
import { nanoid } from "nanoid"

export const useTranscript = (contextWindow: number = 3) => {
  const [chunks, setChunks] = useState<TranscriptChunk[]>([])

  const appendChunk = useCallback((text: string) => {
    const chunk: TranscriptChunk = {
      id: nanoid(),
      text: text.trim(),
      timestamp: new Date().toISOString(),
    }
    setChunks((prev) => [...prev, chunk])
  }, [])

  const fullTranscript = chunks.map((c) => c.text).join(" ")

  const recentContext = chunks
    .slice(-contextWindow)
    .map((c) => c.text)
    .join(" ")

  const clearTranscript = useCallback(() => setChunks([]), [])

  return { chunks, appendChunk, fullTranscript, recentContext, clearTranscript }
}
