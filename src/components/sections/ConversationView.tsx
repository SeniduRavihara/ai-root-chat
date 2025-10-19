"use client";

import { useData } from "@/hooks/useData";
import { Bot, GitBranch, GitFork, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { BranchWithMessages, Message } from "../../types";
import ChatInput from "../conversation-view/ChatInput";
import Header from "../conversation-view/Header";
import TypingIndicator from "../conversation-view/TypingIndicator";
// Markdown and math imports
import {
  addMessageToBranch,
  createBranchForUser,
} from "@/firebase/services/ChatService";
import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface ConversationViewProps {
  activeBranch: string;
  getBranchMessages: (branchId: string) => Message[];
  branchesData: Record<string, BranchWithMessages>;
}

export default function ConversationView({
  activeBranch,
  getBranchMessages,
}: ConversationViewProps) {
  const { setBranchesData, branchesData, currentUserData, activeChatId } =
    useData();

  const [message, setMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const isNearBottom = () => {
    const el = messagesContainerRef.current;
    if (!el) return true;
    const threshold = 120;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  // Get messages from the active branch
  const getMessages = (): Message[] => {
    const branchMessages = getBranchMessages(activeBranch);
    return branchMessages;
  };

  const allMessages = getMessages();

  // Format timestamp to readable string
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine which branch a message belongs to directly (not via inheritance)
  const getMessageBranchId = (messageId: string): string | null => {
    for (const branchId in branchesData) {
      const branch = branchesData[branchId];
      if (branch.messages.some((msg) => msg.id === messageId)) {
        return branchId;
      }
    }
    return null;
  };

  // Check if a message is from the currently active branch (directly, not inherited)
  const isMessageFromActiveBranch = (messageId: string): boolean => {
    return (
      branchesData[activeBranch]?.messages.some(
        (msg) => msg.id === messageId
      ) || false
    );
  };

  // Find the branch that a message belongs to
  const getMessageBranch = (messageId: string): BranchWithMessages | null => {
    const branchId = getMessageBranchId(messageId);
    return branchId ? branchesData[branchId] : null;
  };

  // Auto scroll when switching branches/chats
  useEffect(() => {
    scrollToBottom("auto");
  }, [activeBranch]);

  // Smooth scroll on new messages or when requested
  useEffect(() => {
    if (shouldScrollToBottom || isNearBottom()) {
      scrollToBottom("smooth");
      setShouldScrollToBottom(false);
    }
  }, [allMessages, shouldScrollToBottom]);

  // Helper to generate a random color
  function getRandomColor() {
    const colors = [
      "#6366f1",
      "#ec4899",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#14b8a6",
      "#f43f5e",
      "#0ea5e9",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || !branchesData || !currentUserData || !activeChatId)
      return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: message,
      timestamp: new Date().toISOString(),
      branchId: activeBranch,
    };

    // Update user data for branch compatibility
    setBranchesData((prev: Record<string, BranchWithMessages>) => {
      const existingBranch = prev?.[activeBranch] ?? {
        id: activeBranch,
        name: activeBranch === "main" ? "Main Branch" : activeBranch,
        parentId: null,
        parentMessageId: null,
        color: "#6366f1",
        messages: [],
      };

      return {
        ...prev,
        [activeBranch]: {
          ...existingBranch,
          messages: [...(existingBranch.messages ?? []), userMessage],
        },
      };
    });

    await addMessageToBranch(
      currentUserData?.uid,
      activeBranch,
      userMessage,
      activeChatId
    );

    setMessage("");
    setIsTyping(true);
    setShouldScrollToBottom(true);

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

    const assistantMessageObj: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant" as const,
      content: assistantMessage,
      timestamp: new Date().toISOString(),
      branchId: activeBranch,
    };

    // // Add the assistant's reply to the branch
    setBranchesData((prev: Record<string, BranchWithMessages>) => {
      const existingBranch = prev?.[activeBranch] ?? {
        id: activeBranch,
        name: activeBranch === "main" ? "Main Branch" : activeBranch,
        parentId: null,
        parentMessageId: null,
        color: "#6366f1",
        messages: [],
      };

      return {
        ...prev,
        [activeBranch]: {
          ...existingBranch,
          messages: [...(existingBranch.messages ?? []), assistantMessageObj],
        },
      };
    });

    await addMessageToBranch(
      currentUserData.uid,
      activeBranch,
      assistantMessageObj,
      activeChatId
    );

    setIsTyping(false);
    setShouldScrollToBottom(true);
  };

  // Branch creation handler
  const handleCreateBranch = async (
    parentBranchId: string,
    parentMessageId: string
  ) => {
    if (!currentUserData || !activeChatId) return;
    const branchName = prompt("Enter a name for the new branch:");
    if (!branchName) return;
    const newBranchId = uuidv4();
    // Do NOT copy parent messages; only store new messages in this branch
    const newBranch = {
      id: newBranchId,
      name: branchName,
      color: getRandomColor(),
      parentId: parentBranchId,
      parentMessageId,
      messages: [], // Only new messages for this branch
    };
    // Add to Firestore
    await createBranchForUser(currentUserData.uid, activeChatId, newBranch);
    // Add to local state
    setBranchesData((prev: Record<string, BranchWithMessages>) => {
      if (!prev) return prev;
      return {
        ...prev,
        branches: {
          ...prev.branches,
          [newBranchId]: newBranch,
        },
      };
    });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Branch header */}
      <Header branchesData={branchesData} activeBranch={activeBranch} />

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50 dark:bg-gray-950 min-h-0"
      >
        {allMessages.map((message, index) => {
          // Determine if this message is from the active branch or inherited
          const isFromCurrentBranch = isMessageFromActiveBranch(message.id);
          const messageBranch = getMessageBranch(message.id);

          // Check if this message is a branch point
          const hasBranches = Object.values(branchesData).some(
            (branch) => branch.parentMessageId === message.id
          );

          // Find branches that fork from this message
          const forkingBranches = Object.values(branchesData).filter(
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
                    const currentBranch = branchesData[currentMessageBranchId];

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
                } mb-3`}
              >
                <div
                  className={`max-w-[85%] rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : !isFromCurrentBranch
                      ? "bg-white dark:bg-gray-900 border-l-2 shadow-sm"
                      : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm"
                  }`}
                  style={
                    !isFromCurrentBranch && messageBranch
                      ? {
                          borderLeftColor: messageBranch.color,
                        }
                      : {}
                  }
                >
                  <div className="flex items-center justify-between p-3 pb-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? "bg-blue-600"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User size={12} className="text-white" />
                      ) : (
                        <Bot
                          size={12}
                          className="text-gray-700 dark:text-gray-300"
                        />
                      )}
                    </div>
                    <span
                      className={`ml-2 text-xs ${
                        message.role === "user"
                          ? "text-blue-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {message.role === "user" ? "You" : "Assistant"}
                    </span>
                    {!isFromCurrentBranch && messageBranch && (
                      <span
                        className="ml-2 text-xs px-1.5 py-0.5 rounded-full text-gray-600 dark:text-gray-300"
                        style={{
                          backgroundColor: `${messageBranch.color}20`,
                          color: messageBranch.color,
                        }}
                      >
                        {messageBranch.name}
                      </span>
                    )}

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs ${
                          message.role === "user"
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </span>
                      {message.role === "assistant" && (
                        <button
                          className="text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center transition-colors"
                          onClick={() =>
                            handleCreateBranch(
                              getMessageBranchId(message.id)!,
                              message.id
                            )
                          }
                        >
                          <GitFork size={10} className="mr-1" /> Branch
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="px-3 pb-3">
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-code:bg-slate-200 dark:prose-code:bg-slate-700 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          code({
                          className,
                          children,
                          ...props
                          }) {
                          const isCodeBlock = className && className.startsWith('language-');
                            return isCodeBlock ? (
                            <pre className="overflow-x-auto rounded-lg bg-slate-800 p-4 text-slate-100">
                            <code className={className} {...props}>
                                {children}
                              </code>
                          </pre>
                          ) : (
                          <code
                          className={`${className} rounded bg-slate-200 px-1 py-0.5 text-sm dark:bg-slate-700`}
                            {...props}
                            >
                            {children}
                          </code>
                          );
                          },
                          table({ children }) {
                            return (
                              <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse border border-slate-300 dark:border-slate-600">
                                  {children}
                                </table>
                              </div>
                            );
                          },
                          th({ children }) {
                            return (
                              <th className="border border-slate-300 bg-slate-50 px-4 py-2 text-left font-medium dark:border-slate-600 dark:bg-slate-700">
                                {children}
                              </th>
                            );
                          },
                          td({ children }) {
                            return (
                              <td className="border border-slate-300 px-4 py-2 dark:border-slate-600">
                                {children}
                              </td>
                            );
                          },
                          blockquote({ children }) {
                            return (
                              <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 italic dark:bg-blue-900/20">
                                {children}
                              </blockquote>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>

              {/* Show branch indicators if this message has branches */}
              {hasBranches && message.role === "assistant" && (
                <div className="flex justify-start pl-8 mt-1 mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <GitBranch size={10} className="mr-1" />
                      {forkingBranches.length === 1
                        ? "1 branch"
                        : `${forkingBranches.length} branches`}{" "}
                      fork from here
                    </div>
                    <div className="flex space-x-1">
                      {forkingBranches.slice(0, 3).map((branch) => (
                        <div
                          key={branch.id}
                          className="w-1.5 h-1.5 rounded-full"
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
        branchesData={branchesData}
        activeBranch={activeBranch}
      />
    </div>
  );
}
