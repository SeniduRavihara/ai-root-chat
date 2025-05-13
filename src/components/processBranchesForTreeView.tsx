"use client";

import { useState, useEffect } from "react";
import {
  GitBranch,
  MessageSquare,
  User,
  Bot,
  ChevronDown,
  ChevronRight,
  GitFork,
  Plus,
  Search,
  Clock,
  Send,
  Menu,
  MoreHorizontal,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";

// Mock data representing a branching conversation tree
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

// Process data to create a hierarchical tree structure with node positions
const processBranchesForTreeView = () => {
  // Create a hierarchical structure
  const tree = { id: "root", children: [] };
  const mainBranch = mockBranchesData["main"];

  // Add main branch as first child
  const mainNode = {
    id: mainBranch.id,
    name: mainBranch.name,
    color: mainBranch.color,
    messageCount: mainBranch.messages.length,
    children: [],
    depth: 0,
    parentId: null,
    horizontalPosition: 0,
  };
  tree.children.push(mainNode);

  // Helper to find a node in the tree
  const findNode = (id, node) => {
    if (node.id === id) return node;
    if (!node.children) return null;

    for (const child of node.children) {
      const found = findNode(id, child);
      if (found) return found;
    }
    return null;
  };

  // Add all branches as nodes
  Object.values(mockBranchesData).forEach((branch) => {
    if (branch.id === "main") return; // Skip main branch as we already added it

    const parentNode = findNode(branch.parentId, tree);
    if (parentNode) {
      const node = {
        id: branch.id,
        name: branch.name,
        color: branch.color,
        messageCount: branch.messages.length,
        children: [],
        depth: parentNode.depth + 1,
        parentId: branch.parentId,
        parentMessageId: branch.parentMessageId,
      };
      parentNode.children.push(node);
    }
  });

  // Assign horizontal positions to create a nicer tree layout
  let maxDepth = 0;
  const assignPositions = (node, horizontalPos = 0) => {
    node.horizontalPosition = horizontalPos;
    if (node.depth > maxDepth) maxDepth = node.depth;

    if (!node.children || node.children.length === 0) return;

    // Sort children to get a more balanced tree
    node.children.sort((a, b) => {
      // Sort by number of messages (more messages = more weight)
      return b.messageCount - a.messageCount;
    });

    // Assign positions to children
    const childCount = node.children.length;
    for (let i = 0; i < childCount; i++) {
      const offset = i - (childCount - 1) / 2;
      assignPositions(node.children[i], horizontalPos + offset);
    }
  };

  assignPositions(mainNode);

  // Flatten tree for easier rendering
  const flattenedTree = [];
  const flattenTree = (node, parent = null) => {
    flattenedTree.push({
      id: node.id,
      name: node.name,
      color: node.color,
      messageCount: node.messageCount,
      depth: node.depth,
      horizontalPosition: node.horizontalPosition,
      parentId: node.parentId,
      parentMessageId: node.parentMessageId,
    });

    if (node.children) {
      node.children.forEach((child) => flattenTree(child, node));
    }
  };

  flattenTree(mainNode);

  return { flattenedTree, maxDepth };
};

// Calculate branch connections for the visual tree
const calculateBranchConnections = (flattenedTree) => {
  const connections = [];

  flattenedTree.forEach((branch) => {
    if (branch.parentId) {
      const parent = flattenedTree.find((b) => b.id === branch.parentId);
      if (parent) {
        connections.push({
          id: `${parent.id}-${branch.id}`,
          source: {
            id: parent.id,
            x: parent.horizontalPosition,
            y: parent.depth,
          },
          target: {
            id: branch.id,
            x: branch.horizontalPosition,
            y: branch.depth,
          },
          color: branch.color,
        });
      }
    }
  });

  return connections;
};

export default function BranchingChatTree() {
  const [activeBranch, setActiveBranch] = useState("main");
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

  // Process branch data for visualization
  const { flattenedTree, maxDepth } = processBranchesForTreeView();
  const connections = calculateBranchConnections(flattenedTree);

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

  // Format timestamp to readable string
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter branches based on search query
  const filteredBranches = Object.values(mockBranchesData).filter((branch) =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Visual settings for the branch tree visualization
  const nodeWidth = 180;
  const nodeHeight = 50;
  const verticalSpacing = 100;
  const horizontalSpacing = 220;
  const treeWidth = 1200; // Width of the visualization area
  const treeHeight = (maxDepth + 1) * verticalSpacing; // Height based on tree depth
  const nodeRadius = 6;

  // Calculate the center point of the SVG
  const svgCenterX = treeWidth / 2;

  const treeViewHeight = expandedTreeView
    ? Math.max(400, windowHeight * 0.5)
    : Math.min(300, windowHeight * 0.3);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Top Navigation */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
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
      </div>

      {/* Branch Tree Visualization */}
      <div
        className="border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 overflow-hidden transition-all duration-300"
        style={{ height: `${treeViewHeight}px` }}
      >
        <div className="flex justify-between items-center px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold flex items-center">
            <GitBranch size={18} className="mr-2 text-blue-500" />
            Branch Network
          </h2>
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setExpandedTreeView(!expandedTreeView)}
            >
              {expandedTreeView ? (
                <Minimize2 size={18} />
              ) : (
                <Maximize2 size={18} />
              )}
            </button>
            <button className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md text-sm font-medium flex items-center">
              <GitFork size={16} className="mr-2" /> Fork Branch
            </button>
            <button className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium flex items-center">
              <GitBranch size={16} className="mr-2" /> New Branch
            </button>
          </div>
        </div>
        <div
          className="relative overflow-auto"
          style={{
            height: `calc(${treeViewHeight}px - 56px)`,
          }}
        >
          <svg width={treeWidth} height={treeHeight} className="mx-auto my-4">
            {/* Draw connecting lines between branches */}
            {connections.map((conn) => {
              const sourceX = svgCenterX + conn.source.x * horizontalSpacing;
              const sourceY = conn.source.y * verticalSpacing + nodeHeight / 2;
              const targetX = svgCenterX + conn.target.x * horizontalSpacing;
              const targetY = conn.target.y * verticalSpacing + nodeHeight / 2;

              const isHighlighted =
                hoveredBranch === conn.source.id ||
                hoveredBranch === conn.target.id ||
                activeBranch === conn.source.id ||
                activeBranch === conn.target.id;

              // Create gradient for the path
              const gradientId = `gradient-${conn.id}`;

              return (
                <g key={conn.id}>
                  {/* Define gradient */}
                  <defs>
                    <linearGradient
                      id={gradientId}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform={`rotate(${
                        (Math.atan2(targetY - sourceY, targetX - sourceX) *
                          180) /
                        Math.PI
                      }, ${sourceX}, ${sourceY})`}
                    >
                      <stop
                        offset="0%"
                        stopColor={mockBranchesData[conn.source.id].color}
                      />
                      <stop offset="100%" stopColor={conn.color} />
                    </linearGradient>
                  </defs>

                  {/* Curved path from source to target with drop shadow */}
                  <path
                    d={`M ${sourceX} ${sourceY} 
                        C ${sourceX} ${sourceY + (targetY - sourceY) / 2},
                          ${targetX} ${sourceY + (targetY - sourceY) / 2},
                          ${targetX} ${targetY}`}
                    filter="url(#shadow)"
                    stroke={`url(#${gradientId})`}
                    strokeWidth={isHighlighted ? 4 : 3}
                    fill="none"
                    strokeDasharray={isHighlighted ? "none" : ""}
                    opacity={isHighlighted ? 1 : 0.8}
                  />

                  {/* Animated flow along the path */}
                  <path
                    d={`M ${sourceX} ${sourceY} 
                        C ${sourceX} ${sourceY + (targetY - sourceY) / 2},
                          ${targetX} ${sourceY + (targetY - sourceY) / 2},
                          ${targetX} ${targetY}`}
                    stroke={conn.color}
                    strokeWidth={isHighlighted ? 2 : 1}
                    fill="none"
                    strokeDasharray="5,10"
                    opacity={isHighlighted ? 0.8 : 0.5}
                    style={{ animation: "flowAnimation 30s linear infinite" }}
                  />

                  {/* Circle at the target end */}
                  <circle
                    cx={targetX}
                    cy={targetY}
                    r={nodeRadius}
                    fill={conn.color}
                    filter="url(#glow)"
                  />
                </g>
              );
            })}

            {/* Define filters */}
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="1"
                  stdDeviation="2"
                  floodOpacity="0.3"
                />
              </filter>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Add animation keyframes */}
            <style>
              {`
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
                    transform: scale(1.1);
                    opacity: 0.8;
                  }
                  100% {
                    transform: scale(1);
                    opacity: 1;
                  }
                }
              `}
            </style>

            {/* Draw branch nodes */}
            {flattenedTree.map((branch) => {
              const x =
                svgCenterX + branch.horizontalPosition * horizontalSpacing;
              const y = branch.depth * verticalSpacing;
              const isActive = branch.id === activeBranch;
              const isHovered = branch.id === hoveredBranch;

              return (
                <g
                  key={branch.id}
                  onMouseEnter={() => setHoveredBranch(branch.id)}
                  onMouseLeave={() => setHoveredBranch(null)}
                  onClick={() => setActiveBranch(branch.id)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Branch box with glassy effect */}
                  <rect
                    x={x - nodeWidth / 2}
                    y={y}
                    width={nodeWidth}
                    height={nodeHeight}
                    rx={12}
                    fill={`${branch.color}10`}
                    stroke={branch.color}
                    strokeWidth={isActive || isHovered ? 3 : 2}
                    className={`${
                      isActive ? "dark:fill-gray-800" : "dark:fill-gray-900"
                    }`}
                    filter="url(#shadow)"
                    style={
                      isActive
                        ? { animation: "pulse 2s infinite ease-in-out" }
                        : {}
                    }
                  />

                  {/* Highlight for active branch */}
                  {isActive && (
                    <rect
                      x={x - nodeWidth / 2}
                      y={y}
                      width={nodeWidth}
                      height={nodeHeight}
                      rx={12}
                      fill="none"
                      stroke={branch.color}
                      strokeWidth={3}
                      filter="url(#glow)"
                      opacity={0.5}
                    />
                  )}

                  {/* Branch icon */}
                  <foreignObject
                    x={x - nodeWidth / 2 + 8}
                    y={y + 6}
                    width={36}
                    height={36}
                  >
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-full"
                      style={{ backgroundColor: `${branch.color}30` }}
                    >
                      <GitBranch size={20} style={{ color: branch.color }} />
                    </div>
                  </foreignObject>

                  {/* Branch name */}
                  <text
                    x={x - nodeWidth / 2 + 50}
                    y={y + nodeHeight / 2 - 2}
                    className="text-sm font-bold fill-gray-900 dark:fill-gray-100"
                    style={{
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      fontWeight: isActive ? "bold" : "medium",
                    }}
                  >
                    {branch.name}
                  </text>

                  {/* Messages count */}
                  <text
                    x={x - nodeWidth / 2 + 50}
                    y={y + nodeHeight / 2 + 16}
                    className="text-xs fill-gray-500 dark:fill-gray-400"
                  >
                    {branch.messageCount} messages
                  </text>

                  {/* Pill with message count */}
                  <g>
                    <rect
                      x={x + nodeWidth / 2 - 40}
                      y={y + 8}
                      width={32}
                      height={18}
                      rx={9}
                      fill={branch.color}
                      opacity={0.2}
                    />
                    <text
                      x={x + nodeWidth / 2 - 24}
                      y={y + 21}
                      className="text-xs text-center font-bold"
                      style={{
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        fill: branch.color,
                      }}
                    >
                      {branch.messageCount}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Branches List */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 w-full lg:w-1/4 max-w-sm border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto flex flex-col transition-all duration-300 absolute lg:relative z-10 h-[calc(100%-${treeViewHeight}px-64px)] lg:h-auto`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Branch Explorer</h3>
            <button
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search branches..."
                className="w-full py-2 pl-10 pr-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Branches List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredBranches.map((branch) => {
              const isActive = branch.id === activeBranch;
              const parentName = branch.parentId
                ? mockBranchesData[branch.parentId].name
                : null;

              return (
                <div
                  key={branch.id}
                  className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent"
                  }`}
                  onClick={() => setActiveBranch(branch.id)}
                >
                  <div
                    className="w-1.5 h-12 rounded-full mr-3"
                    style={{ backgroundColor: branch.color }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{branch.name}</h4>
                      <div
                        className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${branch.color}20`,
                          color: branch.color,
                        }}
                      >
                        {branch.messages.length}
                      </div>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <MessageSquare size={12} className="mr-1" />
                      <span>{branch.messages.length} messages</span>
                      {branch.parentId && (
                        <span className="ml-3 flex items-center">
                          <GitBranch size={12} className="mr-1" />
                          from {parentName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center font-medium">
              <Plus size={16} className="mr-2" /> New Branch
            </button>
          </div>
        </div>

        {/* Main content - Messages */}
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
                          mockBranchesData[
                            mockBranchesData[activeBranch].parentId
                          ].name
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
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-grow bg-transparent outline-none px-3 py-2"
              />
              <div className="flex items-center">
                <button className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                  <Plus size={20} />
                </button>
                <button className="ml-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center">
                  <Send size={16} className="mr-2" /> Send
                </button>
              </div>
            </div>

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
