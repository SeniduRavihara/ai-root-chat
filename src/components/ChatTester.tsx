"use client"

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "model" | "error";
  text: string;
}

interface ChatMessage {
  role: string;
  parts: { text: string }[];
}

interface ApiResponse {
  answer: string;
  history: ChatMessage[];
  error?: string;
}

export default function ChatTester() {
  const [question, setQuestion] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [method, setMethod] = useState<"GET" | "POST">("POST");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const sendMessage = async (): Promise<void> => {
    if (!question.trim()) return;

    // Add user message to chat display
    setChatMessages((prev) => [...prev, { role: "user", text: question }]);
    setLoading(true);

    try {
      let result: ApiResponse;

      if (method === "GET") {
        // For GET request
        const historyParam = encodeURIComponent(JSON.stringify(history));
        const url = `/api/chat?question=${encodeURIComponent(
          question
        )}&history=${historyParam}`;
        const res = await fetch(url);
        result = await res.json();
      } else {
        // For POST request
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
            history,
          }),
        });
        result = await res.json();
      }

      if (result.error) {
        throw new Error(result.error);
      }

      // Update with AI response
      setResponse(result.answer);
      setChatMessages((prev) => [
        ...prev,
        { role: "model", text: result.answer },
      ]);

      // Update history for next message
      setHistory(result.history || []);

      // Clear input
      setQuestion("");
    } catch (error) {
      console.error("Error sending message:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "error",
          text:
            error instanceof Error
              ? error.message
              : "Error sending message. Check console for details.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Create a new branch from current point
  const createNewBranch = (): void => {
    // Keep history but clear chat display
    setChatMessages([]);
  };

  // Reset everything
  const resetChat = (): void => {
    setHistory([]);
    setChatMessages([]);
    setResponse("");
    setQuestion("");
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-screen p-4 bg-white text-black">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Chat Tester</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setMethod(method === "GET" ? "POST" : "GET")}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Method: {method}
          </button>
          <button
            onClick={createNewBranch}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            New Branch
          </button>
          <button
            onClick={resetChat}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto border border-gray-300 rounded-lg mb-4 p-4">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Start a conversation by sending a message
          </div>
        ) : (
          chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 p-3 rounded-lg max-w-[80%] ${
                msg.role === "user"
                  ? "bg-blue-100 ml-auto"
                  : msg.role === "error"
                  ? "bg-red-100"
                  : "bg-gray-100"
              }`}
            >
              <div className="font-semibold mb-1">
                {msg.role === "user"
                  ? "You"
                  : msg.role === "model"
                  ? "AI"
                  : "Error"}
              </div>
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-bounce">•</div>
            <div className="animate-bounce delay-75">•</div>
            <div className="animate-bounce delay-150">•</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          disabled={loading || !question.trim()}
        >
          Send
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <div>
          <strong>Current Method:</strong> {method}
        </div>
        <div>
          <strong>History Length:</strong> {history.length} messages
        </div>
        <details className="mt-2">
          <summary className="cursor-pointer">Show Raw History</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40 text-xs">
            {JSON.stringify(history, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
