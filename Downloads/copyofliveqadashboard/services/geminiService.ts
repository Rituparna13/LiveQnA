export const generateAiAnswer = async (
  questionText: string
): Promise<string> => {
  if (!questionText || !questionText.trim()) {
    return "Please enter a valid question.";
  }

  // Try to read Gemini key (optional)
  const apiKey =
    (import.meta as any)?.env?.VITE_GEMINI_API_KEY || null;

  // -----------------------------
  // MOCK MODE 
  // -----------------------------
  if (!apiKey) {
    console.warn("[AI] No API key found. Using mock AI response.");

    return `Thanks for your question! A community member or admin should be able to help you with this shortly. In the meantime, please check the relevant documentation or previous discussions for similar topics.`;
  }

  // -----------------------------
  //  REAL GEMINI MODE 
  // -----------------------------
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${apiKey}`,
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
                  text: `You are a helpful Q&A assistant on a community forum.
Provide a concise, polite answer (max 50 words).

Question: "${questionText}"`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("[AI] Gemini API failed:", response.status);
      return "AI service is temporarily unavailable. Please try again later.";
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return (
      text ||
      "I couldn't generate an answer at this time. Please try again later."
    );
  } catch (error) {
    console.error("[AI] Gemini error:", error);
    return "AI service error. Please try again later.";
  }
};

// export const generateAiAnswer = async (questionText: string): Promise<string> => {
//   const apiKey = process.env.GEMINI_API_KEY

//   if (!apiKey) {
//     console.error("[v0] GEMINI_API_KEY not found in environment variables")
//     return "AI Configuration Error: API Key missing. Please add GEMINI_API_KEY to your environment variables."
//   }

//   try {
//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   text: `You are a helpful Q&A assistant on a community forum. Please provide a concise, helpful, and polite answer to the following question. Keep it under 50 words if possible.\n\nQuestion: "${questionText}"`,
//                 },
//               ],
//             },
//           ],
//         }),
//       },
//     )

//     if (!response.ok) {
//       console.error("[v0] Gemini API error:", response.status, response.statusText)
//       return "Sorry, I'm having trouble connecting to the AI service right now."
//     }

//     const data = await response.json()
//     const text = data.candidates?.[0]?.content?.parts?.[0]?.text

//     if (!text) {
//       console.error("[v0] Unexpected API response format:", data)
//       return "I couldn't generate an answer at this time."
//     }

//     return text
//   } catch (error) {
//     console.error("[v0] Gemini API Error:", error)
//     return "Sorry, I'm having trouble thinking right now. Please try again."
//   }
// }
