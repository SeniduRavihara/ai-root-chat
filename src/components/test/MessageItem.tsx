"use client";

import { Message } from "@/types";
// components/MessageItem.tsx
interface MessageItemProps {
  message: Message;
  onCreateBranch: (messageId: string) => void;
}

export default function MessageItem({ message, onCreateBranch }: MessageItemProps) {
  return (
    <div
      className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
        message.role === "user"
          ? "bg-blue-500 text-white ml-auto"
          : "bg-white text-gray-800"
      }`}
    >
      <p>{message.content}</p>
      {message.role === "assistant" && (
        <button
          onClick={() => onCreateBranch(message.id)}
          className="text-xs mt-2 text-blue-500 hover:underline"
        >
          Create Branch
        </button>
      )}
    </div>
  );
}