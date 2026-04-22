import { NextRequest } from "next/server"
import { createGroqClient } from "@/lib/groq"

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, transcript, apiKey } = await req.json()

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing apiKey" }), {
        status: 400,
      })
    }

    const groq = createGroqClient(apiKey)

    const systemWithContext = `${systemPrompt}\n\nFULL TRANSCRIPT FOR CONTEXT:\n${transcript}`

    const stream = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemWithContext },
        ...messages,
      ],
      stream: true,
      temperature: 0.5,
      max_tokens: 1000,
    })

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const token = chunk.choices[0]?.delta?.content ?? ""
          if (token) {
            controller.enqueue(encoder.encode(token))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (err) {
    console.error("Chat error:", err)
    return new Response(JSON.stringify({ error: "Chat failed" }), {
      status: 500,
    })
  }
}