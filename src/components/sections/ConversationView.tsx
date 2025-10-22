"use client";

import "katex/dist/katex.min.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  addMessageToBranch,
  createBranchForUser,
  updateBranchName,
  updateChatName,
} from "../../firebase/services/ChatService";
import { useData } from "../../hooks/useData";
import { BranchWithMessages } from "../../types";
import ChatInput from "../conversation-view/ChatInput";
import Header from "../conversation-view/Header";
import MessageItem from "../conversation-view/MessageItem";
import TypingIndicator from "../conversation-view/TypingIndicator";
import TextSelectionTooltip from "../ui/TextSelectionTooltip";

// Import new service modules
import {
  generateBranchNameFromSelection,
  getUserApiKey,
} from "../../services/aiService";
import {
  getBranchMessages,
  getMessageBranch,
  getMessageBranchId,
  isMessageFromBranch,
} from "../../services/branchTreeService";
import {
  createAssistantMessage,
  createFollowUpQuestion,
  createUserMessage,
} from "../../services/messageService";
import {
  createBranch,
  createBranchNameFromText,
} from "../../utils/branchHelpers";

interface ConversationViewProps {
  activeBranch: string;
  onRenamingStart?: (chatId: string) => void;
  onRenamingEnd?: (chatId: string) => void;
  onBranchSwitch?: (branchId: string) => void;
}

export default function ConversationView({
  activeBranch,
  onRenamingStart,
  onRenamingEnd,
  onBranchSwitch,
}: ConversationViewProps) {
  const {
    setBranchesData,
    branchesData,
    currentUserData,
    activeChatId,
    allChats,
  } = useData();

  const [message, setMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>("");
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

  // Get all messages for the active branch (including inherited)
  // Use the service function with branchesData
  const allMessages = getBranchMessages(activeBranch, branchesData);

  // Helper function using our services
  const isMessageFromActiveBranch = (messageId: string): boolean => {
    return isMessageFromBranch(messageId, activeBranch, branchesData);
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

  // Generate conversation name using AI
  const generateConversationName = useCallback(
    async (userMessage: string, aiResponse: string, chatId: string) => {
      console.log("🎯 Starting conversation naming for chat:", chatId);

      // Check if chat has already been auto-renamed
      const currentChat = allChats?.find((chat) => chat.id === chatId);
      if (currentChat?.autoRenamed) {
        console.log("⏭️ Chat already auto-renamed, skipping:", chatId);
        return;
      }

      // Start renaming animation
      onRenamingStart?.(chatId);

      try {
        const namingPrompt = `User: ${userMessage.substring(0, 200)}${
          userMessage.length > 200 ? "..." : ""
        }\n\nAssistant: ${aiResponse.substring(0, 200)}${
          aiResponse.length > 200 ? "..." : ""
        }`;

        console.log("📡 Calling naming API...");
        const userApiKey = localStorage.getItem("gemini_api_key");
        const apiUrl = userApiKey
          ? `/api/chat2?question=${encodeURIComponent(
              namingPrompt
            )}&type=naming&apiKey=${encodeURIComponent(userApiKey)}`
          : `/api/chat2?question=${encodeURIComponent(
              namingPrompt
            )}&type=naming`;

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
        console.log("🤖 AI suggested name:", suggestedName);

        // Clean up the suggested name (remove quotes, extra spaces, etc.)
        const cleanName = suggestedName
          .replace(/^["']|["']$/g, "")
          .replace(/\s+/g, " ")
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
            isDifferent: cleanName !== "New Conversation",
          });
        }
      } catch (error) {
        console.error("❌ Error generating conversation name:", error);
      } finally {
        // Stop renaming animation
        onRenamingEnd?.(chatId);
      }
    },
    [currentUserData, allChats, onRenamingStart, onRenamingEnd]
  );

  // Generate branch name using AI
  const generateBranchName = useCallback(
    async (namingPrompt: string, branchId: string) => {
      console.log("🎯 Starting branch naming for branch:", branchId);

      try {
        console.log("📡 Calling branch naming API...");
        const userApiKey = localStorage.getItem("gemini_api_key");
        const apiUrl = userApiKey
          ? `/api/chat2?question=${encodeURIComponent(
              namingPrompt
            )}&type=naming&apiKey=${encodeURIComponent(userApiKey)}`
          : `/api/chat2?question=${encodeURIComponent(
              namingPrompt
            )}&type=naming`;

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
        console.log("🤖 AI suggested branch name:", suggestedName);

        // Clean up the suggested name (remove quotes, extra spaces, etc.)
        const cleanName = suggestedName
          .replace(/^["']|[\"']$/g, "")
          .replace(/\s+/g, " ")
          .trim();

        console.log("✨ Cleaned branch name:", cleanName);

        // Update branch name in Firestore
        if (currentUserData && cleanName && cleanName !== "Branch Discussion") {
          console.log("💾 Updating branch name in Firestore...");
          await updateBranchName(
            currentUserData.uid,
            activeChatId!,
            branchId,
            cleanName
          );
          console.log("✅ Branch renamed to:", cleanName);
        } else {
          console.log("⚠️ Skipping branch update - conditions not met", {
            hasUserData: !!currentUserData,
            cleanName,
            isDifferent: cleanName !== "Branch Discussion",
          });
        }
      } catch (error) {
        console.error("❌ Error generating branch name:", error);
      }
    },
    [currentUserData, activeChatId]
  );

  // Watch for message count changes to trigger auto-naming
  useEffect(() => {
    const currentBranch = branchesData[activeBranch];
    const currentMessageCount = currentBranch?.messages?.length || 0;

    // If message count just reached 2 (first user + assistant exchange)
    if (currentMessageCount === 2 && lastMessageCount !== 2 && activeChatId) {
      console.log("🎯 Message count reached 2! Triggering auto-naming...");
      const messages = currentBranch?.messages || [];
      if (messages.length >= 2) {
        const userMsg = messages.find((m) => m.role === "user");
        const aiMsg = messages.find((m) => m.role === "assistant");
        if (userMsg && aiMsg) {
          const currentChat = allChats?.find(
            (chat) => chat.id === activeChatId
          );

          // For follow-up branches, also auto-rename them based on their conversation
          if (activeBranch !== "main") {
            // This is a follow-up branch - rename it based on its conversation
            console.log(
              "🎯 Follow-up branch reached 2 messages! Auto-renaming branch..."
            );
            const conversationPrompt = `User: ${userMsg.content.substring(
              0,
              150
            )}${
              userMsg.content.length > 150 ? "..." : ""
            }\n\nAssistant: ${aiMsg.content.substring(0, 150)}${
              aiMsg.content.length > 150 ? "..." : ""
            }`;
            generateBranchName(
              `Based on this conversation, suggest a short, descriptive name (under 5 words): ${conversationPrompt}`,
              activeBranch
            );
          } else if (!currentChat?.autoRenamed) {
            // Main branch or first naming - rename the chat
            generateConversationName(
              userMsg.content,
              aiMsg.content,
              activeChatId
            );
          }
        }
      }
    }

    setLastMessageCount(currentMessageCount);
  }, [
    branchesData,
    activeBranch,
    activeChatId,
    lastMessageCount,
    generateConversationName,
    generateBranchName,
    allChats,
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || !branchesData || !currentUserData || !activeChatId)
      return;

    // Create user message using service
    const userMessage = createUserMessage(message, activeBranch);

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

    // Get user's API key
    const userApiKey = getUserApiKey();

    // Create assistant message placeholder using service
    const assistantMessageObj = createAssistantMessage("", activeBranch);

    // Add the assistant's reply placeholder to the branch
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

    setStreamingContent("");

    // Send to API and stream the assistant's reply
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: message,
        apiKey: userApiKey,
        history: getBranchMessages(activeBranch, branchesData).map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
      }),
    });

    if (!response.ok) {
      console.error("API error:", response.status);
      setIsTyping(false);
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk
        .split("\n")
        .filter((line) => line.startsWith("data: "));

      for (const line of lines) {
        const dataStr = line.replace("data: ", "").trim();
        if (dataStr === "[DONE]") break;

        try {
          const data = JSON.parse(dataStr);
          if (data.delta) {
            fullContent += data.delta;
            setStreamingContent(fullContent);
          } else if (data.done) {
            // Show final content in streaming display, then clear after a brief delay
            setStreamingContent(fullContent);

            // Update the message with final content
            setBranchesData((prev: Record<string, BranchWithMessages>) => {
              const existingBranch = prev[activeBranch];
              if (!existingBranch) return prev;

              const messages = existingBranch.messages ?? [];
              const lastMessage = messages[messages.length - 1];
              if (lastMessage && lastMessage.role === "assistant") {
                lastMessage.content = fullContent;
              }

              return {
                ...prev,
                [activeBranch]: {
                  ...existingBranch,
                  messages: [...messages],
                },
              };
            });

            await addMessageToBranch(
              currentUserData?.uid,
              activeBranch,
              { ...assistantMessageObj, content: fullContent },
              activeChatId
            );

            // Check if this is the first message exchange
            const currentBranch = branchesData[activeBranch];
            const totalMessages = currentBranch?.messages?.length || 0;
            if (totalMessages === 2) {
              generateConversationName(
                userMessage.content,
                fullContent,
                activeChatId
              );
            }

            // Clear streaming content after a delay to let animation complete
            setTimeout(() => setStreamingContent(""), 100);
          }
        } catch (e) {
          console.error("Parse error:", e);
        }
      }
    }

    setIsTyping(false);
    setStreamingContent("");
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

    // Create a new branch using the service
    const newBranch = createBranch(
      newBranchId,
      branchName,
      parentBranchId,
      parentMessageId
    );
    // Add to Firestore
    await createBranchForUser(currentUserData.uid, activeChatId, newBranch);
    // Add to local state
    setBranchesData((prev: Record<string, BranchWithMessages>) => {
      if (!prev) return prev;
      return {
        ...prev,
        [newBranchId]: newBranch,
      };
    });
  };

  // Handle "Ask AI" from text selection
  const handleAskAI = async (selectedText: string, messageId: string) => {
    if (!currentUserData || !activeChatId) return;

    // Find the branch that contains this message
    const parentBranchId = getMessageBranchId(messageId, branchesData);
    if (!parentBranchId) return;

    // Create a new branch for the follow-up question
    const branchName = createBranchNameFromText(selectedText);
    const newBranchId = uuidv4();

    const newBranch = createBranch(
      newBranchId,
      branchName,
      parentBranchId,
      messageId
    );

    // Add to Firestore
    await createBranchForUser(currentUserData.uid, activeChatId, newBranch);

    // Add to local state
    setBranchesData((prev: Record<string, BranchWithMessages>) => {
      if (!prev) return prev;
      return {
        ...prev,
        [newBranchId]: newBranch,
      };
    });

    // Switch to the new branch immediately
    onBranchSwitch?.(newBranchId);

    // Auto-rename the branch using AI based on selected text
    const userApiKey = getUserApiKey();
    generateBranchNameFromSelection(selectedText, userApiKey)
      .then((aiName) => {
        if (currentUserData && activeChatId && aiName) {
          updateBranchName(
            currentUserData.uid,
            activeChatId,
            newBranchId,
            aiName
          );
        }
      })
      .catch((error) => console.error("Failed to auto-name branch:", error));

    // Pre-fill the input with a contextual question
    const contextualQuestion = createFollowUpQuestion(selectedText);
    setMessage(contextualQuestion);
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
          const messageBranch = getMessageBranch(message.id, branchesData);

          return (
            <MessageItem
              key={message.id}
              message={message}
              index={index}
              allMessages={allMessages}
              branchesData={branchesData}
              isFromCurrentBranch={isFromCurrentBranch}
              messageBranch={messageBranch}
              isTyping={isTyping}
              streamingContent={streamingContent}
              onCreateBranch={handleCreateBranch}
            />
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

      <TextSelectionTooltip onAskAI={handleAskAI} />
    </div>
  );
}
