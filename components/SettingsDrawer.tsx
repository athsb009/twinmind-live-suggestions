"use client"

import { useState } from "react"
import { AppSettings } from "@/types"
import { SUGGESTION_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT, DETAIL_EXPANSION_PROMPT } from "@/lib/prompts"

export const DEFAULT_APP_SETTINGS: AppSettings = {
  groqApiKey: "",
  suggestionPrompt: SUGGESTION_SYSTEM_PROMPT,
  chatPrompt: CHAT_SYSTEM_PROMPT,
  detailPrompt: DETAIL_EXPANSION_PROMPT,
  suggestionContextWindow: 3,
  chatContextWindow: 10,
  refreshInterval: 30000,
}

const fieldStyle = {
  width: "100%",
  background: "#0e0e0e",
  border: "1px solid #1e1e1e",
  borderRadius: "8px",
  color: "#e8e6e1",
  padding: "10px 12px",
  fontSize: "12px",
  fontFamily: "'Geist Mono', monospace",
  outline: "none",
  resize: "none" as const,
}

const labelStyle = {
  display: "block",
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "#404040",
  marginBottom: "6px",
}

interface SettingsDrawerProps {
  settings: AppSettings
  onSave: (settings: AppSettings) => void
  onClose: () => void
}

export const SettingsDrawer = ({ settings, onSave, onClose }: SettingsDrawerProps) => {
  const [draft, setDraft] = useState<AppSettings>(settings)
  const update = (key: keyof AppSettings, value: string | number) =>
    setDraft((prev) => ({ ...prev, [key]: value }))
  const hasApiKey = draft.groqApiKey.trim().length > 0
  const isValidApiKeyFormat = /^gsk_[A-Za-z0-9]+$/.test(draft.groqApiKey.trim())

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", justifyContent: "flex-end" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: "480px",
        background: "#0d0d0d",
        borderLeft: "1px solid #1a1a1a",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #1a1a1a" }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#e8e6e1", marginBottom: "2px" }}>Settings</p>
            <p style={{ fontSize: "11px", color: "#404040" }}>Configure your API key and prompts</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#404040", cursor: "pointer", fontSize: "18px", lineHeight: 1, padding: "4px" }}>
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <label style={labelStyle}>Groq API key</label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                value={draft.groqApiKey}
                onChange={(e) => update("groqApiKey", e.target.value)}
                placeholder="gsk_..."
                style={{ ...fieldStyle, resize: undefined, paddingRight: "36px" }}
              />
              {hasApiKey && isValidApiKeyFormat && (
                <span
                  aria-label="API key format valid"
                  title="API key format valid"
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#22c55e",
                    fontSize: "14px",
                    fontWeight: 700,
                    pointerEvents: "none",
                  }}
                >
                  ✓
                </span>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Context window (chunks)</label>
            <input type="number" min={1} max={10} value={draft.suggestionContextWindow} onChange={(e) => update("suggestionContextWindow", Number(e.target.value))} style={{ ...fieldStyle, width: "80px", resize: undefined }} />
            <p style={{ fontSize: "11px", color: "#2e2e2e", marginTop: "4px" }}>Each chunk is ~30s of audio</p>
          </div>

          <div>
            <label style={labelStyle}>Chat context window (chunks)</label>
            <input
              type="number"
              min={1}
              max={20}
              value={draft.chatContextWindow}
              onChange={(e) => update("chatContextWindow", Number(e.target.value))}
              style={{ ...fieldStyle, width: "80px", resize: undefined }}
            />
            <p style={{ fontSize: "11px", color: "#2e2e2e", marginTop: "4px" }}>
              How many transcript chunks to send with chat requests
            </p>
          </div>

          <div>
            <label style={labelStyle}>Auto-refresh interval (seconds)</label>
            <input
              type="number"
              min={15}
              max={120}
              value={draft.refreshInterval / 1000}
              onChange={(e) => update("refreshInterval", Number(e.target.value) * 1000)}
              style={{ ...fieldStyle, width: "80px", resize: undefined }}
            />
            <p style={{ fontSize: "11px", color: "#2e2e2e", marginTop: "4px" }}>
              Also controls audio chunk size
            </p>
          </div>

          <div>
            <label style={labelStyle}>Suggestion prompt</label>
            <textarea value={draft.suggestionPrompt} onChange={(e) => update("suggestionPrompt", e.target.value)} rows={10} style={fieldStyle} />
          </div>

          <div>
            <label style={labelStyle}>Chat prompt</label>
            <textarea value={draft.chatPrompt} onChange={(e) => update("chatPrompt", e.target.value)} rows={5} style={fieldStyle} />
          </div>

          <div>
            <label style={labelStyle}>Detail expansion prompt</label>
            <textarea value={draft.detailPrompt} onChange={(e) => update("detailPrompt", e.target.value)} rows={5} style={fieldStyle} />
          </div>
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid #1a1a1a", display: "flex", gap: "10px" }}>
          <button
            onClick={() => onSave(draft)}
            style={{ flex: 1, background: "#e8e6e1", color: "#0a0a0a", border: "none", borderRadius: "10px", padding: "11px", fontSize: "13px", fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}
          >
            Save settings
          </button>
          <button
            onClick={onClose}
            style={{ padding: "11px 16px", background: "none", border: "1px solid #1e1e1e", borderRadius: "10px", color: "#404040", fontSize: "13px", fontFamily: "inherit", cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
