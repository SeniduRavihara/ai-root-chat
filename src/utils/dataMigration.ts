import { BranchWithMessages, Message } from "@/types";

/**
 * Migrates Firebase data to include threadId and branchId properties
 * This ensures compatibility with the new thread system
 */
export const migrateFirebaseData = (
  branchesData: Record<string, BranchWithMessages>
): Record<string, BranchWithMessages> => {
  const migratedData: Record<string, BranchWithMessages> = {};

  Object.entries(branchesData).forEach(([branchId, branch]) => {
    const migratedMessages: Message[] = branch.messages.map((message) => ({
      ...message,
      threadId: `thread-${branchId}`,
      branchId: branchId,
    }));

    migratedData[branchId] = {
      ...branch,
      messages: migratedMessages,
    };
  });

  return migratedData;
};

/**
 * Ensures messages have the required threadId and branchId properties
 */
export const ensureMessageProperties = (
  message: Message,
  branchId: string
): Message => {
  return {
    ...message,
    threadId: message.threadId || `thread-${branchId}`,
    branchId: message.branchId || branchId,
  };
};

/**
 * Creates thread data from branch data
 */
export const createThreadFromBranch = (
  branchId: string,
  branch: BranchWithMessages
) => {
  return {
    threadId: `thread-${branchId}`,
    branchId: branchId,
    messages: branch.messages.map((msg) =>
      ensureMessageProperties(msg, branchId)
    ),
    metadata: {
      title: branch.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: branch.messages.length,
    },
    isActive: false,
    lastAccessed: new Date().toISOString(),
  };
};
