/**
 * Message Service
 * Handles message creation, formatting, and processing logic
 */

import { Message } from "../types";

/**
 * Create a new user message
 *
 * @param content - Message content
 * @param branchId - Branch the message belongs to
 * @returns New message object
 */
export function createUserMessage(content: string, branchId: string): Message {
  return {
    id: `user-${Date.now()}`,
    role: "user" as const,
    content,
    timestamp: new Date().toISOString(),
    branchId,
  };
}

/**
 * Create a new assistant message
 *
 * @param content - Message content
 * @param branchId - Branch the message belongs to
 * @returns New message object
 */
export function createAssistantMessage(
  content: string,
  branchId: string
): Message {
  return {
    id: `assistant-${Date.now()}`,
    role: "assistant" as const,
    content,
    timestamp: new Date().toISOString(),
    branchId,
  };
}

/**
 * Format timestamp to readable string
 *
 * @param timestamp - ISO timestamp string
 * @returns Formatted time string (e.g., "10:30 AM")
 */
export function formatMessageTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get a preview of message content (truncated)
 *
 * @param content - Full message content
 * @param maxLength - Maximum length of preview
 * @returns Truncated preview with ellipsis if needed
 */
export function getMessagePreview(
  content: string,
  maxLength: number = 50
): string {
  if (content.length <= maxLength) {
    return content;
  }
  return `${content.slice(0, maxLength)}${
    content.length > maxLength ? "…" : ""
  }`;
}

/**
 * Create a contextual follow-up question from selected text
 *
 * @param selectedText - The text selected by user
 * @returns Contextual question
 */
export function createFollowUpQuestion(selectedText: string): string {
  return `Tell me more about "${selectedText}"`;
}

/**
 * Validate message content
 *
 * @param content - Message content to validate
 * @returns True if valid, false otherwise
 */
export function isValidMessageContent(content: string): boolean {
  return content.trim().length > 0;
}

/**
 * Get conversation snippet for AI naming
 * Creates a concise snippet from user and AI messages
 *
 * @param userMessage - User's message
 * @param aiMessage - AI's response
 * @param maxLength - Maximum length per message
 * @returns Formatted conversation snippet
 */
export function getConversationSnippet(
  userMessage: string,
  aiMessage: string,
  maxLength: number = 150
): string {
  const userSnippet = userMessage.substring(0, maxLength);
  const aiSnippet = aiMessage.substring(0, maxLength);

  return `User: ${userSnippet}${
    userMessage.length > maxLength ? "..." : ""
  }\n\nAssistant: ${aiSnippet}${aiMessage.length > maxLength ? "..." : ""}`;
}

/**
 * Count total messages in a conversation
 *
 * @param messages - Array of messages
 * @returns Total message count
 */
export function getMessageCount(messages: Message[]): number {
  return messages.length;
}

/**
 * Get the last message from an array
 *
 * @param messages - Array of messages
 * @returns Last message or undefined if array is empty
 */
export function getLastMessage(messages: Message[]): Message | undefined {
  return messages.length > 0 ? messages[messages.length - 1] : undefined;
}

/**
 * Filter messages by role
 *
 * @param messages - Array of messages
 * @param role - Role to filter by
 * @returns Filtered messages
 */
export function filterMessagesByRole(
  messages: Message[],
  role: "user" | "assistant"
): Message[] {
  return messages.filter((msg) => msg.role === role);
}

/**
 * Check if this is the first exchange in a conversation
 * (2 messages: 1 user + 1 assistant)
 *
 * @param messageCount - Total message count
 * @returns True if this is first exchange
 */
export function isFirstExchange(messageCount: number): boolean {
  return messageCount === 2;
}

/**
 * Get conversation statistics
 *
 * @param messages - Array of messages
 * @returns Statistics object
 */
export function getConversationStats(messages: Message[]): {
  total: number;
  userMessages: number;
  assistantMessages: number;
  averageLength: number;
} {
  const userMessages = filterMessagesByRole(messages, "user");
  const assistantMessages = filterMessagesByRole(messages, "assistant");

  const totalLength = messages.reduce(
    (sum, msg) => sum + msg.content.length,
    0
  );
  const averageLength =
    messages.length > 0 ? Math.round(totalLength / messages.length) : 0;

  return {
    total: messages.length,
    userMessages: userMessages.length,
    assistantMessages: assistantMessages.length,
    averageLength,
  };
}
