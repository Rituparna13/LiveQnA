import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyB_Lhkf84H8-ZcDqt_DmWQxIfcdipeZdkw"

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful Q&A assistant on a community forum. Please provide a concise, helpful, and polite answer to the following question. Keep it under 50 words if possible.\n\nQuestion: "${question}"`,
                },
              ],
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Gemini API error:", response.status, errorData)

      if (response.status === 429) {
        return NextResponse.json(
          {
            error: "AI service is temporarily busy. Please try again in a moment.",
          },
          { status: 429 },
        )
      }

      return NextResponse.json({ error: "Failed to generate AI response" }, { status: response.status })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      console.error("Unexpected API response format:", data)
      return NextResponse.json({ error: "Invalid response from AI" }, { status: 500 })
    }

    return NextResponse.json({ answer: text })
  } catch (error) {
    console.error("Gemini API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
