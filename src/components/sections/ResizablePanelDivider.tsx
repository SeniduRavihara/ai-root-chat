import { useEffect, useRef } from "react";

interface ResizablePanelDividerProps {
  onResize: (deltaY: number) => void;
  isResizing: boolean;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}

export default function ResizablePanelDivider({
  onResize,
  isResizing,
  onResizeStart,
  onResizeEnd,
}: ResizablePanelDividerProps) {
  const resizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      onResize(e.movementY);
    };

    const handleMouseUp = () => {
      onResizeEnd();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, onResize, onResizeEnd]);

  return (
    <div
      ref={resizeRef}
      className={`h-1 bg-gray-300 dark:bg-gray-700 cursor-ns-resize hover:bg-blue-400 dark:hover:bg-blue-600 transition-colors ${
        isResizing ? "bg-blue-500" : ""
      }`}
      onMouseDown={onResizeStart}
    />
  );
}
