export type SuggestionType =
  | "answer"
  | "question"
  | "talking_point"
  | "fact_check"
  | "clarification"

export interface TranscriptChunk {
  id: string
  text: string
  timestamp: string
}

export interface Suggestion {
  id: string
  type: SuggestionType
  preview: string
  detailPrompt: string
  timestamp: string
  batchId: string
}

export interface SuggestionBatch {
  batchId: string
  timestamp: string
  suggestions: Suggestion[]
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  linkedSuggestionId?: string
}

export interface AppSettings {
  groqApiKey: string
  suggestionPrompt: string
  chatPrompt: string
  detailPrompt: string
  suggestionContextWindow: number
  chatContextWindow: number
  refreshInterval: number
}

export interface SessionExport {
  exportedAt: string
  transcript: TranscriptChunk[]
  suggestionBatches: SuggestionBatch[]
  chatHistory: ChatMessage[]
}