"use client";

import { useEffect, useState } from "react";
import { BranchWithMessages, Message } from "../../types";
import BranchExplorer from "./BranchExplorer";
import ConversationView from "./ConversationView";
import BranchTreeVisualization from "./processBranchesForTreeView";
import { mockBranchesData } from "./data";



export default function BranchingChatTree2() {
  const [activeBranch, setActiveBranch] = useState<string>("crypto-focus");
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);
  const [windowHeight, setWindowHeight] = useState<number>(0);
  const [expandedTreeView, setExpandedTreeView] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const treeViewHeight = expandedTreeView
    ? Math.max(400, windowHeight * 0.5)
    : Math.min(300, windowHeight * 0.3);

  // Get the full message history for a branch (including all ancestor messages)
  const getBranchMessages = (branchId: string): Message[] => {
    // Track the complete branch path from root to current branch
    const branchPath = getBranchPath(branchId);

    // Start with an empty message list
    let messages: Message[] = [];

    // Process branches in order from root to leaf
    for (let i = 0; i < branchPath.length; i++) {
      const { branchId, parentMessageId } = branchPath[i];
      const branch = mockBranchesData[branchId];

      if (i === 0) {
        // For the root branch, take all messages
        messages = [...branch.messages];
      } else {
        // For child branches, find the fork point in our current messages
        const forkIndex = messages.findIndex(
          (msg) => msg.id === parentMessageId
        );

        if (forkIndex >= 0) {
          // Keep messages up to and including the fork point
          messages = [...messages.slice(0, forkIndex + 1), ...branch.messages];
        } else {
          // If fork point not found (shouldn't happen), just append
          messages = [...messages, ...branch.messages];
        }
      }
    }

    return messages;
  };

  // Helper function to get the branch path from root to current branch
  const getBranchPath = (
    branchId: string
  ): { branchId: string; parentMessageId: string | null }[] => {
    const branchPath: { branchId: string; parentMessageId: string | null }[] =
      [];
    let currentBranchId: string | null = branchId;

    // Walk up the branch hierarchy
    while (currentBranchId) {
      const branch: BranchWithMessages = mockBranchesData[currentBranchId];
      branchPath.unshift({
        branchId: currentBranchId,
        parentMessageId: branch.parentMessageId,
      });
      currentBranchId = branch.parentId;
    }

    return branchPath;
  };

  // Filter branches based on search query
  const filteredBranches: BranchWithMessages[] = Object.values(
    mockBranchesData
  ).filter((branch) =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Top Navigation */}
      {/* <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <button
            className="p-2 mr-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </button>
          <div className="text-xl font-bold flex items-center">
            <GitBranch size={24} className="mr-2 text-blue-500" />
            Branching Chat
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md text-sm font-medium flex items-center">
            <Clock size={16} className="mr-2" /> History
          </button>
          <button className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium flex items-center">
            <Plus size={16} className="mr-2" /> New Branch
          </button>
        </div>
      </div> */}

      {/* Branch Tree Visualization Component */}
      <BranchTreeVisualization
        activeBranch={activeBranch}
        setActiveBranch={setActiveBranch}
        hoveredBranch={hoveredBranch}
        setHoveredBranch={setHoveredBranch}
        expandedTreeView={expandedTreeView}
        setExpandedTreeView={setExpandedTreeView}
        treeViewHeight={treeViewHeight}
        mockBranchesData={mockBranchesData}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Branch Explorer Component */}
        <BranchExplorer
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeBranch={activeBranch}
          setActiveBranch={setActiveBranch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredBranches={filteredBranches}
          mockBranchesData={mockBranchesData}
          treeViewHeight={treeViewHeight}
        />

        {/* Main content - Conversation View Component */}
        <ConversationView
          activeBranch={activeBranch}
          getBranchMessages={getBranchMessages}
          mockBranchesData={mockBranchesData}
        />
      </div>

      {/* Add CSS for global animations */}
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
      `}</style>
    </div>
  );
}
