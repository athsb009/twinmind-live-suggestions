"use client"

import { useEffect, useRef } from "react"
import { TranscriptChunk } from "@/types"
import { MicButton } from "./MicButton"

interface TranscriptPanelProps {
  chunks: TranscriptChunk[]
  isRecording: boolean
  error: string | null
  onStart: () => void
  onStop: () => void
}

export const TranscriptPanel = ({
  chunks,
  isRecording,
  error,
  onStart,
  onStop,
}: TranscriptPanelProps) => {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chunks])

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#404040", marginBottom: "2px" }}>
            Transcript
          </p>
          {isRecording && (
            <p style={{ fontSize: "11px", color: "#ef4444", display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulse-ring 1.5s infinite" }} />
              Live
            </p>
          )}
        </div>
        <MicButton isRecording={isRecording} onStart={onStart} onStop={onStop} />
      </div>

      {error && (
        <div style={{ marginBottom: "12px", padding: "10px 12px", borderRadius: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: "12px", color: "#f87171" }}>
          {error}
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
        {chunks.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#2e2e2e", marginTop: "16px", lineHeight: "1.6" }}>
            {isRecording
              ? "Listening — transcript appears every 30s."
              : "Hit record to start transcribing."}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {chunks.map((chunk, i) => (
              <div key={chunk.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 20}ms` }}>
                <span style={{ fontSize: "10px", color: "#2e2e2e", display: "block", marginBottom: "4px", fontFamily: "'Geist Mono', monospace" }}>
                  {new Date(chunk.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
                <p style={{ fontSize: "13px", color: "#8a8880", lineHeight: "1.65", margin: 0 }}>
                  {chunk.text}
                </p>
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
