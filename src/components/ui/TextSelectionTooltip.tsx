"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

interface TextSelectionTooltipProps {
  onAskAI: (selectedText: string, messageId: string) => void;
}

export default function TextSelectionTooltip({ onAskAI }: TextSelectionTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [messageId, setMessageId] = useState("");
  const [isSelectionIntentional, setIsSelectionIntentional] = useState(false);

  useEffect(() => {
    let hideTimeout: NodeJS.Timeout;
    let showTimeout: NodeJS.Timeout;

    const handleSelectionChange = () => {
      // Ignore selection changes if we're intentionally clearing it
      if (isSelectionIntentional) {
        return;
      }

      // Clear any pending timeouts
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      if (showTimeout) {
        clearTimeout(showTimeout);
      }

      // Debounce the selection handling
      showTimeout = setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          hideTimeout = setTimeout(() => setIsVisible(false), 200);
          return;
        }

        const selectedText = selection.toString().trim();
        if (!selectedText || selectedText.length < 3) {
          hideTimeout = setTimeout(() => setIsVisible(false), 200);
          return;
        }

        // Check if the selection is within a message content area
        const range = selection.getRangeAt(0);
        let messageElement: Node | null = range.commonAncestorContainer;

        // Walk up the DOM to find the message element
        while (messageElement && !(messageElement as Element).hasAttribute?.('data-message-id')) {
          messageElement = (messageElement as Element).parentElement;
        }

        if (!messageElement || !(messageElement as Element).hasAttribute('data-message-id')) {
          hideTimeout = setTimeout(() => setIsVisible(false), 200);
          return;
        }

        const messageId = (messageElement as Element).getAttribute('data-message-id');
        if (!messageId) {
          hideTimeout = setTimeout(() => setIsVisible(false), 200);
          return;
        }

        // Get the bounding rectangle of the selection
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          hideTimeout = setTimeout(() => setIsVisible(false), 200);
          return;
        }

        setSelectedText(selectedText);
        setMessageId(messageId);
        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });
        setIsVisible(true);
      }, 100); // Debounce delay
    };

    const handleDocumentClick = (e: MouseEvent) => {
      // Only hide if clicking outside and tooltip is visible
      if (!isVisible) return;

      const target = e.target as Element;
      const tooltip = document.querySelector('.text-selection-tooltip');

      // If clicking on the tooltip itself, don't hide
      if (tooltip && tooltip.contains(target)) {
        return;
      }

      // If clicking on a message or selection area, don't hide immediately
      if (target.closest('[data-message-id]')) {
        return;
      }

      // Hide with delay
      hideTimeout = setTimeout(() => setIsVisible(false), 300);
    };

    // Listen for selection changes
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleSelectionChange);

    // Use mousedown instead of click to prevent interference
    document.addEventListener('mousedown', handleDocumentClick);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('mousedown', handleDocumentClick);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
    };
  }, [isVisible, isSelectionIntentional]);

  const handleAskAI = async () => {
    setIsVisible(false); // Hide tooltip immediately
    window.getSelection()?.removeAllRanges(); // Clear selection immediately
    setIsSelectionIntentional(true); // Mark that we're intentionally clearing selection
    try {
      await onAskAI(selectedText, messageId);
    } catch (error) {
      console.error('Error in Ask AI:', error);
    } finally {
      setIsSelectionIntentional(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="text-selection-tooltip fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 flex items-center space-x-2 pointer-events-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <button
        onClick={handleAskAI}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
      >
        <MessageCircle size={14} />
        <span>Ask AI</span>
      </button>
      <button
        onClick={() => {
          setIsVisible(false);
          window.getSelection()?.removeAllRanges();
        }}
        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1"
      >
        <X size={12} />
      </button>
    </div>
  );
}
