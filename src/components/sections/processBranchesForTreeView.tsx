import { GitBranch, GitFork, Maximize2, Minimize2 } from "lucide-react";
import { useMemo } from "react";
import { Branch } from "../../types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface BranchWithMessages extends Branch {
  color: string;
  messages: Message[];
}

export interface BranchNode {
  id: string;
  name: string;
  color: string;
  messageCount: number;
  children: BranchNode[];
  depth: number;
  parentId: string | null;
  parentMessageId?: string | null;
  horizontalPosition: number;
}

export interface Connection {
  id: string;
  source: { id: string; x: number; y: number };
  target: { id: string; x: number; y: number };
  color: string;
}

interface BranchTreeVisualizationProps {
  activeBranch: string;
  setActiveBranch: (branchId: string) => void;
  hoveredBranch: string | null;
  setHoveredBranch: (branchId: string | null) => void;
  expandedTreeView: boolean;
  setExpandedTreeView: (expanded: boolean) => void;
  treeViewHeight: number;
  mockBranchesData: Record<string, BranchWithMessages>;
}

// Process data to create a hierarchical tree structure with node positions
const processBranchesForTreeView = (
  mockBranchesData: Record<string, BranchWithMessages>
) => {
  // Create a hierarchical structure
  const mainBranch = mockBranchesData["main"];
  const tree: BranchNode = {
    id: mainBranch.id,
    name: mainBranch.name,
    color: mainBranch.color,
    messageCount: mainBranch.messages.length,
    children: [],
    depth: 0,
    parentId: null,
    horizontalPosition: 0,
  };

  // Helper to find a node in the tree
  const findNode = (id: string | null, node: BranchNode): BranchNode | null => {
    if (!id) return null;
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
      const node: BranchNode = {
        id: branch.id,
        name: branch.name,
        color: branch.color,
        messageCount: branch.messages.length,
        children: [],
        depth: parentNode.depth + 1,
        parentId: branch.parentId,
        parentMessageId: branch.parentMessageId,
        horizontalPosition: 0,
      };
      parentNode.children.push(node);
    }
  });

  // Assign horizontal positions to create a nicer tree layout
  let maxDepth = 0;
  const assignPositions = (node: BranchNode, horizontalPos = 0) => {
    node.horizontalPosition = horizontalPos;
    if (node.depth > maxDepth) maxDepth = node.depth;

    if (!node.children || node.children.length === 0) return;

    // Sort children to get a more balanced tree
    node.children.sort((a: BranchNode, b: BranchNode) => {
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

  assignPositions(tree);

  // Flatten tree for easier rendering
  const flattenedTree: BranchNode[] = [];
  const flattenTree = (node: BranchNode) => {
    flattenedTree.push({
      id: node.id,
      name: node.name,
      color: node.color,
      messageCount: node.messageCount,
      depth: node.depth,
      horizontalPosition: node.horizontalPosition,
      parentId: node.parentId,
      parentMessageId: node.parentMessageId,
      children: node.children,
    });

    if (node.children) {
      node.children.forEach((child: BranchNode) => flattenTree(child));
    }
  };

  flattenTree(tree);

  return { flattenedTree, maxDepth };
};

// Calculate branch connections for the visual tree
const calculateBranchConnections = (
  flattenedTree: BranchNode[]
): Connection[] => {
  const connections: Connection[] = [];

  flattenedTree.forEach((branch: BranchNode) => {
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

export default function BranchTreeVisualization({
  activeBranch,
  setActiveBranch,
  hoveredBranch,
  setHoveredBranch,
  expandedTreeView,
  setExpandedTreeView,
  treeViewHeight,
  mockBranchesData,
}: BranchTreeVisualizationProps) {
  // Process branch data for visualization using memoization
  const { flattenedTree, maxDepth } = useMemo(
    () => processBranchesForTreeView(mockBranchesData),
    [mockBranchesData]
  );

  const connections = useMemo(
    () => calculateBranchConnections(flattenedTree),
    [flattenedTree]
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

  return (
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
                      (Math.atan2(targetY - sourceY, targetX - sourceX) * 180) /
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
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
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
  );
}
