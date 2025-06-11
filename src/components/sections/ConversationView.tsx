"use client";

import { useData } from "@/hooks/useData";
import { Bot, GitBranch, GitFork, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BranchWithMessages, Message } from "../../types";
import ChatInput from "../conversation-view/ChatInput";
import Header from "../conversation-view/Header";
import TypingIndicator from "../conversation-view/TypingIndicator";

interface ConversationViewProps {
  activeBranch: string;
  getBranchMessages: (branchId: string) => Message[];
  mockBranchesData: Record<string, BranchWithMessages>;
}

export default function ConversationView({
  activeBranch,
  getBranchMessages,
  mockBranchesData,
}: ConversationViewProps) {
  const { setCurrentUserData } = useData();
  const [message, setMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const allMessages = getBranchMessages(activeBranch);

  // Format timestamp to readable string
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine which branch a message belongs to directly (not via inheritance)
  const getMessageBranchId = (messageId: string): string | null => {
    for (const branchId in mockBranchesData) {
      const branch = mockBranchesData[branchId];
      if (branch.messages.some((msg) => msg.id === messageId)) {
        return branchId;
      }
    }
    return null;
  };

  // Check if a message is from the currently active branch (directly, not inherited)
  const isMessageFromActiveBranch = (messageId: string): boolean => {
    return mockBranchesData[activeBranch].messages.some(
      (msg) => msg.id === messageId
    );
  };

  // Find the branch that a message belongs to
  const getMessageBranch = (messageId: string): BranchWithMessages | null => {
    const branchId = getMessageBranchId(messageId);
    return branchId ? mockBranchesData[branchId] : null;
  };

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getBranchMessages(activeBranch)]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Optionally, add the user's message to the branch immediately
    setCurrentUserData((prev) => {
      if (!prev) return prev;
      const updatedBranches = {
        ...prev.branches,
        [activeBranch]: {
          ...prev.branches[activeBranch],
          messages: [
            ...prev.branches[activeBranch].messages,
            {
              id: `user-${Date.now()}`,
              role: "user",
              content: message,
              timestamp: new Date().toISOString(),
            },
          ],
        },
      };
      return { ...prev, branches: updatedBranches };
    });

    setMessage("");
    setIsTyping(true);

    // Send to API and get the assistant's reply
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify({
      question: message,
      // Gemini expects history as an array of {role, parts: [{text}]}
      history: allMessages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
      }),
    });

    const data = await response.json();
    const assistantMessage = data.answer; // adjust if your API returns differently

    console.log("Assistant's reply:", assistantMessage);

    // Add the assistant's reply to the branch
    setCurrentUserData((prev) => {
      if (!prev) return prev;
      const updatedBranches = {
        ...prev.branches,
        [activeBranch]: {
          ...prev.branches[activeBranch],
          messages: [
            ...prev.branches[activeBranch].messages,
            {
              id: `user-${Date.now()}`,
              role: "assistant",
              content: assistantMessage,
              timestamp: new Date().toISOString(),
            },
          ],
        },
      };
      return { ...prev, branches: updatedBranches };
    });

    setIsTyping(false);
  };

  // const handleCreateBranch = (messageId: string) => {
  //   // This would trigger branch creation from this message
  //   console.log(`Creating branch from message: ${messageId}`);
  // };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Branch header */}
      <Header mockBranchesData={mockBranchesData} activeBranch={activeBranch} />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gray-50 dark:bg-gray-950">
        {allMessages.map((message, index) => {
          // Determine if this message is from the active branch or inherited
          const isFromCurrentBranch = isMessageFromActiveBranch(message.id);
          const messageBranch = getMessageBranch(message.id);

          // Check if this message is a branch point
          const hasBranches = Object.values(mockBranchesData).some(
            (branch) => branch.parentMessageId === message.id
          );

          // Find branches that fork from this message
          const forkingBranches = Object.values(mockBranchesData).filter(
            (branch) => branch.parentMessageId === message.id
          );

          return (
            <div key={message.id} className="space-y-2">
              {/* Branch transition indicator */}
              {index > 0 &&
                (() => {
                  const prevMessageBranchId = getMessageBranchId(
                    allMessages[index - 1].id
                  );
                  const currentMessageBranchId = getMessageBranchId(message.id);

                  if (
                    prevMessageBranchId &&
                    currentMessageBranchId &&
                    prevMessageBranchId !== currentMessageBranchId
                  ) {
                    const currentBranch =
                      mockBranchesData[currentMessageBranchId];

                    return (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-full max-w-xs flex items-center">
                          <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
                          <div
                            className="px-4 py-1 text-xs rounded-full flex items-center mx-2"
                            style={{
                              backgroundColor: `${currentBranch.color}20`,
                              color: currentBranch.color,
                            }}
                          >
                            <GitBranch size={12} className="mr-1" />
                            {currentBranch.name} branch begins
                          </div>
                          <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

              <div
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-3/4 rounded-2xl p-5 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white shadow-md"
                      : !isFromCurrentBranch
                      ? "bg-white dark:bg-gray-900 border-l-4 shadow-md"
                      : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md"
                  }`}
                  style={
                    !isFromCurrentBranch && messageBranch
                      ? {
                          borderLeftColor: messageBranch.color,
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
                    {!isFromCurrentBranch && messageBranch && (
                      <span
                        className="ml-2 text-xs px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300"
                        style={{
                          backgroundColor: `${messageBranch.color}20`,
                          color: messageBranch.color,
                        }}
                      >
                        From {messageBranch.name}
                      </span>
                    )}

                    {message.role === "assistant" && (
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
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}

        {/* Invisible element for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <ChatInput
        message={message}
        setMessage={setMessage}
        handleSubmit={handleSubmit}
        mockBranchesData={mockBranchesData}
        activeBranch={activeBranch}
      />
    </div>
  );
}
