"use client";

import React, { useState } from 'react';
import { ArrowRight, Mic, Plus, Radio, X } from 'lucide-react';

interface FollowUpInputProps {
  followUpContext: string | null;
  onClearContext: () => void;
  onSubmit: (messageData: { text: string; context: string | null }) => void;
}

const FollowUpInput: React.FC<FollowUpInputProps> = ({
  followUpContext,
  onClearContext,
  onSubmit
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Send the message and context to the parent
    onSubmit({
      text: message,
      context: followUpContext,
    });

    // Reset the input and context
    setMessage('');
    onClearContext();
  };

  return (
    <div className="w-full p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* Context Bar (Conditional) */}
      {followUpContext && (
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg mb-2">
          <ArrowRight className="text-gray-400 text-xl" />
          <span className="text-white flex-grow mx-3 truncate">
            "{followUpContext.length > 30 ? followUpContext.substring(0, 30) + '...' : followUpContext}"
          </span>
          <X
            className="text-gray-400 text-2xl cursor-pointer hover:text-gray-300"
            onClick={onClearContext}
          />
        </div>
      )}

      {/* Main Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center p-2 bg-gray-700 rounded-lg"
      >
        <Plus className="text-gray-400 cursor-pointer text-2xl p-2 hover:bg-gray-600 rounded-full transition-colors" />

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask anything"
          className="flex-grow bg-transparent border-none text-white placeholder-gray-500 focus:outline-none mx-2"
        />

        <Mic className="text-gray-400 cursor-pointer text-xl p-2 hover:bg-gray-600 rounded-full transition-colors" />

        <button
          type="submit"
          className="text-white bg-gray-600 hover:bg-gray-500 rounded-full p-2 ml-1 cursor-pointer transition-colors"
          disabled={!message.trim()}
        >
          <Radio className="text-xl" />
        </button>
      </form>
    </div>
  );
};

export default FollowUpInput;
