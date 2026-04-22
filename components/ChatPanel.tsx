"use client"

import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import { ChatMessage } from "@/types"

interface ChatPanelProps {
  messages: ChatMessage[]
  isStreaming: boolean
  onSendMessage: (text: string) => void
}

export const ChatPanel = ({
  messages,
  isStreaming,
  onSendMessage,
}: ChatPanelProps) => {
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || isStreaming) return
    onSendMessage(input.trim())
    setInput("")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#404040" }}>
          Chat
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px", marginBottom: "12px" }}>
        {messages.length === 0 && (
          <p style={{ fontSize: "13px", color: "#2e2e2e", marginTop: "16px", lineHeight: "1.6" }}>
            Click a suggestion or ask anything about the conversation.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className="animate-fade-in-up"
              style={{ display: "flex", justifyContent: message.role === "user" ? "flex-end" : "flex-start" }}
            >
              <div style={{
                maxWidth: "88%",
                padding: "10px 14px",
                borderRadius: message.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                fontSize: "13px",
                lineHeight: "1.6",
                fontFamily: "inherit",
                background: message.role === "user" ? "#1a1a1a" : "#111111",
                color: message.role === "user" ? "#e8e6e1" : "#a0a09a",
                border: message.role === "user" ? "1px solid #2a2a2a" : "1px solid #1a1a1a",
              }}>
                {message.content ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p style={{ margin: "0 0 8px 0", lineHeight: "1.6" }}>{children}</p>,
                      h2: ({ children }) => <p style={{ fontWeight: 600, margin: "12px 0 4px", fontSize: "13px", color: "#e8e6e1" }}>{children}</p>,
                      h3: ({ children }) => <p style={{ fontWeight: 600, margin: "8px 0 4px", fontSize: "12px", color: "#c8c6c1" }}>{children}</p>,
                      ul: ({ children }) => <ul style={{ paddingLeft: "16px", margin: "4px 0" }}>{children}</ul>,
                      li: ({ children }) => <li style={{ marginBottom: "4px", fontSize: "13px" }}>{children}</li>,
                      table: ({ children }) => (
                        <div style={{ overflowX: "auto", margin: "8px 0" }}>
                          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "12px" }}>{children}</table>
                        </div>
                      ),
                      th: ({ children }) => <th style={{ padding: "6px 8px", borderBottom: "1px solid #2a2a2a", textAlign: "left", color: "#606060", fontWeight: 500 }}>{children}</th>,
                      td: ({ children }) => <td style={{ padding: "6px 8px", borderBottom: "1px solid #1a1a1a", color: "#a0a09a" }}>{children}</td>,
                      strong: ({ children }) => <strong style={{ color: "#e8e6e1", fontWeight: 600 }}>{children}</strong>,
                      code: ({ children }) => <code style={{ background: "#1a1a1a", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontFamily: "'Geist Mono', monospace", color: "#c8c6c1" }}>{children}</code>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <span style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
                    {[0, 150, 300].map((delay) => (
                      <span key={delay} style={{
                        width: "5px", height: "5px", borderRadius: "50%",
                        background: "#3a3a3a", display: "inline-block",
                        animation: `pulse-ring 1.2s ${delay}ms infinite`,
                      }} />
                    ))}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Ask anything..."
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            borderRadius: "10px",
            border: "1px solid #1e1e1e",
            background: "#0e0e0e",
            color: "#e8e6e1",
            padding: "10px 12px",
            fontSize: "13px",
            fontFamily: "inherit",
            outline: "none",
            lineHeight: "1.5",
          }}
          onFocus={e => (e.target.style.borderColor = "#2a2a2a")}
          onBlur={e => (e.target.style.borderColor = "#1e1e1e")}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            border: "1px solid #2a2a2a",
            background: input.trim() && !isStreaming ? "#e8e6e1" : "#111111",
            color: input.trim() && !isStreaming ? "#0a0a0a" : "#2a2a2a",
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: "inherit",
            cursor: !input.trim() || isStreaming ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
            flexShrink: 0,
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
