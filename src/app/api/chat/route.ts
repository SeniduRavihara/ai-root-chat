import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { question, apiKey, history } = await req.json();

    if (!question) {
      return new Response(JSON.stringify({ error: "Missing question" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    // Convert our history format to Gemini format
    let geminiHistory = [];
    if (history && Array.isArray(history)) {
      geminiHistory = history.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: msg.parts || [{ text: msg.content }]
      }));
    }

    // Add system message if not already present
    const systemMessage = {
      role: "user",
      parts: [{
        text: "DON'T WASTE TOKENS - Keep responses concise but helpful. You are an assistant. give the result with markdown styles to impress and equations in math answers"
      }]
    };

    if (!geminiHistory.length ||
        !geminiHistory[0].parts[0].text.includes("DON'T WASTE TOKENS")) {
      geminiHistory = [systemMessage, ...geminiHistory];
    }

    // Start chat with history
    const chat = model.startChat({
      history: geminiHistory,
    });

    const result = await chat.sendMessageStream(question);

    const encoder = new TextEncoder();
    let fullResponse = "";
    let fullHistory = [...geminiHistory];

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullResponse += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ delta: text })}\n\n`)
              );
            }
          }

          // Add the assistant's response to history
          fullHistory.push({
            role: "model",
            parts: [{ text: fullResponse }]
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, history: fullHistory })}\n\n`));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}