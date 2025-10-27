import { GoogleGenAI } from "@google/genai";

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const question = searchParams.get("question");

//   const response = await gemi.models.generateContent({
//     model: "gemini-2.0-flash",
//     contents: [
//       {
//         role: "user",
//         parts: [
//           {
//             text: `${question}`,
//           },
//         ],
//       },
//     ],
//   });

//   const answer = response.text || "No response generated.";

//   return new Response(JSON.stringify({ answer }), {
//     status: 200,
//     headers: { "Content-Type": "application/json" },
//   });
// }

export async function GET(request: Request) {
const { searchParams } = new URL(request.url);
const question = searchParams.get("question");
  const apiKey = searchParams.get("apiKey") || process.env.GEMINI_API_KEY;

if (!question) {
return new Response(JSON.stringify({ error: "Missing question" }), {
status: 400,
  headers: { "Content-Type": "application/json" },
  });
  }

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const gemi = new GoogleGenAI({
    apiKey: apiKey,
  });

  // Optional: Get previous history as JSON string
  const historyParam = searchParams.get("history");
  let history = [];

  if (historyParam) {
    try {
      history = JSON.parse(historyParam); // Parse previous messages
    } catch {
      return new Response(JSON.stringify({ error: "Invalid history format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Check if this is a naming request
  const isNamingRequest = searchParams.get("type") === "naming";

  // Add the current user message to the history
  const currentMessage = {
    role: "user",
    parts: [{ text: question }],
  };

  let fullHistory;
  if (isNamingRequest) {
    // For naming, use a special system prompt
    fullHistory = [
      {
        role: "user",
        parts: [{
          text: `DON'T WASTE TOKENS - Keep responses extremely brief. You are a helpful assistant that suggests very short, descriptive names for conversations. Given a conversation snippet, respond with ONLY a name (max 5 words) that best describes the conversation topic. Do not include any explanation or extra text.

${question}`
        }],
      }
    ];
  } else {
    // Add system prompt for regular chat
    const systemMessage = {
    role: "user",
    parts: [{
    text: "You are a helpful AI assistant. Provide clear, informative responses and use markdown formatting for better readability. Use LaTeX equations for mathematical expressions when appropriate."
    }],
    };

    // Check if system message already exists
    const hasSystemMessage = history.length > 0 && history[0]?.parts?.[0]?.text?.includes("You are a helpful AI assistant");

    fullHistory = hasSystemMessage
      ? [...history, currentMessage]
      : [systemMessage, ...history, currentMessage];
  }

  const response = await gemi.models.generateContent({
    model: "gemini-2.0-flash",
    contents: fullHistory,
  });

  const answer = response.text || "No response generated.";

  if (!isNamingRequest) {
    // Add assistant's reply to history for next round (only for regular chat)
    fullHistory.push({
      role: "model",
      parts: [{ text: answer }],
    });
  }

  return new Response(
    JSON.stringify({
      answer,
      history: isNamingRequest ? null : fullHistory, // Don't return history for naming requests
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// export async function POST(request: Request) {
//   // Parse the request body
//   const body = await request.json();
//   const { name } = body;

//   // e.g. Insert new user into your DB
//   const newUser = { id: Date.now(), name };

//   return new Response(JSON.stringify(newUser), {
//     status: 201,
//     headers: { "Content-Type": "application/json" },
//   });
// }
