import { BranchWithMessages, Message } from "@/types";

/**
 * Migrates Firebase data to ensure branchId properties are present
 * This ensures compatibility with the branch system
 */
export const migrateFirebaseData = (
  branchesData: Record<string, BranchWithMessages>
): Record<string, BranchWithMessages> => {
  const migratedData: Record<string, BranchWithMessages> = {};

  Object.entries(branchesData).forEach(([branchId, branch]) => {
    const migratedMessages: Message[] = branch.messages.map((message) => ({
      ...message,
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
 * Ensures messages have the required branchId property
 */
export const ensureMessageProperties = (
  message: Message,
  branchId: string
): Message => {
  return {
    ...message,
    branchId: message.branchId || branchId,
  };
};
