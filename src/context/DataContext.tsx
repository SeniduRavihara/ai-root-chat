"use client";

import { mockBranchesData } from "@/components/sections/data";
import { INITIAL_DATA_CONTEXT } from "@/constants";
import {
  BranchWithMessages,
  DataContextType,
  Message,
  ThreadContext,
  ThreadManager as ThreadManagerType,
  ThreadMetadata,
  UserWithMessages,
} from "@/types";
import { migrateFirebaseData } from "@/utils/dataMigration";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export const DataContext = createContext<DataContextType>(INITIAL_DATA_CONTEXT);

const DataContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUserData, setCurrentUserData] =
    useState<UserWithMessages | null>(null);
  const [threadManager, setThreadManager] = useState<ThreadManagerType>({
    activeThreadId: null,
    threads: {},
    threadOrder: [],
  });

  // Memoized thread operations for performance
  const createThread = useCallback(
    (branchId: string): string => {
      const threadId = `thread-${branchId}`;

      // Check if thread already exists
      if (threadManager.threads[threadId]) {
        return threadId;
      }

      // Get all messages for this branch including inheritance
      const getBranchMessages = (targetBranchId: string): Message[] => {
        const getBranchPath = (
          bid: string
        ): { branchId: string; parentMessageId: string | null }[] => {
          const path: { branchId: string; parentMessageId: string | null }[] =
            [];
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

        const branchPath = getBranchPath(targetBranchId);
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

      const messages = getBranchMessages(branchId);

      const newThread: ThreadContext = {
        threadId,
        branchId,
        messages: messages,
        metadata: {
          title:
            mockBranchesData[branchId]?.name ||
            `Thread ${threadManager.threadOrder.length + 1}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: messages.length,
        },
        isActive: threadManager.threadOrder.length === 0, // First thread is active
        lastAccessed: new Date().toISOString(),
      };

      setThreadManager((prev) => ({
        ...prev,
        threads: {
          ...prev.threads,
          [threadId]: newThread,
        },
        threadOrder: [...prev.threadOrder, threadId],
        activeThreadId:
          threadManager.threadOrder.length === 0
            ? threadId
            : prev.activeThreadId,
      }));

      return threadId;
    },
    [threadManager.threadOrder.length, threadManager.threads]
  );

  const switchThread = useCallback((threadId: string) => {
    setThreadManager((prev) => {
      if (!prev.threads[threadId]) return prev;

      // Update all threads to set isActive to false
      const updatedThreads = Object.keys(prev.threads).reduce<
        Record<string, ThreadContext>
      >(
        (acc, key) => ({
          ...acc,
          [key]: {
            ...prev.threads[key],
            isActive: false,
          },
        }),
        {}
      );

      // Set the target thread as active
      updatedThreads[threadId] = {
        ...updatedThreads[threadId],
        isActive: true,
        lastAccessed: new Date().toISOString(),
      };

      return {
        ...prev,
        threads: updatedThreads,
        activeThreadId: threadId,
      };
    });
  }, []);

  const deleteThread = useCallback((threadId: string) => {
    setThreadManager((prev) => {
      const remainingThreads = { ...prev.threads };
      delete remainingThreads[threadId];
      const newThreadOrder = prev.threadOrder.filter((id) => id !== threadId);

      // If we're deleting the active thread, switch to the first available thread
      let newActiveThreadId = prev.activeThreadId;
      if (prev.activeThreadId === threadId) {
        newActiveThreadId =
          newThreadOrder.length > 0 ? newThreadOrder[0] : null;

        // Update the new active thread
        if (newActiveThreadId && remainingThreads[newActiveThreadId]) {
          remainingThreads[newActiveThreadId] = {
            ...remainingThreads[newActiveThreadId],
            isActive: true,
          };
        }
      }

      return {
        ...prev,
        threads: remainingThreads,
        threadOrder: newThreadOrder,
        activeThreadId: newActiveThreadId,
      };
    });
  }, []);

  // Enhanced updateThreadMetadata that also syncs with branches
  const updateThreadMetadata = useCallback(
    (threadId: string, metadata: Partial<ThreadMetadata>) => {
      setThreadManager((prev) => {
        if (!prev.threads[threadId]) return prev;

        return {
          ...prev,
          threads: {
            ...prev.threads,
            [threadId]: {
              ...prev.threads[threadId],
              metadata: {
                ...prev.threads[threadId].metadata,
                ...metadata,
                updatedAt: new Date().toISOString(),
              },
            },
          },
        };
      });
    },
    []
  );

  // Add a function to add message to thread and sync with branch
  const addMessageToThread = useCallback(
    (threadId: string, message: Message) => {
      setThreadManager((prev) => {
        if (!prev.threads[threadId]) return prev;

        const updatedMessages = [...prev.threads[threadId].messages, message];

        return {
          ...prev,
          threads: {
            ...prev.threads,
            [threadId]: {
              ...prev.threads[threadId],
              messages: updatedMessages,
              metadata: {
                ...prev.threads[threadId].metadata,
                messageCount: updatedMessages.length,
                updatedAt: new Date().toISOString(),
              },
            },
          },
        };
      });
    },
    []
  );

  const getActiveThread = useCallback((): ThreadContext | null => {
    if (!threadManager.activeThreadId) return null;
    return threadManager.threads[threadManager.activeThreadId] || null;
  }, [threadManager.activeThreadId, threadManager.threads]);

  const getThreadMessages = useCallback(
    (threadId: string): Message[] => {
      return threadManager.threads[threadId]?.messages || [];
    },
    [threadManager.threads]
  );

  // Initialize with mock data if no user data exists
  useEffect(() => {
    if (
      !currentUserData?.branches &&
      Object.keys(threadManager.threads).length === 0
    ) {
      // Migrate mock data to ensure compatibility
      const migratedData = migrateFirebaseData(mockBranchesData);

      // Create threads from all existing branches
      Object.entries(migratedData).forEach(([branchId, branch]) => {
        if (branch.messages.length > 0) {
          // Create thread with the first message from the branch
          createThread(branchId);
        } else {
          createThread(branchId);
        }
      });
    }
  }, [currentUserData, threadManager.threads, createThread]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      currentUserData,
      setCurrentUserData,
      threadManager,
      setThreadManager,
      createThread,
      switchThread,
      deleteThread,
      updateThreadMetadata,
      getActiveThread,
      getThreadMessages,
      addMessageToThread,
      branchesData: currentUserData?.branches || mockBranchesData,
    }),
    [
      currentUserData,
      threadManager,
      createThread,
      switchThread,
      deleteThread,
      updateThreadMetadata,
      getActiveThread,
      getThreadMessages,
      addMessageToThread,
    ]
  );

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export default DataContextProvider;
