"use client"

import { useState, useCallback, useRef } from "react"
import { AppSettings, Suggestion } from "@/types"
import { useTranscript } from "@/hooks/useTranscript"
import { useAudioRecorder } from "@/hooks/useAudioRecorder"
import { useSuggestions } from "@/hooks/useSuggestions"
import { useChat } from "@/hooks/useChat"
import { TranscriptPanel } from "@/components/TranscriptPanel"
import { SuggestionsPanel } from "@/components/SuggestionsPanel"
import { ChatPanel } from "@/components/ChatPanel"
import { SettingsDrawer, DEFAULT_APP_SETTINGS } from "@/components/SettingsDrawer"
import { buildExport, downloadSession } from "@/lib/export"

export default function Home() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS)
  const [showSettings, setShowSettings] = useState(false)
  const [transcribeError, setTranscribeError] = useState<string | null>(null)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  const { chunks, appendChunk, fullTranscript, recentContext } = useTranscript(
    settings.suggestionContextWindow
  )

  const fullTranscriptRef = useCallback(() => fullTranscript, [fullTranscript])
  const recentContextRef = useCallback(() => recentContext, [recentContext])

  const {
    batches,
    isLoading: suggestionsLoading,
    error: suggestionsError,
    manualRefresh,
  } = useSuggestions({
    getFullTranscript: fullTranscriptRef,
    getRecentContext: recentContextRef,
    systemPrompt: settings.suggestionPrompt,
    apiKey: settings.groqApiKey,
  })
  const manualRefreshRef = useRef(manualRefresh)
  manualRefreshRef.current = manualRefresh

  const handleChunkReady = useCallback(
    async (blob: Blob) => {
      const key = settingsRef.current.groqApiKey
      if (!key) return

      try {
        const formData = new FormData()
        formData.append("audio", blob, "chunk.webm")
        formData.append("apiKey", key)

        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          let errorMessage = "Transcription failed"
          try {
            const err = await res.json()
            errorMessage = err.error || errorMessage
          } catch {
            // Keep default error text when server response is not JSON.
          }
          setTranscribeError(errorMessage)
          return
        }
        const data = await res.json()
        if (data.text) {
          setTranscribeError(null)
          appendChunk(data.text)
          setTimeout(() => manualRefreshRef.current(), 500)
        }
      } catch (err) {
        setTranscribeError("Transcription failed")
        console.error("Transcription error:", err)
      }
    },
    [appendChunk]
  )

  const { isRecording, error: micError, startRecording, stopRecording } =
    useAudioRecorder({
      onChunkReady: handleChunkReady,
      intervalMs: settings.refreshInterval,
    })

  const { messages, isStreaming, sendMessage, injectSuggestion } = useChat({
    getFullTranscript: fullTranscriptRef,
    chatContextWindow: settings.chatContextWindow,
    systemPrompt: settings.chatPrompt,
    detailPrompt: settings.detailPrompt,
    apiKey: settings.groqApiKey,
  })

  const handleStart = useCallback(() => {
    if (!settings.groqApiKey) {
      setShowSettings(true)
      return
    }
    if (!settings.groqApiKey.startsWith("gsk_")) {
      alert("Invalid Groq API key. It should start with gsk_")
      setShowSettings(true)
      return
    }
    startRecording()
  }, [settings.groqApiKey, startRecording])

  const handleStop = useCallback(() => {
    stopRecording()
  }, [stopRecording])

  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      injectSuggestion(suggestion)
    },
    [injectSuggestion]
  )

  const handleExport = useCallback(() => {
    const session = buildExport(chunks, batches, messages)
    downloadSession(session)
  }, [chunks, batches, messages])

  const handleSaveSettings = useCallback((next: AppSettings) => {
    setSettings(next)
    setShowSettings(false)
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0a0a0a" }}>
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: "52px",
        borderBottom: "1px solid #141414",
        background: "#0a0a0a",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "20px", height: "20px", borderRadius: "6px", background: "#e8e6e1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0a0a0a" }} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#e8e6e1", letterSpacing: "0.02em" }}>TwinMind Live</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {!settings.groqApiKey && (
            <span style={{ fontSize: "11px", color: "#f97316", background: "rgba(249,115,22,0.1)", padding: "3px 10px", borderRadius: "999px", border: "1px solid rgba(249,115,22,0.2)" }}>
              API key required
            </span>
          )}
          <button
            onClick={handleExport}
            disabled={chunks.length === 0 && messages.length === 0}
            style={{ fontSize: "12px", color: "#404040", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", opacity: chunks.length === 0 && messages.length === 0 ? 0.3 : 1 }}
          >
            Export
          </button>
          <button
            onClick={() => setShowSettings(true)}
            style={{ fontSize: "12px", color: "#606060", background: "#141414", border: "1px solid #1e1e1e", borderRadius: "7px", padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}
          >
            Settings
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: "33.33%", padding: "24px", overflow: "hidden", display: "flex", flexDirection: "column", borderRight: "1px solid #111111" }}>
          <TranscriptPanel chunks={chunks} isRecording={isRecording} error={micError || transcribeError} onStart={handleStart} onStop={handleStop} />
        </div>

        <div style={{ width: "33.33%", padding: "24px", overflow: "hidden", display: "flex", flexDirection: "column", borderRight: "1px solid #111111", background: "#080808" }}>
          <SuggestionsPanel batches={batches} isLoading={suggestionsLoading} error={suggestionsError} isRecording={isRecording} onSuggestionClick={handleSuggestionClick} onManualRefresh={manualRefresh} />
        </div>

        <div style={{ width: "33.33%", padding: "24px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <ChatPanel messages={messages} isStreaming={isStreaming} onSendMessage={sendMessage} />
        </div>
      </div>

      {showSettings && (
        <SettingsDrawer settings={settings} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}
