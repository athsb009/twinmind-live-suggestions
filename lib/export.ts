import { SessionExport, TranscriptChunk, SuggestionBatch, ChatMessage } from "@/types"

export const buildExport = (
  transcript: TranscriptChunk[],
  suggestionBatches: SuggestionBatch[],
  chatHistory: ChatMessage[]
): SessionExport => ({
  exportedAt: new Date().toISOString(),
  transcript,
  suggestionBatches,
  chatHistory,
})

export const downloadSession = (session: SessionExport): void => {
  const json = JSON.stringify(session, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `twinmind-session-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
