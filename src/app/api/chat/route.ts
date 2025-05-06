import { GoogleGenAI } from "@google/genai";

const gemi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const question = body.question;
    const historyParam = body.history;

    if (!question) {
      return new Response(JSON.stringify({ error: "Missing question" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let history = [];

    if (historyParam) {
      try {
        history = Array.isArray(historyParam)
          ? historyParam
          : JSON.parse(historyParam);
      } catch {
        return new Response(
          JSON.stringify({ error: "Invalid history format" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    const currentMessage = {
      role: "user",
      parts: [{ text: question }],
    };

    const fullHistory = [...history, currentMessage];

    const result = await gemi.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullHistory,
    });

    const answer = result.text || "No response generated.";

    fullHistory.push({
      role: "model",
      parts: [{ text: answer }],
    });

    return new Response(
      JSON.stringify({
        answer,
        history: fullHistory,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
