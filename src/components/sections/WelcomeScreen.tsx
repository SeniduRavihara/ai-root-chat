"use client";

import { useState } from "react";
import { Send, Bot, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export default function WelcomeScreen({ onSendMessage, isLoading = false }: WelcomeScreenProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const examplePrompts = [
    "Explain quantum physics in simple terms",
    "Help me plan a healthy meal prep for the week",
    "Write a creative story about time travel",
    "Debug this JavaScript error: 'Cannot read property of undefined'"
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-yellow-800" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to AI Chat
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          Start a conversation with AI. Ask anything, get creative, or explore ideas together.
        </p>
      </div>

      {/* Example Prompts */}
      <div className="mb-8 w-full max-w-2xl px-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">Try asking:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {examplePrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => setMessage(prompt)}
              className="p-3 text-left bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 group"
              disabled={isLoading}
            >
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {prompt}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="w-full max-w-2xl px-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full px-6 py-4 pr-16 text-lg border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-colors duration-200 shadow-md"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          Press Enter to send • Your conversation will be automatically named based on the content
        </p>
      </div>
    </div>
  );
}
