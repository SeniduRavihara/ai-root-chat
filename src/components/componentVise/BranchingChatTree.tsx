"use client";

import { Clock, GitBranch, Menu, Plus } from "lucide-react";
import { useEffect, useState } from "react";

// import { mockBranchesData } from "./data"; // We'll move data to a separate file
import BranchTreeVisualization from "./processBranchesForTreeView";
import BranchExplorer from "./BranchExplorer";
import ConversationView from "./ConversationView";

const mockBranchesData = {
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


export default function BranchingChatTree2() {
  const [activeBranch, setActiveBranch] = useState("crypto-focus");
  const [hoveredBranch, setHoveredBranch] = useState(null);
  const [windowHeight, setWindowHeight] = useState(0);
  const [expandedTreeView, setExpandedTreeView] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Get the full message history for a branch (including parent messages)
  const getBranchMessages = (branchId) => {
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

  // Filter branches based on search query
  const filteredBranches = Object.values(mockBranchesData).filter((branch) =>
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
      {/* <BranchTreeVisualization
        activeBranch={activeBranch}
        setActiveBranch={setActiveBranch}
        hoveredBranch={hoveredBranch}
        setHoveredBranch={setHoveredBranch}
        expandedTreeView={expandedTreeView}
        setExpandedTreeView={setExpandedTreeView}
        treeViewHeight={treeViewHeight}
        mockBranchesData={mockBranchesData}
      /> */}

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Branch Explorer Component */}
        {/* <BranchExplorer
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeBranch={activeBranch}
          setActiveBranch={setActiveBranch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredBranches={filteredBranches}
          mockBranchesData={mockBranchesData}
          treeViewHeight={treeViewHeight}
        /> */}

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
