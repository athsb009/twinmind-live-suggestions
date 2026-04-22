"use client"

import { Suggestion, SuggestionType } from "@/types"

const TYPE_CONFIG: Record<SuggestionType, { label: string; accent: string; bg: string; text: string }> = {
  answer:        { label: "Answer",        accent: "#22c55e", bg: "rgba(34,197,94,0.08)",   text: "#4ade80" },
  question:      { label: "Question",      accent: "#3b82f6", bg: "rgba(59,130,246,0.08)",  text: "#60a5fa" },
  talking_point: { label: "Talking point", accent: "#a855f7", bg: "rgba(168,85,247,0.08)",  text: "#c084fc" },
  fact_check:    { label: "Fact check",    accent: "#f97316", bg: "rgba(249,115,22,0.08)",  text: "#fb923c" },
  clarification: { label: "Clarify",       accent: "#eab308", bg: "rgba(234,179,8,0.08)",   text: "#facc15" },
}

interface SuggestionCardProps {
  suggestion: Suggestion
  onClick: (suggestion: Suggestion) => void
  isNew?: boolean
}

export const SuggestionCard = ({ suggestion, onClick, isNew }: SuggestionCardProps) => {
  const config = TYPE_CONFIG[suggestion.type]

  return (
    <button
      onClick={() => onClick(suggestion)}
      className="animate-fade-in-up"
      style={{
        width: "100%",
        textAlign: "left",
        padding: "14px 16px",
        borderRadius: "12px",
        border: `1px solid #1e1e1e`,
        background: "#111111",
        cursor: "pointer",
        transition: "all 0.15s ease",
        display: "block",
        borderLeft: `3px solid ${config.accent}`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = "#181818"
        ;(e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = "#111111"
        ;(e.currentTarget as HTMLElement).style.borderColor = "#1e1e1e"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          padding: "3px 8px",
          borderRadius: "999px",
          background: config.bg,
          color: config.text,
          fontFamily: "inherit",
        }}>
          {config.label}
        </span>
        <span style={{ fontSize: "11px", color: "#3a3a3a", marginLeft: "auto" }}>
          {new Date(suggestion.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      <p style={{
        fontSize: "13px",
        color: "#c8c6c1",
        lineHeight: "1.5",
        margin: 0,
        fontFamily: "inherit",
      }}>
        {suggestion.preview}
      </p>
    </button>
  )
}
