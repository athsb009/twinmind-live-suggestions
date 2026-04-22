import { useState, useRef, useCallback } from "react"
import { SuggestionBatch } from "@/types"
import { nanoid } from "nanoid"

interface UseSuggestionsProps {
  getFullTranscript: () => string
  getRecentContext: () => string
  systemPrompt: string
  apiKey: string
}

export const useSuggestions = ({
  getFullTranscript,
  getRecentContext,
  systemPrompt,
  apiKey,
}: UseSuggestionsProps) => {
  const [batches, setBatches] = useState<SuggestionBatch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isFetchingRef = useRef(false)
  const getFullTranscriptRef = useRef(getFullTranscript)
  const getRecentContextRef = useRef(getRecentContext)
  const systemPromptRef = useRef(systemPrompt)
  const apiKeyRef = useRef(apiKey)

  getFullTranscriptRef.current = getFullTranscript
  getRecentContextRef.current = getRecentContext
  systemPromptRef.current = systemPrompt
  apiKeyRef.current = apiKey

  const fetchSuggestions = useCallback(async () => {
    if (isFetchingRef.current) return
    const key = apiKeyRef.current
    if (!key) return

    const recentContext = getRecentContextRef.current()
    const fullTranscript = getFullTranscriptRef.current()

    if (!recentContext || recentContext.trim().length < 20) return

    isFetchingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const batchId = nanoid()

      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullTranscript,
          recentContext,
          systemPrompt: systemPromptRef.current,
          apiKey: key,
          batchId,
        }),
      })

      if (!res.ok) throw new Error("Suggestions request failed")

      const data = await res.json()

      if (data.suggestions && data.suggestions.length > 0) {
        const batch: SuggestionBatch = {
          batchId,
          timestamp: new Date().toISOString(),
          suggestions: data.suggestions,
        }
        setBatches((prev) => [batch, ...prev])
      }
    } catch (err) {
      setError("Failed to fetch suggestions")
      console.error("Suggestions error:", err)
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [])

  const manualRefresh = useCallback(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  return {
    batches,
    isLoading,
    error,
    manualRefresh,
  }
}
