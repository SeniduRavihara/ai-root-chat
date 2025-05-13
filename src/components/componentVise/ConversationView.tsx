"use client";

import {
  Bot,
  GitBranch,
  GitFork,
  MoreHorizontal,
  Plus,
  Send,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import TypingIndicator from "./TypingIndicator";

export default function ConversationView({
  activeBranch,
  getBranchMessages,
  mockBranchesData,
}) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Format timestamp to readable string
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [getBranchMessages(activeBranch)]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // This would normally send to an API, but for now we'll just clear the input
    setMessage("");
    // Simulate typing response
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleCreateBranch = (messageId) => {
    // This would trigger branch creation from this message
    console.log(`Creating branch from message: ${messageId}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Branch header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className="w-8 h-8 rounded-full mr-3 flex items-center justify-center"
              style={{
                backgroundColor: `${mockBranchesData[activeBranch].color}20`,
              }}
            >
              <GitBranch
                size={16}
                style={{ color: mockBranchesData[activeBranch].color }}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {mockBranchesData[activeBranch].name}
              </h2>
              {mockBranchesData[activeBranch].parentId && (
                <div className="text-sm text-gray-500 flex items-center">
                  <span>Forked from</span>
                  <span
                    className="ml-1 font-medium"
                    style={{
                      color:
                        mockBranchesData[
                          mockBranchesData[activeBranch].parentId
                        ].color,
                    }}
                  >
                    {
                      mockBranchesData[mockBranchesData[activeBranch].parentId]
                        .name
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
              <GitFork size={18} />
            </button>
            <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gray-50 dark:bg-gray-950">
        {getBranchMessages(activeBranch).map((message, index) => {
          const isFromParent =
            mockBranchesData[activeBranch].parentId &&
            !mockBranchesData[activeBranch].messages.find(
              (m) => m.id === message.id
            );

          // Check if this message is a branch point
          const hasBranches = Object.values(mockBranchesData).some(
            (branch) =>
              branch.parentId === activeBranch &&
              branch.parentMessageId === message.id
          );

          // Find branches that fork from this message
          const forkingBranches = Object.values(mockBranchesData).filter(
            (branch) =>
              branch.parentId === activeBranch &&
              branch.parentMessageId === message.id
          );

          return (
            <div key={message.id} className="space-y-2">
              <div
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-3/4 rounded-2xl p-5 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white shadow-md"
                      : isFromParent
                      ? "bg-white dark:bg-gray-900 border-l-4 shadow-md"
                      : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md"
                  }`}
                  style={
                    isFromParent
                      ? {
                          borderLeftColor:
                            mockBranchesData[
                              mockBranchesData[activeBranch].parentId
                            ].color,
                        }
                      : {}
                  }
                >
                  <div className="flex items-center mb-2">
                    <div
                      className={`p-1.5 rounded-full ${
                        message.role === "user"
                          ? "bg-blue-600"
                          : "bg-gray-100 dark:bg-gray-800"
                      } mr-2`}
                    >
                      {message.role === "user" ? (
                        <User
                          size={16}
                          className={
                            message.role === "user"
                              ? "text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }
                        />
                      ) : (
                        <Bot
                          size={16}
                          className="text-gray-700 dark:text-gray-300"
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs ${
                        message.role === "user"
                          ? "text-blue-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {message.role === "user" ? "You" : "Assistant"} •{" "}
                      {formatTime(message.timestamp)}
                    </span>
                    {isFromParent && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        From parent
                      </span>
                    )}

                    {message.role === "assistant" && !isFromParent && (
                      <button className="ml-auto text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center">
                        <GitFork size={12} className="mr-1" /> Branch
                      </button>
                    )}
                  </div>

                  <div className="mt-1 text-base">{message.content}</div>
                </div>
              </div>

              {/* Show branch indicators if this message has branches */}
              {hasBranches && message.role === "assistant" && (
                <div className="flex justify-start pl-12 mt-1 mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <GitBranch size={12} className="mr-1" />
                      {forkingBranches.length === 1
                        ? "1 branch"
                        : `${forkingBranches.length} branches`}{" "}
                      fork from here
                    </div>
                    <div className="flex space-x-1">
                      {forkingBranches.slice(0, 3).map((branch) => (
                        <div
                          key={branch.id}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: branch.color }}
                          title={branch.name}
                        ></div>
                      ))}
                      {forkingBranches.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{forkingBranches.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Show a separator between messages from parent branch and current branch */}
              {index > 0 &&
                isFromParent &&
                !getBranchMessages(activeBranch)[index - 1].id.includes(
                  mockBranchesData[activeBranch].messages[0].id
                ) && (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-full max-w-xs flex items-center">
                      <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
                      <div
                        className="px-4 py-1 text-xs rounded-full flex items-center mx-2"
                        style={{
                          backgroundColor: `${mockBranchesData[activeBranch].color}20`,
                          color: mockBranchesData[activeBranch].color,
                        }}
                      >
                        <GitBranch size={12} className="mr-1" />
                        Branch point
                      </div>
                      <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
                    </div>
                  </div>
                )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}

        {/* Invisible element for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <form
          onSubmit={handleSubmit}
          className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow bg-transparent outline-none px-3 py-2"
          />
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <Plus size={20} />
            </button>
            <button
              type="submit"
              disabled={!message.trim()}
              className={`ml-2 px-4 py-2 ${
                message.trim()
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              } rounded-lg flex items-center`}
            >
              <Send size={16} className="mr-2" /> Send
            </button>
          </div>
        </form>

        {/* Branch info pill */}
        <div className="flex justify-center mt-3">
          <div
            className="flex items-center px-3 py-1 rounded-full text-xs"
            style={{
              backgroundColor: `${mockBranchesData[activeBranch].color}15`,
              color: mockBranchesData[activeBranch].color,
            }}
          >
            <GitBranch size={12} className="mr-1" />
            Currently in {mockBranchesData[activeBranch].name}
          </div>
        </div>
      </div>
    </div>
  );
}
