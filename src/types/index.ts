// types.ts

import { User } from "firebase/auth";
import React from "react";

export type DataContextType = {
  currentUserData: UserWithMessages | null;
  setCurrentUserData: React.Dispatch<
    React.SetStateAction<UserWithMessages | null>
  >;
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
