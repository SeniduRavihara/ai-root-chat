/**
 * Branch Tree Service
 * Handles all tree/linked-list data structure operations for branches
 * Implements the core logic for branch traversal, message inheritance, and path calculation
 */

import { BranchWithMessages, Message } from "../types";

/**
 * Represents a node in the branch path (linked list structure)
 */
export interface BranchPathNode {
  branchId: string;
  parentMessageId: string | null;
}

/**
 * Get the complete path from root to a specific branch
 * This traverses the linked list structure from child to parent
 *
 * @param branchId - The target branch ID
 * @param branchesData - All branches data
 * @returns Array of branch path nodes from root to target
 */
export function getBranchPath(
  branchId: string,
  branchesData: Record<string, BranchWithMessages>
): BranchPathNode[] {
  const branchPath: BranchPathNode[] = [];
  let currentBranchId: string | null = branchId;

  // Traverse backwards from child to parent (linked list traversal)
  while (currentBranchId) {
    const branch = branchesData[currentBranchId];

    if (!branch) {
      console.warn(
        `Branch with id ${currentBranchId} not found in branchesData`
      );
      break;
    }

    // Add to the beginning of array to maintain root-to-leaf order
    branchPath.unshift({
      branchId: currentBranchId,
      parentMessageId: branch.parentMessageId,
    });

    // Move to parent (linked list traversal)
    currentBranchId = branch.parentId;
  }

  return branchPath;
}

/**
 * Get all messages for a branch including inherited messages from ancestors
 * This builds the complete message history by traversing the branch tree
 *
 * @param branchId - The target branch ID
 * @param branchesData - All branches data
 * @returns Complete array of messages including inherited ones
 */
export function getBranchMessages(
  branchId: string,
  branchesData: Record<string, BranchWithMessages>
): Message[] {
  const branchPath = getBranchPath(branchId, branchesData);
  let allMessages: Message[] = [];

  // Build message history by traversing the path
  for (let i = 0; i < branchPath.length; i++) {
    const { branchId: currentBranchId, parentMessageId } = branchPath[i];
    const branch = branchesData[currentBranchId];

    if (!branch) continue;

    if (i === 0) {
      // Root branch - include all its messages
      allMessages = [...branch.messages];
    } else {
      // Child branch - inherit messages up to fork point, then add branch-specific messages
      const forkIndex = allMessages.findIndex(
        (msg) => msg.id === parentMessageId
      );

      if (forkIndex >= 0) {
        // Keep messages up to and including the fork point
        const inheritedMessages = allMessages.slice(0, forkIndex + 1);
        const branchMessages = branch.messages;
        allMessages = [...inheritedMessages, ...branchMessages];
      } else {
        // If fork point not found, just append branch messages
        allMessages = [...allMessages, ...branch.messages];
      }
    }
  }

  return allMessages;
}

/**
 * Find which branch a message belongs to (directly, not inherited)
 *
 * @param messageId - The message ID to find
 * @param branchesData - All branches data
 * @returns The branch ID or null if not found
 */
export function getMessageBranchId(
  messageId: string,
  branchesData: Record<string, BranchWithMessages>
): string | null {
  for (const branchId in branchesData) {
    const branch = branchesData[branchId];
    if (branch.messages.some((msg) => msg.id === messageId)) {
      return branchId;
    }
  }
  return null;
}

/**
 * Get the branch object that a message belongs to
 *
 * @param messageId - The message ID to find
 * @param branchesData - All branches data
 * @returns The branch object or null if not found
 */
export function getMessageBranch(
  messageId: string,
  branchesData: Record<string, BranchWithMessages>
): BranchWithMessages | null {
  const branchId = getMessageBranchId(messageId, branchesData);
  return branchId ? branchesData[branchId] : null;
}

/**
 * Check if a message belongs to the specified branch (directly, not inherited)
 *
 * @param messageId - The message ID to check
 * @param branchId - The branch ID to check against
 * @param branchesData - All branches data
 * @returns True if message is directly in this branch
 */
export function isMessageFromBranch(
  messageId: string,
  branchId: string,
  branchesData: Record<string, BranchWithMessages>
): boolean {
  return (
    branchesData[branchId]?.messages.some((msg) => msg.id === messageId) ||
    false
  );
}

/**
 * Get all child branches that fork from a specific message
 *
 * @param messageId - The parent message ID
 * @param branchesData - All branches data
 * @returns Array of branches that fork from this message
 */
export function getChildBranches(
  messageId: string,
  branchesData: Record<string, BranchWithMessages>
): BranchWithMessages[] {
  const branches = Object.values(branchesData);
  return branches.filter((branch) => branch.parentMessageId === messageId);
}

/**
 * Check if a message is a fork point (has child branches)
 *
 * @param messageId - The message ID to check
 * @param branchesData - All branches data
 * @returns True if this message has child branches
 */
export function isMessageForkPoint(
  messageId: string,
  branchesData: Record<string, BranchWithMessages>
): boolean {
  return getChildBranches(messageId, branchesData).length > 0;
}

/**
 * Get the depth/level of a branch in the tree
 * Root branch has depth 0, its children have depth 1, etc.
 *
 * @param branchId - The branch ID
 * @param branchesData - All branches data
 * @returns The depth level of the branch
 */
export function getBranchDepth(
  branchId: string,
  branchesData: Record<string, BranchWithMessages>
): number {
  const path = getBranchPath(branchId, branchesData);
  return path.length - 1; // Subtract 1 because root has depth 0
}

/**
 * Get all branches at a specific depth level
 *
 * @param depth - The depth level (0 = root)
 * @param branchesData - All branches data
 * @returns Array of branches at that depth
 */
export function getBranchesAtDepth(
  depth: number,
  branchesData: Record<string, BranchWithMessages>
): BranchWithMessages[] {
  return Object.values(branchesData).filter(
    (branch) => getBranchDepth(branch.id, branchesData) === depth
  );
}

/**
 * Get all ancestor branch IDs for a given branch
 *
 * @param branchId - The branch ID
 * @param branchesData - All branches data
 * @returns Array of ancestor branch IDs from root to direct parent
 */
export function getAncestorBranchIds(
  branchId: string,
  branchesData: Record<string, BranchWithMessages>
): string[] {
  const path = getBranchPath(branchId, branchesData);
  // Remove the last element (the branch itself) and return only IDs
  return path.slice(0, -1).map((node) => node.branchId);
}

/**
 * Get all descendant branches (children, grandchildren, etc.)
 *
 * @param branchId - The parent branch ID
 * @param branchesData - All branches data
 * @returns Array of all descendant branches
 */
export function getDescendantBranches(
  branchId: string,
  branchesData: Record<string, BranchWithMessages>
): BranchWithMessages[] {
  const descendants: BranchWithMessages[] = [];
  const queue: string[] = [branchId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = Object.values(branchesData).filter(
      (branch) => branch.parentId === currentId
    );

    descendants.push(...children);
    queue.push(...children.map((child) => child.id));
  }

  return descendants;
}

/**
 * Validate branch tree integrity
 * Checks for orphaned branches, circular references, etc.
 *
 * @param branchesData - All branches data
 * @returns Object with validation results
 */
export function validateBranchTree(
  branchesData: Record<string, BranchWithMessages>
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const branches = Object.values(branchesData);

  for (const branch of branches) {
    // Check if parent exists (except for root)
    if (branch.parentId && !branchesData[branch.parentId]) {
      errors.push(
        `Branch "${branch.name}" (${branch.id}) has invalid parent: ${branch.parentId}`
      );
    }

    // Check if parent message exists in parent branch
    if (branch.parentId && branch.parentMessageId) {
      const parentBranch = branchesData[branch.parentId];
      if (parentBranch) {
        const parentHasMessage = parentBranch.messages.some(
          (msg) => msg.id === branch.parentMessageId
        );
        if (!parentHasMessage) {
          errors.push(
            `Branch "${branch.name}" (${branch.id}) references non-existent parent message: ${branch.parentMessageId}`
          );
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
