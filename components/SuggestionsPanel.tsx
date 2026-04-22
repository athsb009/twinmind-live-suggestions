"use client"

import { SuggestionBatch, Suggestion } from "@/types"
import { SuggestionCard } from "./SuggestionCard"

interface SuggestionsPanelProps {
  batches: SuggestionBatch[]
  isLoading: boolean
  error: string | null
  isRecording: boolean
  onSuggestionClick: (suggestion: Suggestion) => void
  onManualRefresh: () => void
}

export const SuggestionsPanel = ({
  batches,
  isLoading,
  error,
  isRecording,
  onSuggestionClick,
  onManualRefresh,
}: SuggestionsPanelProps) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#404040" }}>
          Suggestions
        </p>
        <button
          onClick={onManualRefresh}
          disabled={isLoading || !isRecording}
          style={{
            fontSize: "11px",
            color: isLoading ? "#2e2e2e" : "#505050",
            background: "none",
            border: "1px solid #1e1e1e",
            borderRadius: "6px",
            padding: "4px 10px",
            cursor: isLoading || !isRecording ? "not-allowed" : "pointer",
            opacity: isLoading || !isRecording ? 0.4 : 1,
            fontFamily: "inherit",
            transition: "all 0.15s ease",
          }}
        >
          {isLoading ? "Thinking..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: "12px", padding: "10px 12px", borderRadius: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: "12px", color: "#f87171" }}>
          {error}
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
        {isLoading && batches.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[80, 64, 72].map((h, i) => (
              <div key={i} className="skeleton" style={{ height: `${h}px` }} />
            ))}
          </div>
        )}

        {!isLoading && batches.length === 0 && (
          <p style={{ fontSize: "13px", color: "#2e2e2e", marginTop: "16px", lineHeight: "1.6" }}>
            {isRecording
              ? "First suggestions arrive after the initial transcript chunk."
              : "Start recording to generate suggestions."}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {batches.map((batch, batchIndex) => (
            <div key={batch.batchId}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                {batchIndex === 0 && (
                  <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#3b82f6", background: "rgba(59,130,246,0.1)", padding: "2px 8px", borderRadius: "999px" }}>
                    New
                  </span>
                )}
                <span style={{ fontSize: "10px", color: "#2e2e2e", fontFamily: "'Geist Mono', monospace" }}>
                  {new Date(batch.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {batch.suggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onClick={onSuggestionClick}
                    isNew={batchIndex === 0}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
