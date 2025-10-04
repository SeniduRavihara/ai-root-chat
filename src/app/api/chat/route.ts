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

    const systemMessage = {
      role: "user",
      parts: [
        {
          text:
            "You are an assistant. give the result with markdown styles to impress and equations in math answers",
        },
      ],
    };

    let fullHistory = [];
    if (
      !history.length ||
      !(
        history[0]?.parts &&
        history[0].parts[0]?.text &&
        history[0].parts[0].text.includes(" give the result with markdown styles to impress and equations in math answers")
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
  } catch (error) {
    // LOG THE ACTUAL ERROR
    console.error("API Error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Invalid request body",
        details: error instanceof Error ? error.message : String(error)
      }), 
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}