export const generateAiAnswer = async (questionText: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.error("[v0] GEMINI_API_KEY not found in environment variables")
    return "AI Configuration Error: API Key missing. Please add GEMINI_API_KEY to your environment variables."
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
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
                  text: `You are a helpful Q&A assistant on a community forum. Please provide a concise, helpful, and polite answer to the following question. Keep it under 50 words if possible.\n\nQuestion: "${questionText}"`,
                },
              ],
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      console.error("[v0] Gemini API error:", response.status, response.statusText)
      return "Sorry, I'm having trouble connecting to the AI service right now."
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      console.error("[v0] Unexpected API response format:", data)
      return "I couldn't generate an answer at this time."
    }

    return text
  } catch (error) {
    console.error("[v0] Gemini API Error:", error)
    return "Sorry, I'm having trouble thinking right now. Please try again."
  }
}
