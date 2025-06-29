// types.ts

import { User } from "firebase/auth";
import React from "react";

// Thread/Context Management Types
export interface ThreadContext {
  threadId: string;
  branchId: string;
  messages: Message[];
  metadata: ThreadMetadata;
  isActive: boolean;
  lastAccessed: string;
}

export interface ThreadMetadata {
  title: string;
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ThreadManager {
  activeThreadId: string | null;
  threads: Record<string, ThreadContext>;
  threadOrder: string[]; // For maintaining thread order
}

// Updated Data Context Types
export type DataContextType = {
  currentUserData: UserWithMessages | null;
  setCurrentUserData: React.Dispatch<
    React.SetStateAction<UserWithMessages | null>
  >;
  // Thread Management
  threadManager: ThreadManager;
  setThreadManager: React.Dispatch<React.SetStateAction<ThreadManager>>;
  // Thread Operations
  createThread: (branchId: string, initialMessage?: Message) => string;
  switchThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  updateThreadMetadata: (threadId: string, metadata: Partial<ThreadMetadata>) => void;
  getActiveThread: () => ThreadContext | null;
  getThreadMessages: (threadId: string) => Message[];
};

export type AuthContextType = {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
};

export type UserDataType = {
  uid: string;
  userName: string;
  email: string;
};

export interface UserWithMessages extends UserDataType {
  branches: Record<string, BranchWithMessages>;
}

// ------------------------------------------------------

export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  threadId?: string; // Link message to specific thread
  branchId?: string; // Link message to specific branch
}

export interface ChatNode {
  id: string;
  text: string;
  children?: ChatNode[];
  isSelected?: boolean;
  isExpanded?: boolean;
  level?: number;
}

export interface BranchExplorerProps {
  data: ChatNode[];
  onNodeClick: (node: ChatNode) => void;
}

export interface BranchingChatTreeProps {
  data: ChatNode[];
  onNodeClick: (node: ChatNode) => void;
}

export interface ConversationViewProps {
  data: ChatNode[];
  onNodeClick: (node: ChatNode) => void;
}

export interface Branch {
  id: string;
  name: string;
  parentId: string | null;
  parentMessageId: string | null;
  isExpanded?: boolean;
  level?: number;
}

export interface BranchWithMessages extends Branch {
  color: string;
  messages: Message[];
}

// Thread-specific props
export interface ThreadConversationViewProps {
  activeThreadId: string;
  threadManager: ThreadManager;
  onThreadSwitch: (threadId: string) => void;
  onThreadDelete: (threadId: string) => void;
}
