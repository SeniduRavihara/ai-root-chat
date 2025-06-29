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

    // Add a system message to instruct the model to avoid markdown and keep responses simple
    const systemMessage = {
      role: "user",
      parts: [
        {
          text:
            "You are an assistant. Please keep your responses simple and do not use markdown formatting. Only return plain text answers.",
        },
      ],
    };

    // Only add the system message if it's not already present in the history
    let fullHistory = [];
    if (
      !history.length ||
      !(
        history[0]?.parts &&
        history[0].parts[0]?.text &&
        history[0].parts[0].text.includes("do not use markdown")
      )
    ) {
      fullHistory = [systemMessage, ...history];
    } else {
      fullHistory = [...history];
    }

    const currentMessage = {
      role: "user",
      parts: [{ text: question }],
    };

    fullHistory.push(currentMessage);

    const result = await gemi.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullHistory,
    });

    // Prefer plain text, fallback if not present
    let answer = result.text || "No response generated.";

    // Remove markdown formatting if any sneaks through (basic strip)
    answer = answer.replace(/[`*_#>\[\]\(\)]/g, "");

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
