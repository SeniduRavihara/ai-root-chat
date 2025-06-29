import { ThreadManager } from "@/types";

export const INITIAL_THREAD_MANAGER: ThreadManager = {
  activeThreadId: null,
  threads: {},
  threadOrder: [],
};

export const INITIAL_DATA_CONTEXT = {
  currentUserData: null,
  setCurrentUserData: () => {},
  threadManager: INITIAL_THREAD_MANAGER,
  setThreadManager: () => {},
  createThread: () => "",
  switchThread: () => {},
  deleteThread: () => {},
  updateThreadMetadata: () => {},
  getActiveThread: () => null,
  getThreadMessages: () => [],
  addMessageToThread: () => {},
};

export const INITIAL_AUTH_CONTEXT = {
  currentUser: null,
  setCurrentUser: () => {},
};
