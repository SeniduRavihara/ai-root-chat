"use client";

import dagre from "@dagrejs/dagre";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  EdgeTypes,
  MarkerType,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { Branch } from "../../types";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

interface BranchWithMessages extends Branch {
  color: string;
  messages: Message[] | undefined;
}

type Props = {
  branchesData: Record<string, BranchWithMessages>;
  activeBranch: string;
  setActiveBranch: (id: string) => void;
  height: number;
};

const nodeWidth = 200;
const nodeHeight = 54;

// Define nodeTypes and edgeTypes outside the component to prevent recreation
const nodeTypes: NodeTypes = {};
const edgeTypes: EdgeTypes = {};

export default function BranchTreeFlow({
  branchesData,
  activeBranch,
  setActiveBranch,
  height,
}: Props) {
  const [reactFlowKey, setReactFlowKey] = useState<string>("");
  const dataRef = useRef<string>("");
  const activeBranchRef = useRef<string>("");

  // Memoize nodes and edges to prevent unnecessary recreations
  const { nodes, edges } = useMemo(() => {
    // Early return for empty data
    if (!branchesData || Object.keys(branchesData).length === 0) {
      return { nodes: [], edges: [] };
    }

    const branchValues = Object.values(branchesData).filter(
      (b) => b && b.id && b.name
    );

    if (branchValues.length === 0) {
      return { nodes: [], edges: [] };
    }

    // Create nodes with stable structure
    const newNodes = branchValues.map((b) => {
      const color = b.color || "#6366f1";
      const messageCount = Array.isArray(b.messages) ? b.messages.length : 0;

      return {
        id: b.id,
        data: {
          label: b.name,
          color,
          messageCount,
        },
        style: {
          border: `2px solid ${color}`,
          background: "#111827",
          borderRadius: 12,
          padding: 8,
          width: nodeWidth,
          color: "#f9fafb",
          fontSize: "14px",
          fontWeight: "500",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)",
        },
        className:
          b.id === activeBranch ? "shadow-lg ring-2 ring-blue-400" : "",
        position: { x: 0, y: 0 },
      };
    });

    // Create edges with stable structure
    const newEdges = branchValues
      .filter((b) => b.parentId && branchesData[b.parentId])
      .map((b) => {
        const color = b.color || "#6366f1";
        return {
          id: `edge-${b.parentId}-${b.id}`,
          source: b.parentId as string,
          target: b.id,
          animated: false,
          style: { stroke: color },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color,
          },
        };
      });

    // Apply dagre layout only if we have nodes
    if (newNodes.length > 0) {
      const g = new dagre.graphlib.Graph();
      g.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 80 });
      g.setDefaultEdgeLabel(() => ({}));

      newNodes.forEach((n) =>
        g.setNode(n.id, { width: nodeWidth, height: nodeHeight })
      );
      newEdges.forEach((e) => g.setEdge(e.source, e.target));

      dagre.layout(g);

      newNodes.forEach((n) => {
        const nodeData = g.node(n.id);
        if (nodeData) {
          n.position = { x: nodeData.x, y: nodeData.y };
        }
      });
    }

    return { nodes: newNodes, edges: newEdges };
  }, [branchesData, activeBranch]);

  useEffect(() => {
    // Create a stable data signature
    const dataSignature = JSON.stringify({
      keys: Object.keys(branchesData || {}).sort(),
      content: Object.keys(branchesData || {}).map((key) => ({
        id: branchesData[key]?.id,
        name: branchesData[key]?.name,
        parentId: branchesData[key]?.parentId,
        messageCount: Array.isArray(branchesData[key]?.messages)
          ? branchesData[key].messages.length
          : 0,
      })),
    });

    // Check if this is a completely new chat (different keys)
    const isNewChat = dataRef.current && dataRef.current !== dataSignature;

    // If it's a new chat, generate a new key to force complete ReactFlow re-render
    if (isNewChat) {
      const newKey = `chat-${Date.now()}-${Math.random()}`;
      setReactFlowKey(newKey);
      console.log("New chat detected, forcing ReactFlow re-render");
    }

    dataRef.current = dataSignature;
    activeBranchRef.current = activeBranch;
  }, [branchesData, activeBranch]);

  return (
    <div style={{ height }}>
      <ReactFlow
        key={reactFlowKey} // Force complete re-render when switching chats
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll
        onNodeClick={(_, node) => setActiveBranch(node.id)}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
