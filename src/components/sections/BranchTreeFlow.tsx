"use client";

import dagre from "@dagrejs/dagre";
import { useMemo } from "react";
import ReactFlow, { Background, Controls, MarkerType } from "reactflow";
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

export default function BranchTreeFlow({
  branchesData,
  activeBranch,
  setActiveBranch,
  height,
}: Props) {
  const { nodes, edges } = useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 80 });
    g.setDefaultEdgeLabel(() => ({}));

    const nodes = Object.values(branchesData).map((b) => ({
      id: b.id,
      data: {
        label: b.name || b.id,
        color: b.color,
        messageCount: Array.isArray(b.messages) ? b.messages.length : 0,
      },
      style: {
        border: `2px solid ${b.color}`,
        background: "#111827", // dark:bg-gray-900 equivalent
        borderRadius: 12,
        padding: 8,
        width: nodeWidth,
        color: "#f9fafb", // dark:text-gray-100 equivalent
        fontSize: "14px",
        fontWeight: "500",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)",
      },
      className: b.id === activeBranch ? "shadow-lg ring-2 ring-blue-400" : "",
      position: { x: 0, y: 0 },
    }));

    nodes.forEach((n) =>
      g.setNode(n.id, { width: nodeWidth, height: nodeHeight })
    );

    const edges = Object.values(branchesData)
      .filter((b) => b.parentId)
      .map((b) => ({
        id: `${b.parentId}-${b.id}`,
        source: b.parentId as string,
        target: b.id,
        animated: false,
        style: { stroke: branchesData[b.id].color },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: branchesData[b.id].color,
        },
      }));

    edges.forEach((e) => g.setEdge(e.source, e.target));

    dagre.layout(g);

    nodes.forEach((n) => {
      const { x, y } = g.node(n.id);
      n.position = { x, y };
    });

    return { nodes, edges };
  }, [branchesData, activeBranch]);

  return (
    <div style={{ height }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
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
