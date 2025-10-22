"use client";

import { GitBranch, MessageCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  addMessageToBranch,
  createNewChat,
  updateBranchName,
  updateChatName,
} from "../../firebase/services/ChatService";
import { useData } from "../../hooks/useData";
import { Message } from "../../types";
import BranchExplorer from "./BranchExplorer";
import BranchTreeFlow from "./BranchTreeFlow";
import ConversationView from "./ConversationView";
import WelcomeScreen from "./WelcomeScreen";

// Import new service modules
import {
  generateConversationName,
  getUserApiKey,
} from "../../services/aiService";
import {
  createAssistantMessage,
  createUserMessage,
} from "../../services/messageService";
import {
  filterBranchesBySearch,
  getBranchesArray,
} from "../../utils/branchHelpers";

export default function BranchingChatTree() {
  const {
    currentUserData,
    branchesData,
    allChats,
    activeChatId,
    makeChatActive,
  } = useData();

  const [activeBranch, setActiveBranch] = useState<string>("main");
  const [windowHeight, setWindowHeight] = useState<number>(0);
  const [treeViewHeight, setTreeViewHeight] = useState<number>(300);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [renamingChats, setRenamingChats] = useState<Set<string>>(new Set());
  const [isCreatingChat, setIsCreatingChat] = useState<boolean>(false);

  // View modes: 'both', 'chat-only', 'tree-only'
  const [viewMode, setViewMode] = useState<"both" | "chat-only" | "tree-only">(
    "both"
  );

  // Functions to control renaming animation
  const startRenaming = useCallback((chatId: string) => {
    setRenamingChats((prev) => new Set(prev).add(chatId));
  }, []);

  const stopRenaming = useCallback((chatId: string) => {
    setRenamingChats((prev) => {
      const newSet = new Set(prev);
      newSet.delete(chatId);
      return newSet;
    });
  }, []);

  // Ref for the resize handle
  const resizeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Min and max heights for the tree view
  const MIN_HEIGHT = 150;
  const MAX_HEIGHT_RATIO = 0.8; // 80% of window height

  // Initialize with main branch or last saved branch if exists
  useEffect(() => {
    // Only load from localStorage if we don't have an activeBranch set yet
    if (!activeBranch) {
      try {
        const saved = localStorage.getItem("activeBranchId");
        if (saved) {
          setActiveBranch(saved);
        }
      } catch {}
    }

    // If we have branches data but the current activeBranch doesn't exist in it,
    // reset to the first available branch (usually "main")
    if (
      Object.keys(branchesData).length > 0 &&
      activeBranch &&
      !branchesData[activeBranch]
    ) {
      console.log(
        `Active branch ${activeBranch} not found in current chat, switching to first available branch`
      );
      const firstBranchId = Object.keys(branchesData)[0];
      setActiveBranch(firstBranchId);

      // Save the new active branch to localStorage
      try {
        localStorage.setItem("activeBranchId", firstBranchId);
      } catch {}
    }
  }, [branchesData, activeBranch]); // Include activeBranch - the conditions prevent infinite loops

  // Save activeBranch to localStorage whenever it changes
  useEffect(() => {
    if (activeBranch) {
      try {
        localStorage.setItem("activeBranchId", activeBranch);
      } catch {}
    }
  }, [activeBranch]);

  useEffect(() => {
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      const newHeight = window.innerHeight;
      setWindowHeight(newHeight);

      // Adjust tree view height if it exceeds the new window constraints
      const maxHeight = newHeight * MAX_HEIGHT_RATIO;
      if (treeViewHeight > maxHeight) {
        setTreeViewHeight(maxHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [treeViewHeight]);

  // Add/remove `no-select` class to body during resize
  useEffect(() => {
    if (isResizing) {
      document.body.classList.add("no-select");
    } else {
      document.body.classList.remove("no-select");
    }
  }, [isResizing]);

  // Mouse down handler for starting resize
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startY = e.clientY;
    const startHeight = treeViewHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const newHeight = startHeight + deltaY;
      const maxHeight = windowHeight * MAX_HEIGHT_RATIO;

      // Constrain the height within bounds
      const constrainedHeight = Math.min(
        Math.max(newHeight, MIN_HEIGHT),
        maxHeight
      );
      setTreeViewHeight(constrainedHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Touch handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startY = e.touches[0].clientY;
    const startHeight = treeViewHeight;

    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = e.touches[0].clientY - startY;
      const newHeight = startHeight + deltaY;
      const maxHeight = windowHeight * MAX_HEIGHT_RATIO;

      const constrainedHeight = Math.min(
        Math.max(newHeight, MIN_HEIGHT),
        maxHeight
      );
      setTreeViewHeight(constrainedHeight);
    };

    const handleTouchEnd = () => {
      setIsResizing(false);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  };

  // Enhanced branch switching
  const handleBranchSwitch = (branchId: string) => {
    setActiveBranch(branchId);
    try {
      localStorage.setItem("activeBranchId", branchId);
    } catch {}
  };

  // Branch renaming handler
  const handleBranchRename = async (branchId: string, newName: string) => {
    if (!currentUserData || !activeChatId || !newName.trim()) return;

    try {
      await updateBranchName(
        currentUserData.uid,
        activeChatId,
        branchId,
        newName
      );
      console.log("Branch renamed successfully:", branchId, newName);
    } catch (error) {
      console.error("Failed to rename branch:", error);
    }
  };

  // Filter branches based on search query using helper
  const filteredBranches = filterBranchesBySearch(
    getBranchesArray(branchesData),
    searchQuery
  );

  // Check if there are any chats
  const hasChats = allChats && allChats.length > 0;

  // Handle sending first message from welcome screen
  const handleWelcomeMessage = async (message: string) => {
    if (!currentUserData || isCreatingChat) return;

    setIsCreatingChat(true);
    try {
      // Create new chat
      const newChat = await createNewChat(
        currentUserData.uid,
        "New Conversation"
      );

      // Set as active chat
      makeChatActive(newChat.id);

      // Create user message using service
      const userMessage = createUserMessage(message, "main");

      // Add message to main branch
      await addMessageToBranch(
        currentUserData.uid,
        "main",
        userMessage,
        newChat.id
      );

      // Now send to AI and get response
      await sendMessageToAI(userMessage, newChat.id);
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Send message to AI and handle response
  const sendMessageToAI = async (userMessage: Message, chatId: string) => {
    if (!currentUserData) return;

    try {
      // Get conversation history from the branch
      const branch = branchesData["main"];
      const conversationHistory = branch?.messages || [];

      // Convert messages to the format expected by the API
      const historyForAPI = conversationHistory.map((msg) => ({
        role: msg.role === "assistant" ? "model" : msg.role,
        parts: [{ text: msg.content }],
      }));

      // Get user API key using service
      const userApiKey = getUserApiKey();
      const apiUrl = userApiKey
        ? `/api/chat2?question=${encodeURIComponent(
            userMessage.content
          )}&history=${encodeURIComponent(
            JSON.stringify(historyForAPI)
          )}&apiKey=${encodeURIComponent(userApiKey)}`
        : `/api/chat2?question=${encodeURIComponent(
            userMessage.content
          )}&history=${encodeURIComponent(JSON.stringify(historyForAPI))}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      // Create AI response message using service
      const aiMessage = createAssistantMessage(
        data.answer || "I couldn't generate a response.",
        "main"
      );

      // Add AI response to branch
      await addMessageToBranch(currentUserData.uid, "main", aiMessage, chatId);

      // Generate conversation name using local handler
      await handleGenerateConversationName(
        userMessage.content,
        aiMessage.content,
        chatId
      );
    } catch (error) {
      console.error("Error sending message to AI:", error);
    }
  };

  // Generate conversation name using AI
  const handleGenerateConversationName = async (
    userMessage: string,
    aiResponse: string,
    chatId: string
  ) => {
    // Check if chat has already been auto-renamed
    const currentChat = allChats?.find((chat) => chat.id === chatId);
    if (currentChat?.autoRenamed) {
      console.log("⏭️ Chat already auto-renamed, skipping:", chatId);
      return;
    }

    try {
      // Use service to generate conversation name
      const userApiKey = getUserApiKey();
      const cleanName = await generateConversationName(
        userMessage,
        aiResponse,
        userApiKey
      );

      // Update chat name in Firestore
      if (currentUserData && cleanName && cleanName !== "New Conversation") {
        await updateChatName(currentUserData.uid, chatId, cleanName);
        console.log("Chat renamed to:", cleanName);
      }
    } catch (error) {
      console.error("Error generating conversation name:", error);
    }
  };

  // Show welcome screen if no chats exist
  if (!hasChats) {
    return (
      <div
        ref={containerRef}
        className="relative flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden"
      >
        <WelcomeScreen
          onSendMessage={handleWelcomeMessage}
          isLoading={isCreatingChat}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden"
    >
      {/* Mode Selector - Top Right Corner */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 flex">
          <button
            onClick={() => setViewMode("chat-only")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center ${
              viewMode === "chat-only"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            title="Chat Only Mode"
          >
            <MessageCircle size={16} />
          </button>
          <button
            onClick={() => setViewMode("tree-only")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center ${
              viewMode === "tree-only"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            title="Tree Only Mode"
          >
            <GitBranch size={16} />
          </button>
          <button
            onClick={() => setViewMode("both")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center ${
              viewMode === "both"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            title="Both Views Mode"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Left Sidebar - Full Height */}
      <BranchExplorer
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeBranch={activeBranch}
        setActiveBranch={handleBranchSwitch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredBranches={filteredBranches}
        branchesData={branchesData}
        renamingChats={renamingChats}
        onRenamingStart={startRenaming}
        onRenamingEnd={stopRenaming}
      />

      {/* Right Content Area - Responsive to sidebar state */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-80" : "ml-0"
        }`}
      >
        {/* Conditionally render tree view based on mode */}
        {(viewMode === "both" || viewMode === "tree-only") && (
          <div
            className={`relative ${viewMode === "tree-only" ? "flex-1" : ""} ${
              viewMode === "both"
                ? "border-b border-gray-200 dark:border-gray-800"
                : ""
            } bg-white dark:bg-gray-900`}
            style={
              viewMode === "both"
                ? {
                    height: `${treeViewHeight}px`,
                    minHeight: `${MIN_HEIGHT}px`,
                  }
                : { height: "100%" }
            }
          >
            {/* Switchable: ReactFlow-based layout to avoid overlaps */}
            <BranchTreeFlow
              branchesData={branchesData}
              activeBranch={activeBranch}
              setActiveBranch={handleBranchSwitch}
              onBranchRename={handleBranchRename}
              height={viewMode === "tree-only" ? "100%" : treeViewHeight - 0}
            />

            {/* Resize Handle - Only show in both mode */}
            {viewMode === "both" && (
              <div
                ref={resizeRef}
                className={`absolute bottom-0 left-0 right-0 h-5 flex items-center justify-center group z-20
                  bg-transparent transition-colors duration-150 border-b border-gray-300 dark:border-gray-700`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                style={{ cursor: "row-resize" }}
              >
                {/* Visible separator line */}
                <div className="w-full h-0.5 bg-gray-300 dark:bg-gray-700" />
                {/* Drag indicator */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full group-hover:bg-blue-500 dark:group-hover:bg-blue-400 transition-colors duration-150 shadow" />
                {/* Tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-20">
                  Drag to resize tree view
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conditionally render chat view based on mode */}
        {(viewMode === "both" || viewMode === "chat-only") && (
          <div
            className={`flex-1 overflow-auto ${
              viewMode === "chat-only" ? "h-full" : ""
            }`}
          >
            <ConversationView
              activeBranch={activeBranch}
              onRenamingStart={startRenaming}
              onRenamingEnd={stopRenaming}
              onBranchSwitch={handleBranchSwitch}
            />
          </div>
        )}
      </div>

      {/* Add CSS for global animations and resize cursor */}
      <style jsx global>{`
        @keyframes flowAnimation {
          0% {
            stroke-dashoffset: 300;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.03);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Custom cursor for resize handle */
        .cursor-row-resize {
          cursor: row-resize !important;
        }

        /* Prevent text selection during resize */
        body.no-select {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }

        /* Ensure resize handle is always on top */
        .resize-handle {
          z-index: 1000;
        }
      `}</style>
    </div>
  );
}
