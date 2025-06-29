"use client";

import { mockBranchesData } from "@/components/sections/data";
import { INITIAL_DATA_CONTEXT } from "@/constants";
import {
  DataContextType,
  Message,
  ThreadContext,
  ThreadManager,
  ThreadMetadata,
  UserWithMessages,
} from "@/types";
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
  const [threadManager, setThreadManager] = useState<ThreadManager>({
    activeThreadId: null,
    threads: {},
    threadOrder: [],
  });

  // Memoized thread operations for performance
  const createThread = useCallback(
    (branchId: string, initialMessage?: Message): string => {
      const threadId = `thread-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const newThread: ThreadContext = {
        threadId,
        branchId,
        messages: initialMessage ? [initialMessage] : [],
        metadata: {
          title: `Thread ${threadManager.threadOrder.length + 1}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: initialMessage ? 1 : 0,
        },
        isActive: true,
        lastAccessed: new Date().toISOString(),
      };

      setThreadManager((prev) => ({
        ...prev,
        threads: {
          ...prev.threads,
          [threadId]: newThread,
        },
        threadOrder: [...prev.threadOrder, threadId],
        activeThreadId: threadId,
      }));

      return threadId;
    },
    [threadManager.threadOrder.length]
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
      // Create initial thread from main branch
      const mainBranch = mockBranchesData["main"];
      if (mainBranch) {
        createThread("main", mainBranch.messages[0]);
      }
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
    ]
  );

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export default DataContextProvider;
