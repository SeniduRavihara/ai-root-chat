"use client";

// components/InputArea.tsx
import { useState, useRef } from "react";

interface InputAreaProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export default function InputArea({ onSendMessage, disabled }: InputAreaProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSendMessage(input);
    setInput("");
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 border-t border-gray-300 pt-2">
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="flex-1 p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        rows={1}
        disabled={disabled}
      />
      <button
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
      >
        Send
      </button>
    </div>
  );
}