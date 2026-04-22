import { NextRequest, NextResponse } from "next/server"
import { createGroqClient } from "@/lib/groq"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audio = formData.get("audio") as File | null
    const apiKey = formData.get("apiKey") as string | null

    if (!audio || !apiKey) {
      return NextResponse.json(
        { error: "Missing audio or apiKey" },
        { status: 400 }
      )
    }

    const groq = createGroqClient(apiKey)

    const transcription = await groq.audio.transcriptions.create({
      file: audio,
      model: "whisper-large-v3",
      response_format: "text",
    })

    return NextResponse.json({ text: transcription })
  } catch (err) {
    console.error("Transcription error:", err)
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 }
    )
  }
}