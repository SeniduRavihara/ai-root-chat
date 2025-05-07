// types.ts
export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

export interface Branch {
  id: string;
  name: string;
  parentId: string | null;
  parentMessageId: string | null;
}
