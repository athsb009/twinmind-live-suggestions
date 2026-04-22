"use client"

interface MicButtonProps {
  isRecording: boolean
  onStart: () => void
  onStop: () => void
  disabled?: boolean
}

export const MicButton = ({
  isRecording,
  onStart,
  onStop,
  disabled,
}: MicButtonProps) => {
  return (
    <button
      onClick={isRecording ? onStop : onStart}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: 500,
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        border: isRecording ? "1px solid rgba(239,68,68,0.3)" : "1px solid #2a2a2a",
        background: isRecording ? "rgba(239,68,68,0.1)" : "#141414",
        color: isRecording ? "#f87171" : "#a0a0a0",
        transition: "all 0.2s ease",
        animation: isRecording ? "pulse-ring 2s infinite" : "none",
      }}
    >
      <span style={{
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: isRecording ? "#ef4444" : "#3a3a3a",
        display: "inline-block",
        flexShrink: 0,
      }} />
      {isRecording ? "Stop" : "Record"}
    </button>
  )
}
