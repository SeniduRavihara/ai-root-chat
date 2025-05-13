import { GoogleGenAI } from "@google/genai";

const gemi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

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

  if (!question) {
    return new Response(JSON.stringify({ error: "Missing question" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

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

  // Add the current user message to the history
  const currentMessage = {
    role: "user",
    parts: [{ text: question }],
  };

  const fullHistory = [...history, currentMessage];

  const response = await gemi.models.generateContent({
    model: "gemini-2.0-flash",
    contents: fullHistory,
  });

  const answer = response.text || "No response generated.";

  // Add assistant's reply to history for next round
  fullHistory.push({
    role: "model",
    parts: [{ text: answer }],
  });

  return new Response(
    JSON.stringify({
      answer,
      history: fullHistory, // Return updated history for reuse
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
