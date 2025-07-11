"use client";

import { useData } from "@/hooks/useData";
import { useEffect, useRef, useState } from "react";
import { BranchWithMessages, Message } from "../../types";
import BranchExplorer from "./BranchExplorer";
import ConversationView from "./ConversationView";
import BranchTreeVisualization from "./processBranchesForTreeView";
// import { mockBranchesData } from "./data";

export default function BranchingChatTree() {
  const { currentUserData } = useData();
  const branchesData = currentUserData?.branches || {};
  const [activeBranch, setActiveBranch] = useState<string>("main");
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);
  const [windowHeight, setWindowHeight] = useState<number>(0);
  const [treeViewHeight, setTreeViewHeight] = useState<number>(300);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // Ref for the resize handle
  const resizeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Min and max heights for the tree view
  const MIN_HEIGHT = 150;
  const MAX_HEIGHT_RATIO = 0.8; // 80% of window height

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

  // Mouse down handler for starting resize
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
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

  // Get the full message history for a branch (including all ancestor messages)
  const getBranchMessages = (branchId: string): Message[] => {
    const branchPath = getBranchPath(branchId);
    let messages: Message[] = [];

    for (let i = 0; i < branchPath.length; i++) {
      const { branchId, parentMessageId } = branchPath[i];
      const branch = branchesData[branchId];

      if (i === 0) {
        messages = [...branch.messages];
      } else {
        const forkIndex = messages.findIndex(
          (msg) => msg.id === parentMessageId
        );

        if (forkIndex >= 0) {
          messages = [...messages.slice(0, forkIndex + 1), ...branch.messages];
        } else {
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

    while (currentBranchId) {
      const branch: BranchWithMessages | undefined =
        branchesData[currentBranchId];
      // If branch doesn't exist, break the loop
      if (!branch) {
        console.warn(
          `Branch with id ${currentBranchId} not found in branchesData`
        );
        break;
      }

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
    branchesData
  ).filter((branch): branch is BranchWithMessages =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100"
    >
      {/* Resizable Branch Tree Visualization */}
      <div
        className="relative border-b border-gray-200 dark:border-gray-800"
        style={{ height: `${treeViewHeight}px` }}
      >
        <BranchTreeVisualization
          activeBranch={activeBranch}
          setActiveBranch={setActiveBranch}
          hoveredBranch={hoveredBranch}
          setHoveredBranch={setHoveredBranch}
          expandedTreeView={true} // Always expanded since we have manual resize
          setExpandedTreeView={() => {}} // No-op since we handle resize manually
          treeViewHeight={treeViewHeight}
          branchesData={branchesData}
        />

        {/* Resize Handle */}
        <div
          ref={resizeRef}
          className={`absolute bottom-0 left-0 right-0 h-2 cursor-row-resize group
            ${isResizing ? "bg-blue-500" : "hover:bg-blue-400"}
            transition-colors duration-150`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Visual indicator for the resize handle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-1 bg-gray-400 dark:bg-gray-600 rounded-full group-hover:bg-blue-500 transition-colors duration-150" />

          {/* Tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap">
            Drag to resize tree view
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <BranchExplorer
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeBranch={activeBranch}
          setActiveBranch={setActiveBranch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredBranches={filteredBranches}
          mockBranchesData={branchesData}
          treeViewHeight={treeViewHeight}
        />

        <ConversationView
          activeBranch={activeBranch}
          getBranchMessages={getBranchMessages}
          mockBranchesData={branchesData}
        />
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
          cursor: row-resize;
        }

        /* Prevent text selection during resize */
        body.no-select {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
      `}</style>
    </div>
  );
}
