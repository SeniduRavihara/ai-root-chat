/**
 * Branch Helper Utilities
 * Helper functions for branch operations, validation, and management
 */

import { BranchWithMessages } from "../types";

/**
 * Generate a random color for a branch
 *
 * @returns Hex color string
 */
export function getRandomBranchColor(): string {
  const colors = [
    "#6366f1", // indigo
    "#ec4899", // pink
    "#10b981", // emerald
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#14b8a6", // teal
    "#f43f5e", // rose
    "#0ea5e9", // sky
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Create a default branch name
 *
 * @param parentBranchName - Optional parent branch name for context
 * @returns Default branch name
 */
export function getDefaultBranchName(parentBranchName?: string): string {
  if (parentBranchName) {
    return `Branch from ${parentBranchName}`;
  }
  return "New Branch";
}

/**
 * Create a branch name from selected text
 *
 * @param selectedText - The selected text
 * @param maxLength - Maximum length for the name
 * @returns Truncated branch name
 */
export function createBranchNameFromText(
  selectedText: string,
  maxLength: number = 30
): string {
  const truncated = selectedText.substring(0, maxLength);
  return truncated.length < selectedText.length ? `${truncated}...` : truncated;
}

/**
 * Filter branches by search query
 *
 * @param branches - Array of branches
 * @param searchQuery - Search string
 * @returns Filtered branches
 */
export function filterBranchesBySearch(
  branches: BranchWithMessages[],
  searchQuery: string
): BranchWithMessages[] {
  const query = searchQuery.toLowerCase().trim();

  if (!query) {
    return branches;
  }

  return branches.filter((branch) => branch.name.toLowerCase().includes(query));
}

/**
 * Sort branches by various criteria
 *
 * @param branches - Array of branches
 * @param sortBy - Sort criteria
 * @returns Sorted branches
 */
export function sortBranches(
  branches: BranchWithMessages[],
  sortBy: "name" | "messageCount" | "created"
): BranchWithMessages[] {
  const sorted = [...branches];

  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case "messageCount":
      return sorted.sort((a, b) => b.messages.length - a.messages.length);

    case "created":
      // Assuming branches are created in order of their IDs
      return sorted.sort((a, b) => a.id.localeCompare(b.id));

    default:
      return sorted;
  }
}

/**
 * Get branch statistics
 *
 * @param branch - The branch to analyze
 * @returns Statistics object
 */
export function getBranchStats(branch: BranchWithMessages): {
  messageCount: number;
  userMessageCount: number;
  assistantMessageCount: number;
  hasChildren: boolean;
} {
  const userMessageCount = branch.messages.filter(
    (msg) => msg.role === "user"
  ).length;
  const assistantMessageCount = branch.messages.filter(
    (msg) => msg.role === "assistant"
  ).length;

  return {
    messageCount: branch.messages.length,
    userMessageCount,
    assistantMessageCount,
    hasChildren: false, // Will be determined by tree service
  };
}

/**
 * Validate branch name
 *
 * @param name - Branch name to validate
 * @returns True if valid
 */
export function isValidBranchName(name: string): boolean {
  return name.trim().length > 0 && name.trim().length <= 50;
}

/**
 * Check if branch is root branch
 *
 * @param branch - Branch to check
 * @returns True if root branch
 */
export function isRootBranch(branch: BranchWithMessages): boolean {
  return branch.parentId === null;
}

/**
 * Get branch display color with opacity
 *
 * @param color - Hex color
 * @param opacity - Opacity (0-100)
 * @returns Color with opacity for backgrounds
 */
export function getBranchColorWithOpacity(
  color: string,
  opacity: number
): string {
  return `${color}${Math.round((opacity / 100) * 255)
    .toString(16)
    .padStart(2, "0")}`;
}

/**
 * Create a new branch object
 *
 * @param id - Branch ID
 * @param name - Branch name
 * @param parentId - Parent branch ID
 * @param parentMessageId - Parent message ID (fork point)
 * @param color - Optional custom color
 * @returns New branch object
 */
export function createBranch(
  id: string,
  name: string,
  parentId: string | null,
  parentMessageId: string | null,
  color?: string
): BranchWithMessages {
  return {
    id,
    name,
    parentId,
    parentMessageId,
    color: color || getRandomBranchColor(),
    messages: [],
  };
}

/**
 * Get all branches as a flat array
 *
 * @param branchesData - Record of branches
 * @returns Array of branches
 */
export function getBranchesArray(
  branchesData: Record<string, BranchWithMessages>
): BranchWithMessages[] {
  return Object.values(branchesData);
}

/**
 * Convert branches array to record/map
 *
 * @param branches - Array of branches
 * @returns Record indexed by branch ID
 */
export function branchesArrayToRecord(
  branches: BranchWithMessages[]
): Record<string, BranchWithMessages> {
  const record: Record<string, BranchWithMessages> = {};
  branches.forEach((branch) => {
    record[branch.id] = branch;
  });
  return record;
}
