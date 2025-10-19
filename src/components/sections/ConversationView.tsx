"use client";

import { useData } from "@/hooks/useData";
import { Bot, GitBranch, GitFork, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { BranchWithMessages, Message } from "@/types";
import ChatInput from "../conversation-view/ChatInput";
import Header from "../conversation-view/Header";
import TypingIndicator from "../conversation-view/TypingIndicator";
import {
  addMessageToBranch,
  createBranchForUser,
  updateChatName,
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
  const { setBranchesData, branchesData, currentUserData, activeChatId, allChats } =
    useData();

  const [message, setMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [lastMessageCount, setLastMessageCount] = useState(0);

  const isNearBottom = () => {
    const el = messagesContainerRef.current;
    if (!el) return true;
    const threshold = 120;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  useEffect(() => {
    if (shouldScrollToBottom || isNearBottom()) {
      scrollToBottom("smooth");
      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom]);

  // Generate conversation name using AI
  const generateConversationName = useCallback(async (userMessage: string, aiResponse: string, chatId: string) => {
    console.log("🎯 Starting conversation naming for chat:", chatId);

    // Check if chat has already been auto-renamed
    const currentChat = allChats?.find(chat => chat.id === chatId);
    if (currentChat?.autoRenamed) {
      console.log("⏭️ Chat already auto-renamed, skipping:", chatId);
      return;
    }

    try {
      const namingPrompt = `User: ${userMessage.substring(0, 200)}${userMessage.length > 200 ? '...' : ''}\n\nAssistant: ${aiResponse.substring(0, 200)}${aiResponse.length > 200 ? '...' : ''}`;

      console.log("📡 Calling naming API...");
      const response = await fetch(`/api/chat2?question=${encodeURIComponent(namingPrompt)}&type=naming`, {
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
      console.log("🤖 AI suggested name:", suggestedName);

      // Clean up the suggested name (remove quotes, extra spaces, etc.)
      const cleanName = suggestedName
        .replace(/^["']|["']$/g, '') // Remove surrounding quotes
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();

      console.log("✨ Cleaned name:", cleanName);

      // Update chat name in Firestore
      if (currentUserData && cleanName && cleanName !== "New Conversation") {
        console.log("💾 Updating chat name in Firestore...");
        await updateChatName(currentUserData.uid, chatId, cleanName);
        console.log("✅ Chat renamed to:", cleanName);
      } else {
        console.log("⚠️ Skipping update - conditions not met", {
          hasUserData: !!currentUserData,
          cleanName,
          isDifferent: cleanName !== "New Conversation"
        });
      }

    } catch (error) {
      console.error("❌ Error generating conversation name:", error);
    }
  }, [currentUserData, allChats]);

  // Watch for message count changes to trigger auto-naming
  useEffect(() => {
    const currentBranch = branchesData[activeBranch];
    const currentMessageCount = currentBranch?.messages?.length || 0;

    // If message count just reached 2 (first user + assistant exchange)
    if (currentMessageCount === 2 && lastMessageCount !== 2 && activeChatId) {
      // Check if chat has already been auto-renamed
      const currentChat = allChats?.find(chat => chat.id === activeChatId);

      if (currentChat?.autoRenamed) {
        console.log("⏭️ Chat already auto-renamed, skipping:", activeChatId);
      } else {
        console.log("🎯 Message count reached 2! Triggering auto-naming...");
        const messages = currentBranch?.messages || [];
        if (messages.length >= 2) {
          const userMsg = messages.find(m => m.role === 'user');
          const aiMsg = messages.find(m => m.role === 'assistant');
          if (userMsg && aiMsg) {
            generateConversationName(userMsg.content, aiMsg.content, activeChatId);
          }
        }
      }
    }

    setLastMessageCount(currentMessageCount);
  }, [branchesData, activeBranch, activeChatId, lastMessageCount, generateConversationName, allChats]);

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
        history: getBranchMessages(activeBranch).map((msg) => ({
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

    // Add the assistant's reply to the branch
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

    // Check if this is the first message exchange (user + assistant = 2 messages)
    const currentBranch = branchesData[activeBranch];
    const totalMessages = currentBranch?.messages?.length || 0;

    // If we just added the assistant message and there are exactly 2 messages, it's the first exchange
    if (totalMessages === 2) {
      // Trigger automatic chat naming
      generateConversationName(userMessage.content, assistantMessage, activeChatId);
    }

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

  const allMessages = getBranchMessages(activeBranch);

  // Format timestamp to readable string
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
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
          const isFromCurrentBranch = true; // Simplified for now
          const messageBranch = branchesData[activeBranch];
          const hasBranches = false; // Simplified for now
          const forkingBranches = [];

          return (
            <div key={message.id}>
              <div
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } mb-6`}
              >
                <div
                  className={`${
                    message.role === "user"
                      ? "max-w-[85%] rounded-2xl bg-blue-500 text-white shadow-lg"
                      : "w-full max-w-none"
                  } ${
                    message.role === "assistant" && !isFromCurrentBranch
                      ? "border-l-4 shadow-sm"
                      : ""
                  }`}
                  style={
                    message.role === "assistant" && !isFromCurrentBranch && messageBranch
                      ? {
                          borderLeftColor: messageBranch.color,
                        }
                      : {}
                  }
                >
                  {/* User message styling - compact card */}
                  {message.role === "user" ? (
                    <div className="p-4">
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  ) : (
                    /* AI message styling - spacious, full-width */
                    <div className="px-6 py-8">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Bot size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* AI Message Content */}
                          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900">
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
                                    <pre className="overflow-x-auto rounded-lg bg-gray-800 p-4 text-gray-100 my-4">
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    </pre>
                                  ) : (
                                    <code
                                      className={`${className} rounded bg-gray-200 px-1.5 py-0.5 text-sm dark:bg-gray-700 text-gray-800 dark:text-gray-200`}
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  );
                                },
                                table({ children }) {
                                  return (
                                    <div className="overflow-x-auto my-4">
                                      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                                        {children}
                                      </table>
                                    </div>
                                  );
                                },
                                th({ children }) {
                                  return (
                                    <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-medium dark:border-gray-600 dark:bg-gray-700">
                                      {children}
                                    </th>
                                  );
                                },
                                td({ children }) {
                                  return (
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                      {children}
                                    </td>
                                  );
                                },
                                blockquote({ children }) {
                                  return (
                                    <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 italic my-4 dark:bg-blue-900/20">
                                      {children}
                                    </blockquote>
                                  );
                                }
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>

                            {/* Branch button and timestamp */}
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center space-x-2">
                                {message.role === "assistant" && (
                                  <button
                                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center transition-colors"
                                    onClick={() =>
                                      handleCreateBranch(
                                        activeBranch,
                                        message.id
                                      )
                                    }
                                  >
                                    <GitFork size={12} className="mr-1.5" /> Create Branch
                                  </button>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
