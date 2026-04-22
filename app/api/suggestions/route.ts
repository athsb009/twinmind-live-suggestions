import { NextRequest, NextResponse } from "next/server"
import { createGroqClient } from "@/lib/groq"
import { Suggestion, SuggestionType } from "@/types"
import { nanoid } from "nanoid"

export async function POST(req: NextRequest) {
  try {
    const { fullTranscript, recentContext, systemPrompt, apiKey, batchId } =
      await req.json()

    if (!apiKey) {
      return NextResponse.json({ error: "Missing apiKey" }, { status: 400 })
    }

    if (!recentContext || recentContext.trim().length < 20) {
      return NextResponse.json({ suggestions: [] })
    }

    const groq = createGroqClient(apiKey)

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `FULL TRANSCRIPT:\n${fullTranscript}\n\nRECENT CONTEXT (last 60-90 seconds):\n${recentContext}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 1000,
    })

    const raw = completion.choices[0]?.message?.content ?? ""

    let parsed: { suggestions: { type: string; preview: string; detailPrompt: string }[] }

    try {
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json({ suggestions: [] })
    }

    if (!parsed.suggestions || parsed.suggestions.length === 0) {
      return NextResponse.json({ suggestions: [] })
    }

    const timestamp = new Date().toISOString()

    const suggestions: Suggestion[] = parsed.suggestions.map((s) => ({
      id: nanoid(),
      type: s.type as SuggestionType,
      preview: s.preview,
      detailPrompt: s.detailPrompt,
      timestamp,
      batchId,
    }))

    return NextResponse.json({ suggestions })
  } catch (err: unknown) {
    console.error("Suggestions error:", err)
    const status =
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      typeof (err as { status?: unknown }).status === "number"
        ? ((err as { status: number }).status ?? 500)
        : 500

    const message =
      status === 401
        ? "Invalid Groq API key"
        : status === 429
          ? "Rate limit hit — slow down"
          : "Suggestions failed"

    return NextResponse.json({ error: message }, { status })
  }
}