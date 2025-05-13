"use client"

import React, { useState } from "react";
import {
  GitBranch,
  MessageSquare,
  User,
  Bot,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// TypeScript interfaces
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Branch {
  id: string;
  name: string;
  parentId: string | null;
  parentMessageId: string | null;
  color: string;
  messages: Message[];
  children?: Branch[];
}

interface BranchesData {
  [key: string]: Branch;
}

interface ExpandedBranches {
  [key: string]: boolean;
}

// Mock data representing a branching conversation tree
const mockBranchesData: BranchesData = {
  main: {
    id: "main",
    name: "Main Branch",
    parentId: null,
    parentMessageId: null,
    color: "#6366f1", // indigo
    messages: [
      {
        id: "msg1",
        role: "user",
        content: "What should I invest in?",
        timestamp: "2025-05-08T10:00:00Z",
      },
      {
        id: "msg2",
        role: "assistant",
        content:
          "That depends on your risk tolerance and investment goals. Could you tell me more about your situation?",
        timestamp: "2025-05-08T10:01:00Z",
      },
      {
        id: "msg3",
        role: "user",
        content: "I'm moderate risk and looking for long-term growth.",
        timestamp: "2025-05-08T10:02:00Z",
      },
      {
        id: "msg4",
        role: "assistant",
        content:
          "For moderate risk with long-term growth, consider a portfolio with 60% broad market ETFs, 20% bonds, and 20% in select growth stocks.",
        timestamp: "2025-05-08T10:03:00Z",
      },
    ],
  },
  "high-risk": {
    id: "high-risk",
    name: "High Risk Strategy",
    parentId: "main",
    parentMessageId: "msg2",
    color: "#ec4899", // pink
    messages: [
      {
        id: "msg5",
        role: "user",
        content: "Actually, I can tolerate high risk for better returns.",
        timestamp: "2025-05-08T10:04:00Z",
      },
      {
        id: "msg6",
        role: "assistant",
        content:
          "For high-risk investors, consider 70% growth stocks, 20% emerging markets, and 10% speculative investments like crypto or startups.",
        timestamp: "2025-05-08T10:05:00Z",
      },
      {
        id: "msg7",
        role: "user",
        content: "Tell me more about crypto investing.",
        timestamp: "2025-05-08T10:06:00Z",
      },
      {
        id: "msg8",
        role: "assistant",
        content:
          "Crypto investing is highly volatile but potentially lucrative. Focus on established projects like Bitcoin and Ethereum as your core holdings (70%), then allocate 20% to mid-caps and 10% to promising new projects.",
        timestamp: "2025-05-08T10:07:00Z",
      },
    ],
  },
  "low-risk": {
    id: "low-risk",
    name: "Conservative Approach",
    parentId: "main",
    parentMessageId: "msg2",
    color: "#10b981", // emerald
    messages: [
      {
        id: "msg9",
        role: "user",
        content: "What if I prefer lower risk instead?",
        timestamp: "2025-05-08T10:08:00Z",
      },
      {
        id: "msg10",
        role: "assistant",
        content:
          "For conservative investors, I recommend 40% bonds, 40% blue-chip dividend stocks, 15% broad market ETFs, and 5% cash reserves.",
        timestamp: "2025-05-08T10:09:00Z",
      },
    ],
  },
  "crypto-focus": {
    id: "crypto-focus",
    name: "Crypto Deep Dive",
    parentId: "high-risk",
    parentMessageId: "msg8",
    color: "#f59e0b", // amber
    messages: [
      {
        id: "msg11",
        role: "user",
        content: "Can you recommend specific crypto projects to research?",
        timestamp: "2025-05-08T10:10:00Z",
      },
      {
        id: "msg12",
        role: "assistant",
        content:
          "Beyond Bitcoin and Ethereum, consider researching Solana for speed, Polygon for scaling, Chainlink for oracles, and Polkadot for interoperability. Each serves different purposes in the ecosystem.",
        timestamp: "2025-05-08T10:11:00Z",
      },
    ],
  },
  "real-estate": {
    id: "real-estate",
    name: "Real Estate Option",
    parentId: "main",
    parentMessageId: "msg4",
    color: "#8b5cf6", // violet
    messages: [
      {
        id: "msg13",
        role: "user",
        content: "What about including real estate in my portfolio?",
        timestamp: "2025-05-08T10:12:00Z",
      },
      {
        id: "msg14",
        role: "assistant",
        content:
          "Real estate makes an excellent addition to a moderate risk portfolio. Consider REITs for liquidity, rental properties for income, or crowdfunding platforms for lower capital requirements.",
        timestamp: "2025-05-08T10:13:00Z",
      },
    ],
  },
  "reits-focus": {
    id: "reits-focus",
    name: "REITs Analysis",
    parentId: "real-estate",
    parentMessageId: "msg14",
    color: "#14b8a6", // teal
    messages: [
      {
        id: "msg15",
        role: "user",
        content: "Tell me more about REITs specifically.",
        timestamp: "2025-05-08T10:14:00Z",
      },
      {
        id: "msg16",
        role: "assistant",
        content:
          "REITs are securities that invest in real estate and distribute 90% of taxable income to shareholders. Look for residential, commercial, healthcare, and data center REITs with strong dividend histories and manageable debt levels.",
        timestamp: "2025-05-08T10:15:00Z",
      },
    ],
  },
};

const BranchingChatTree: React.FC = () => {
  const [activeBranch, setActiveBranch] = useState<string>("main");
  const [expandedBranches, setExpandedBranches] = useState<ExpandedBranches>({
    main: true,
    "high-risk": true,
    "low-risk": true,
    "crypto-focus": true,
    "real-estate": true,
    "reits-focus": true,
  });

  // Build tree structure from flat data
  const buildBranchTree = (): Record<string, Branch> => {
    const tree: Record<string, Branch> = {};

    // First, identify all branches without parents (root branches)
    Object.values(mockBranchesData).forEach((branch) => {
      if (!branch.parentId) {
        tree[branch.id] = { ...branch, children: [] };
      }
    });

    // Then add all children
    Object.values(mockBranchesData).forEach((branch) => {
      if (branch.parentId) {
        // Find the parent branch at any level in the tree
        const findAndAddChild = (branches: Record<string, Branch>): boolean => {
          for (const key in branches) {
            if (key === branch.parentId) {
              if (!branches[key].children) branches[key].children = [];
              branches[key].children!.push({ ...branch, children: [] });
              return true;
            } else if (
              branches[key].children &&
              branches[key].children.length > 0
            ) {
              const childrenObj = branches[key].children!.reduce<
                Record<string, Branch>
              >((acc, child) => {
                acc[child.id] = child;
                return acc;
              }, {});

              const found = findAndAddChild(childrenObj);
              if (found) return true;
            }
          }
          return false;
        };

        findAndAddChild(tree);
      }
    });

    return tree;
  };

  const branchTree = buildBranchTree();

  // Get the full message history for a branch (including parent messages)
  const getBranchMessages = (branchId: string): Message[] => {
    const branch = mockBranchesData[branchId];

    if (!branch.parentId) {
      return branch.messages;
    }

    const parentBranch = mockBranchesData[branch.parentId];
    const forkMessageIndex = parentBranch.messages.findIndex(
      (msg) => msg.id === branch.parentMessageId
    );

    const parentMessages = parentBranch.messages.slice(0, forkMessageIndex + 1);

    return [...parentMessages, ...branch.messages];
  };

  // Toggle branch expansion in the tree view
  const toggleBranchExpansion = (branchId: string): void => {
    setExpandedBranches((prev) => ({
      ...prev,
      [branchId]: !prev[branchId],
    }));
  };

  // Render a branch and its children recursively
  const renderBranchNode = (branch: Branch): React.ReactNode => {
    if (!branch) return null;

    const isActive = branch.id === activeBranch;
    const isExpanded = expandedBranches[branch.id];

    return (
      <div key={branch.id} className="ml-4 mt-1">
        <div
          className={`flex items-center p-2 rounded-lg cursor-pointer ${
            isActive
              ? "bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-900"
          }`}
        >
          {branch.children && branch.children.length > 0 && (
            <button
              onClick={() => toggleBranchExpansion(branch.id)}
              className="mr-1 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          )}

          <div
            className={`flex items-center flex-grow py-1 px-3 rounded-md border ${
              isActive
                ? "border-blue-500"
                : "border-gray-200 dark:border-gray-700"
            }`}
            onClick={() => setActiveBranch(branch.id)}
            style={{ borderLeftColor: branch.color, borderLeftWidth: "4px" }}
          >
            <GitBranch size={18} style={{ color: branch.color }} />
            <span className="ml-2 font-medium">{branch.name}</span>
            <div className="ml-auto flex items-center">
              <span className="text-xs text-gray-500">
                {branch.messages.length} messages
              </span>
            </div>
          </div>
        </div>

        {isExpanded && branch.children && branch.children.length > 0 && (
          <div className="border-l-2 border-dashed border-gray-300 dark:border-gray-700 pl-2">
            {branch.children.map((child) => renderBranchNode(child))}
          </div>
        )}
      </div>
    );
  };

  // Format timestamp to readable string
  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Left sidebar - Branch Tree */}
      <div className="w-1/4 border-r border-gray-200 dark:border-gray-800 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Branches</h2>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md flex items-center">
            <GitBranch size={16} className="mr-1" /> New Branch
          </button>
        </div>

        <div className="space-y-1">
          {Object.values(branchTree).map((branch) => renderBranchNode(branch))}
        </div>
      </div>

      {/* Main content - Messages */}
      <div className="flex-1 flex flex-col">
        {/* Branch header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center">
            <GitBranch
              size={20}
              style={{ color: mockBranchesData[activeBranch].color }}
            />
            <h2 className="text-lg font-bold ml-2">
              {mockBranchesData[activeBranch].name}
            </h2>
            {mockBranchesData[activeBranch].parentId && (
              <div className="ml-4 text-sm text-gray-500 flex items-center">
                <span>Branched from</span>
                <span
                  className="ml-1 font-medium"
                  style={{
                    color:
                      mockBranchesData[mockBranchesData[activeBranch].parentId]
                        .color,
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

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {getBranchMessages(activeBranch).map((message) => {
            const isFromParent =
              mockBranchesData[activeBranch].parentId &&
              !mockBranchesData[activeBranch].messages.find(
                (m) => m.id === message.id
              );

            return (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-3/4 rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : isFromParent
                      ? "bg-gray-100 dark:bg-gray-800 border-l-4 opacity-80"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
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
                  <div className="flex items-center mb-1">
                    <div className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 mr-2">
                      {message.role === "user" ? (
                        <User
                          size={16}
                          className="text-gray-700 dark:text-gray-300"
                        />
                      ) : (
                        <Bot
                          size={16}
                          className="text-gray-700 dark:text-gray-300"
                        />
                      )}
                    </div>
                    <span className="text-xs opacity-70">
                      {message.role === "user" ? "You" : "Assistant"} •{" "}
                      {formatTime(message.timestamp)}
                    </span>
                    {isFromParent && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700">
                        From parent
                      </span>
                    )}
                  </div>

                  <div className="mt-1">{message.content}</div>

                  {message.role === "assistant" && !isFromParent && (
                    <div className="mt-3 flex justify-end">
                      <button className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 flex items-center">
                        <GitBranch size={12} className="mr-1" /> Branch from
                        here
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Message input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-grow bg-transparent outline-none px-2"
            />
            <button className="ml-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center">
              <MessageSquare size={16} className="mr-1" /> Send
            </button>
          </div>
        </div>
      </div>

      {/* Right sidebar - Branch details */}
      <div className="w-1/5 border-l border-gray-200 dark:border-gray-800 p-4 overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Branch Details</h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm text-gray-500 mb-1">Branch Name</h4>
            <p className="font-medium">{mockBranchesData[activeBranch].name}</p>
          </div>

          <div>
            <h4 className="text-sm text-gray-500 mb-1">Created From</h4>
            <p className="font-medium">
              {mockBranchesData[activeBranch].parentId
                ? mockBranchesData[mockBranchesData[activeBranch].parentId].name
                : "Root Branch"}
            </p>
          </div>

          <div>
            <h4 className="text-sm text-gray-500 mb-1">Branch Color</h4>
            <div className="flex items-center">
              <div
                className="w-6 h-6 rounded-full mr-2"
                style={{
                  backgroundColor: mockBranchesData[activeBranch].color,
                }}
              ></div>
              <span>{mockBranchesData[activeBranch].color}</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm text-gray-500 mb-1">Messages</h4>
            <p className="font-medium">
              {mockBranchesData[activeBranch].messages.length} in this branch
            </p>
            <p className="text-sm mt-1">
              {getBranchMessages(activeBranch).length} total (including parent)
            </p>
          </div>

          <div>
            <h4 className="text-sm text-gray-500 mb-1">Actions</h4>
            <div className="space-y-2 mt-2">
              <button className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md text-sm text-left">
                Export Branch
              </button>
              <button className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md text-sm text-left">
                Compare Branches
              </button>
              <button className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md text-sm text-left">
                Delete Branch
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchingChatTree;