import { mockBranchesData } from "@/components/sections/data";
import { BranchWithMessages, Message } from "@/types";

/**
 * Test utility to verify branch inheritance
 * This shows how messages are inherited from parent branches
 */
export const testBranchInheritance = () => {
  console.log("=== Testing Branch Inheritance ===");

  const getBranchMessages = (branchId: string): Message[] => {
    const getBranchPath = (
      bid: string
    ): { branchId: string; parentMessageId: string | null }[] => {
      const path: { branchId: string; parentMessageId: string | null }[] = [];
      let currentBranchId: string | null = bid;

      while (currentBranchId) {
        const branch: BranchWithMessages | undefined =
          mockBranchesData[currentBranchId];
        if (!branch) break;

        path.unshift({
          branchId: currentBranchId,
          parentMessageId: branch.parentMessageId,
        });
        currentBranchId = branch.parentId;
      }

      return path;
    };

    const branchPath = getBranchPath(branchId);
    let allMessages: Message[] = [];

    for (let i = 0; i < branchPath.length; i++) {
      const { branchId: currentBranchId, parentMessageId } = branchPath[i];
      const branch: BranchWithMessages | undefined =
        mockBranchesData[currentBranchId];

      if (!branch) continue;

      if (i === 0) {
        // Root branch - add all its messages
        allMessages = [...branch.messages];
      } else {
        // Child branch - inherit messages up to the fork point, then add branch-specific messages
        const forkIndex = allMessages.findIndex(
          (msg) => msg.id === parentMessageId
        );

        if (forkIndex >= 0) {
          // Keep messages up to and including the fork point, then add branch messages
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
  };

  // Test main branch
  console.log("\n--- Main Branch ---");
  const mainMessages = getBranchMessages("main");
  mainMessages.forEach((msg, index) => {
    console.log(
      `${index + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`
    );
  });

  // Test high-risk branch (should inherit from main up to msg2)
  console.log("\n--- High Risk Branch ---");
  const highRiskMessages = getBranchMessages("high-risk");
  highRiskMessages.forEach((msg, index) => {
    console.log(
      `${index + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`
    );
  });

  // Test low-risk branch (should inherit from main up to msg2)
  console.log("\n--- Low Risk Branch ---");
  const lowRiskMessages = getBranchMessages("low-risk");
  lowRiskMessages.forEach((msg, index) => {
    console.log(
      `${index + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`
    );
  });

  // Test crypto-focus branch (should inherit from real-estate up to msg14, then its own messages)
  console.log("\n--- Crypto Focus Branch ---");
  const cryptoFocusMessages = getBranchMessages("crypto-focus");
  cryptoFocusMessages.forEach((msg, index) => {
    console.log(
      `${index + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`
    );
  });

  console.log("\n=== Inheritance Test Complete ===");
};
