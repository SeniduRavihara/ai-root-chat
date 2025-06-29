"use client";

import { useData } from "@/hooks/useData";
import { ThreadContext } from "@/types";
import {
  ChevronDown,
  Clock,
  MessageSquare,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface ThreadManagerProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ThreadManager({
  isOpen,
  onToggle,
}: ThreadManagerProps) {
  const {
    threadManager,
    switchThread,
    deleteThread,
    createThread,
    updateThreadMetadata,
    getActiveThread,
  } = useData();

  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const activeThread = getActiveThread();

  const handleThreadSwitch = (threadId: string) => {
    switchThread(threadId);
  };

  const handleThreadDelete = (threadId: string) => {
    if (confirm("Are you sure you want to delete this thread?")) {
      deleteThread(threadId);
    }
  };

  const handleCreateNewThread = () => {
    createThread("main");
  };

  const handleEditThread = (thread: ThreadContext) => {
    setEditingThreadId(thread.threadId);
    setEditTitle(thread.metadata.title);
  };

  const handleSaveEdit = (threadId: string) => {
    updateThreadMetadata(threadId, { title: editTitle });
    setEditingThreadId(null);
    setEditTitle("");
  };

  const handleCancelEdit = () => {
    setEditingThreadId(null);
    setEditTitle("");
  };

  const formatLastAccessed = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-80 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Threads
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCreateNewThread}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Create new thread"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={onToggle}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronDown
                size={16}
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {threadManager.threadOrder.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
            <p>No threads yet</p>
            <button
              onClick={handleCreateNewThread}
              className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Create your first thread
            </button>
          </div>
        ) : (
          <div className="p-2">
            {threadManager.threadOrder.map((threadId) => {
              const thread = threadManager.threads[threadId];
              if (!thread) return null;

              const isActive = thread.threadId === activeThread?.threadId;
              const isEditing = editingThreadId === thread.threadId;

              return (
                <div
                  key={thread.threadId}
                  className={`mb-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className="p-3">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveEdit(thread.threadId)}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleThreadSwitch(thread.threadId)}
                          className="flex-1 text-left min-w-0"
                        >
                          <div className="flex items-center space-x-2">
                            <MessageSquare
                              size={16}
                              className={`${
                                isActive
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-gray-400 dark:text-gray-500"
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-sm font-medium truncate ${
                                  isActive
                                    ? "text-blue-900 dark:text-blue-100"
                                    : "text-gray-900 dark:text-gray-100"
                                }`}
                              >
                                {thread.metadata.title}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>
                                  {thread.metadata.messageCount} messages
                                </span>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  <Clock size={12} />
                                  <span>
                                    {formatLastAccessed(thread.lastAccessed)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditThread(thread)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                            title="Edit thread"
                          >
                            <MoreVertical size={14} />
                          </button>
                          <button
                            onClick={() => handleThreadDelete(thread.threadId)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                            title="Delete thread"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {threadManager.threadOrder.length} thread
          {threadManager.threadOrder.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
