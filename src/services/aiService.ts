/**
 * AI Service
 * Handles all AI-related operations including chat, streaming, and auto-naming
 */

import { Message } from "../types";

/**
 * Convert our message format to Gemini API format
 */
function convertToGeminiHistory(messages: Message[]) {
  return messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));
}

/**
 * Send a message to AI and get streaming response
 *
 * @param message - The user's message
 * @param history - Previous conversation history
 * @param apiKey - Optional user API key
 * @returns ReadableStream of response chunks
 */
export async function sendMessageStreaming(
  message: string,
  history: Message[],
  apiKey?: string
): Promise<Response> {
  const geminiHistory = convertToGeminiHistory(history);

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: message,
      apiKey: apiKey,
      history: geminiHistory,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API failed: ${response.status}`);
  }

  return response;
}

/**
 * Parse streaming response from AI
 *
 * @param response - Fetch response with streaming body
 * @param onDelta - Callback for each content chunk
 * @param onComplete - Callback when streaming completes
 * @returns Complete response content
 */
export async function parseStreamingResponse(
  response: Response,
  onDelta: (delta: string, fullContent: string) => void,
  onComplete: (fullContent: string) => void
): Promise<string> {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";

  if (!reader) {
    throw new Error("Response body is not readable");
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

    for (const line of lines) {
      const dataStr = line.replace("data: ", "").trim();
      if (dataStr === "[DONE]") break;

      try {
        const data = JSON.parse(dataStr);

        if (data.delta) {
          fullContent += data.delta;
          onDelta(data.delta, fullContent);
        } else if (data.done) {
          onComplete(fullContent);
        }
      } catch (e) {
        console.error("Parse error:", e);
      }
    }
  }

  return fullContent;
}

/**
 * Generate a conversation name using AI
 *
 * @param userMessage - First user message
 * @param aiResponse - First AI response
 * @param apiKey - Optional user API key
 * @returns Suggested conversation name
 */
export async function generateConversationName(
  userMessage: string,
  aiResponse: string,
  apiKey?: string
): Promise<string> {
  const namingPrompt = `User: ${userMessage.substring(0, 200)}${
    userMessage.length > 200 ? "..." : ""
  }\n\nAssistant: ${aiResponse.substring(0, 200)}${
    aiResponse.length > 200 ? "..." : ""
  }`;

  const apiUrl = apiKey
    ? `/api/chat2?question=${encodeURIComponent(
        namingPrompt
      )}&type=naming&apiKey=${encodeURIComponent(apiKey)}`
    : `/api/chat2?question=${encodeURIComponent(namingPrompt)}&type=naming`;

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Naming API failed: ${response.status}`);
  }

  const data = await response.json();
  const suggestedName = data.answer?.trim() || "New Conversation";

  // Clean up the suggested name
  const cleanName = suggestedName
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleanName;
}

/**
 * Generate a branch name using AI based on conversation content
 *
 * @param conversationSnippet - Snippet of the conversation in the branch
 * @param apiKey - Optional user API key
 * @returns Suggested branch name
 */
export async function generateBranchName(
  conversationSnippet: string,
  apiKey?: string
): Promise<string> {
  const namingPrompt = `Based on this conversation, suggest a short, descriptive name (under 5 words): ${conversationSnippet}`;

  const apiUrl = apiKey
    ? `/api/chat2?question=${encodeURIComponent(
        namingPrompt
      )}&type=naming&apiKey=${encodeURIComponent(apiKey)}`
    : `/api/chat2?question=${encodeURIComponent(namingPrompt)}&type=naming`;

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Branch naming API failed: ${response.status}`);
  }

  const data = await response.json();
  const suggestedName = data.answer?.trim() || "Branch Discussion";

  // Clean up the suggested name
  const cleanName = suggestedName
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleanName;
}

/**
 * Generate a branch name from selected text
 *
 * @param selectedText - The text selected by user
 * @param apiKey - Optional user API key
 * @returns Suggested branch name
 */
export async function generateBranchNameFromSelection(
  selectedText: string,
  apiKey?: string
): Promise<string> {
  const namingPrompt = `Suggest a short, descriptive name for a conversation about: "${selectedText}". Keep it under 5 words.`;

  const apiUrl = apiKey
    ? `/api/chat2?question=${encodeURIComponent(
        namingPrompt
      )}&type=naming&apiKey=${encodeURIComponent(apiKey)}`
    : `/api/chat2?question=${encodeURIComponent(namingPrompt)}&type=naming`;

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Branch naming API failed: ${response.status}`);
  }

  const data = await response.json();
  const suggestedName = data.answer?.trim() || "Discussion";

  // Clean up the suggested name
  const cleanName = suggestedName
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleanName;
}

/**
 * Get user's API key from localStorage
 *
 * @returns User's API key or undefined
 */
export function getUserApiKey(): string | undefined {
  try {
    const apiKey = localStorage.getItem("gemini_api_key");
    return apiKey || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Send a message to AI for the welcome screen (creates first chat)
 *
 * @param message - User's first message
 * @returns AI response
 */
export async function sendWelcomeMessage(message: string): Promise<string> {
  const apiKey = getUserApiKey();
  const apiUrl = apiKey
    ? `/api/chat2?question=${encodeURIComponent(
        message
      )}&apiKey=${encodeURIComponent(apiKey)}`
    : `/api/chat2?question=${encodeURIComponent(message)}`;

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get AI response");
  }

  const data = await response.json();
  return data.answer || "I couldn't generate a response.";
}
