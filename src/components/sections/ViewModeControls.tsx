import { GitBranch, MessageCircle, RefreshCw } from "lucide-react";

interface ViewModeControlsProps {
  viewMode: "both" | "chat-only" | "tree-only";
  onViewModeChange: (mode: "both" | "chat-only" | "tree-only") => void;
}

export default function ViewModeControls({
  viewMode,
  onViewModeChange,
}: ViewModeControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-20 flex space-x-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-1">
      <button
        onClick={() => onViewModeChange("both")}
        className={`p-2 rounded transition-colors ${
          viewMode === "both"
            ? "bg-blue-500 text-white"
            : "hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
        title="Show Both"
      >
        <RefreshCw size={18} />
      </button>
      <button
        onClick={() => onViewModeChange("chat-only")}
        className={`p-2 rounded transition-colors ${
          viewMode === "chat-only"
            ? "bg-blue-500 text-white"
            : "hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
        title="Chat Only"
      >
        <MessageCircle size={18} />
      </button>
      <button
        onClick={() => onViewModeChange("tree-only")}
        className={`p-2 rounded transition-colors ${
          viewMode === "tree-only"
            ? "bg-blue-500 text-white"
            : "hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
        title="Tree Only"
      >
        <GitBranch size={18} />
      </button>
    </div>
  );
}
