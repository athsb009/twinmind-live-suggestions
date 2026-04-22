# TwinMind Live

An always-on AI meeting copilot that listens to your conversations and surfaces real-time suggestions — answers, fact-checks, talking points, and clarifications — exactly when you need them.

Built for the TwinMind Live Suggestions Assignment.

---

## Live Demo

[twinmind-live.vercel.app](https://twinmind-live-suggestions-gamma.vercel.app/)

---

## Setup

**Requirements:** Node.js 18+, a free Groq API key from [console.groq.com](https://console.groq.com)

```bash
git clone https://github.com/yourusername/twinmind-live
cd twinmind-live
npm install
npm run dev
```

Open `localhost:3000`, click **Settings**, paste your Groq API key (`gsk_...`), and click **Save settings**. Hit **Record** and start talking.

No `.env` file needed. The API key is user-provided at runtime and never stored server-side.

---

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 (App Router) | API routes for server-side Groq calls, easy Vercel deploy, clean file structure |
| Styling | Inline styles + CSS keyframes | Full control, no Tailwind purge issues, dark theme without class conflicts |
| Transcription | Groq Whisper Large V3 | Assignment requirement, best-in-class accuracy at low latency |
| Suggestions + Chat | Groq GPT-OSS 120B (`openai/gpt-oss-120b`) | Assignment requirement, 500 t/s, 131k context window |
| Markdown rendering | react-markdown | Clean streaming markdown in chat responses |
| ID generation | nanoid | Lightweight, URL-safe unique IDs for chunks, suggestions, messages |

No database. No auth. No external state. Session lives entirely in React state — by design.

---

## Architecture

Three columns, three concerns, cleanly separated:

```
Browser
├── TranscriptPanel    → useAudioRecorder + useTranscript
├── SuggestionsPanel   → useSuggestions
└── ChatPanel          → useChat

Next.js API Routes
├── /api/transcribe    → Groq Whisper Large V3
├── /api/suggestions   → Groq GPT-OSS 120B (JSON mode)
└── /api/chat          → Groq GPT-OSS 120B (streaming)

lib/
├── groq.ts            → Groq client factory
├── prompts.ts         → All default prompts as named constants
└── export.ts          → Session export builder
```

All Groq calls are proxied through Next.js API routes. The browser never calls Groq directly. This means adding auth, rate limiting, or swapping the model provider is a single change in the route — not scattered across the frontend.

**Suggestion trigger flow:**

```
User speaks
  → MediaRecorder fires every 30s
  → Audio blob → /api/transcribe → Whisper
  → Transcript chunk appended to state
  → 500ms later → /api/suggestions fires automatically
  → New batch of 3 cards prepended to suggestions panel
```

Suggestions are triggered by new transcript chunks, not a separate timer. This keeps them in sync with what was actually just said rather than firing on an arbitrary clock.

---

## Prompt Strategy

This is the core of the assignment. The suggestion prompt does two things before generating output:

**Step 1 — Classify the conversational moment:**

The model identifies what just happened in the last 60-90 seconds from one of six categories: `QUESTION_ASKED`, `CLAIM_MADE`, `TOPIC_INTRODUCED`, `DECISION_POINT`, `CONFUSION`, or `SOCIAL_MOMENT`. This classification drives everything downstream.

**Step 2 — Apply type rules based on classification:**

Each classification maps to specific suggestion types:
- `QUESTION_ASKED` → first suggestion must be an `answer` with the actual answer
- `CLAIM_MADE` → must include at least one `fact_check` naming the specific claim
- `TOPIC_INTRODUCED` → `talking_point` with angles not yet considered
- `DECISION_POINT` → `question` that sharpens decision criteria
- `CONFUSION` → `clarification` that directly resolves the ambiguity
- `SOCIAL_MOMENT` → empty array, no forced suggestions

**Why this works:**

Most naive implementations just ask the model to "generate 3 useful suggestions." This produces 3 generic questions every time regardless of context. By forcing classification first, the model reasons about what kind of help is actually needed before generating anything.

**The preview rule:**

Each suggestion card preview must be useful standalone — the participant should learn something just from reading it, even if they never click. This is the hardest constraint to enforce and the one that most directly determines whether suggestions feel valuable.

```
Bad:  "Ask a clarifying question about the budget"
Good: "Q4 budget of $2M is 30% below what similar teams typically allocate"
```

**Context windows:**

- Suggestions use the last 3 transcript chunks (~90 seconds) as `RECENT CONTEXT`, plus the full transcript for background awareness
- Chat uses the full transcript so answers are grounded in the complete session
- Both are configurable in Settings

**Chat and detail expansion:**

The chat prompt is tuned for concision — 3-5 sentences, no headers, no tables unless asked. The detail expansion prompt (fired when a suggestion is clicked) routes on suggestion type: `fact_check` cards get a correction with the accurate figure, `answer` cards get supporting reasoning, `talking_point` cards get 2-3 concrete expansions.

---

## Settings

All prompts and parameters are editable at runtime via the Settings drawer. Hardcoded defaults are in `lib/prompts.ts`. Evaluators can modify prompts live during the demo without redeploying.

| Setting | Default | Purpose |
|---------|---------|---------|
| Groq API key | — | User-provided, never hardcoded |
| Suggestion context window | 3 chunks | How many chunks feed the suggestion prompt |
| Chat context window | 10 chunks | How much transcript backs the chat |
| Auto-refresh interval | 30s | Controls both audio chunk size and suggestion cadence |
| Suggestion prompt | See lib/prompts.ts | Fully editable live |
| Chat prompt | See lib/prompts.ts | Fully editable live |
| Detail expansion prompt | See lib/prompts.ts | Fully editable live |

---

## Export

The Export button downloads a timestamped JSON file containing the full session:

```json
{
  "exportedAt": "2026-04-22T05:19:30.443Z",
  "transcript": [...],
  "suggestionBatches": [...],
  "chatHistory": [...]
}
```

Every suggestion is linked to its batch. Every chat message is linked to the suggestion that triggered it via `linkedSuggestionId`. The structure is designed to be readable by a human reviewer without any tooling.

---

## Tradeoffs

**No streaming for suggestions**

Suggestions come back as a single JSON object, not streamed. Streaming JSON is fragile — partial JSON can't be parsed mid-stream and the model needs to finish the full classification reasoning before the output is useful anyway. A skeleton loading state covers the latency gap visually.

**Suggestions trigger on transcript chunks, not a fixed timer**

This means if Whisper is slow, suggestions are delayed. The tradeoff is that suggestions are always grounded in real new content rather than firing on stale context. A fixed timer would sometimes fire with nothing new to say.

**API key in request body**

The key is passed from the browser to the Next.js API route in the request body on every call. In production you would store it server-side after a one-time auth flow. For this assignment — user-provided key, no multi-tenancy, no persistence — this is the right tradeoff.

**No persistence on reload**

Session state lives entirely in React state. Refreshing the page clears everything. The assignment explicitly says no data persistence is needed. The export feature is the escape hatch for saving session data.

**react-markdown adds a small bundle cost**

A lightweight alternative would be a custom markdown parser. The tradeoff is correctness and maintenance — react-markdown handles edge cases in model output (nested lists, code blocks, tables) that a custom parser would miss.

---

## What I would do with more time

- Add diarization — speaker labels in the transcript so suggestions can reference "the speaker on the left asked..." rather than treating the whole conversation as one voice
- Persist sessions to localStorage with a session picker so users can review past meetings
- Add confidence indicators on suggestions — a visual signal for how certain the model is about a fact-check claim
- Stream suggestion previews progressively as they arrive rather than waiting for all 3
- Add keyboard shortcuts — tap a number key to inject suggestion 1, 2, or 3 into chat without reaching for the mouse

---

## Project Structure

```
twinmind-live/
├── app/
│   ├── api/
│   │   ├── transcribe/route.ts
│   │   ├── suggestions/route.ts
│   │   └── chat/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ChatPanel.tsx
│   ├── MicButton.tsx
│   ├── SettingsDrawer.tsx
│   ├── SuggestionCard.tsx
│   ├── SuggestionsPanel.tsx
│   └── TranscriptPanel.tsx
├── hooks/
│   ├── useAudioRecorder.ts
│   ├── useChat.ts
│   ├── useSuggestions.ts
│   └── useTranscript.ts
├── lib/
│   ├── export.ts
│   ├── groq.ts
│   └── prompts.ts
└── types/
    └── index.ts
```
