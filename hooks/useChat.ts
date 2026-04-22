import { useState, useCallback } from "react"
import { ChatMessage, Suggestion } from "@/types"
import { nanoid } from "nanoid"

interface UseChatProps {
  getFullTranscript: () => string
  chatContextWindow: number
  systemPrompt: string
  detailPrompt: string
  apiKey: string
}

export const useChat = ({
  getFullTranscript,
  chatContextWindow,
  systemPrompt,
  detailPrompt,
  apiKey,
}: UseChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  const appendAssistantToken = useCallback((id: string, token: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content: m.content + token } : m))
    )
  }, [])

  const streamResponse = useCallback(
    async (userMessage: ChatMessage, assistantId: string, prompt: string) => {
      setIsStreaming(true)

      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      try {
        const recentTranscript = getFullTranscript()
          .split(" ")
          .slice(-(chatContextWindow * 150))
          .join(" ")

        const history = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            systemPrompt: prompt,
            transcript: recentTranscript,
            apiKey,
          }),
        })

        if (!res.ok || !res.body) throw new Error("Chat request failed")

        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const token = decoder.decode(value)
          appendAssistantToken(assistantId, token)
        }
      } catch (err: unknown) {
        const errorText =
          err instanceof Error && err.message.includes("401")
            ? "Invalid API key — check Settings."
            : "Connection error — please try again."
        appendAssistantToken(assistantId, `\n\n_${errorText}_`)
        console.error("Chat stream error:", err)
      } finally {
        setIsStreaming(false)
      }
    },
    [messages, getFullTranscript, chatContextWindow, apiKey, appendAssistantToken]
  )

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !apiKey) return

      const userMessage: ChatMessage = {
        id: nanoid(),
        role: "user",
        content: text.trim(),
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])

      await streamResponse(userMessage, nanoid(), systemPrompt)
    },
    [apiKey, systemPrompt, streamResponse]
  )

  const injectSuggestion = useCallback(
    async (suggestion: Suggestion) => {
      if (!apiKey) return

      const userMessage: ChatMessage = {
        id: nanoid(),
        role: "user",
        content: suggestion.preview,
        timestamp: new Date().toISOString(),
        linkedSuggestionId: suggestion.id,
      }

      setMessages((prev) => [...prev, userMessage])

      const expandedPrompt = `${detailPrompt}\n\nSpecific question to answer in depth:\n${suggestion.detailPrompt}`

      await streamResponse(userMessage, nanoid(), expandedPrompt)
    },
    [apiKey, detailPrompt, streamResponse]
  )

  return { messages, isStreaming, sendMessage, injectSuggestion }
}
