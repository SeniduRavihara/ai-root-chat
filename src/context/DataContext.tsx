"use client";

import { INITIAL_DATA_CONTEXT } from "@/constants";
import { db } from "@/firebase/firebase_config";
import {
  BranchWithMessages,
  Chat,
  DataContextType,
  UserDataType,
} from "@/types";
import { collection, onSnapshot } from "firebase/firestore";
import { createContext, useEffect, useMemo, useRef, useState } from "react";

export const DataContext = createContext<DataContextType>(INITIAL_DATA_CONTEXT);

const DataContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [activeBranch, setActiveBranch] = useState<string | null>(null);
  const [isChatsLoading, setIsChatsLoading] = useState<boolean>(false);

  const [currentUserData, setCurrentUserData] = useState<UserDataType | null>(
    null
  );
  const [rawBranchesData, setRawBranchesData] = useState<
    Record<string, BranchWithMessages>
  >({});

  // Use a ref to store the last stable version of branchesData
  const stableBranchesDataRef = useRef<Record<string, BranchWithMessages>>({});

  // Memoize branchesData with deep comparison
  const branchesData = useMemo(() => {
    const newKeys = Object.keys(rawBranchesData).sort();
    const oldKeys = Object.keys(stableBranchesDataRef.current).sort();

    // Quick check: if keys are different, definitely changed
    if (newKeys.join(",") !== oldKeys.join(",")) {
      stableBranchesDataRef.current = rawBranchesData;
      return rawBranchesData;
    }

    // Deep comparison of branch data
    let hasChanges = false;
    for (const key of newKeys) {
      const newBranch = rawBranchesData[key];
      const oldBranch = stableBranchesDataRef.current[key];

      if (!oldBranch) {
        hasChanges = true;
        break;
      }

      // Compare critical fields
      if (
        newBranch.name !== oldBranch.name ||
        newBranch.parentId !== oldBranch.parentId ||
        newBranch.parentMessageId !== oldBranch.parentMessageId ||
        newBranch.color !== oldBranch.color
      ) {
        hasChanges = true;
        break;
      }

      // Compare messages array length and content
      const newMessages = newBranch.messages || [];
      const oldMessages = oldBranch.messages || [];

      if (newMessages.length !== oldMessages.length) {
        hasChanges = true;
        break;
      }

      // Compare each message
      for (let i = 0; i < newMessages.length; i++) {
        if (
          newMessages[i].id !== oldMessages[i].id ||
          newMessages[i].content !== oldMessages[i].content ||
          newMessages[i].role !== oldMessages[i].role
        ) {
          hasChanges = true;
          break;
        }
      }

      if (hasChanges) break;
    }

    // Only update if there are actual changes
    if (hasChanges) {
      stableBranchesDataRef.current = rawBranchesData;
      return rawBranchesData;
    }

    // Return the old reference if nothing changed
    return stableBranchesDataRef.current;
  }, [rawBranchesData]);

  const [currentChat, setCurrentChat] = useState();

  useEffect(() => {
    if (!currentUserData) {
      setAllChats([]);
      setIsChatsLoading(false);
      return;
    }

    setIsChatsLoading(true);

    const chatsCollectionRef = collection(
      db,
      "users",
      currentUserData.uid,
      "chats"
    );

    const unsubscribe = onSnapshot(
      chatsCollectionRef,
      (QuerySnapshot) => {
        const chatsArr = QuerySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Array<Chat>;
        setAllChats(chatsArr);
        setIsChatsLoading(false);
      },
      (error) => {
        console.error("Error loading chats:", error);
        setIsChatsLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUserData]);

  // Load last active chat from localStorage
  useEffect(() => {
    try {
      const savedChatId = localStorage.getItem("activeChatId");
      if (savedChatId) setActiveChatId(savedChatId);
    } catch {}
  }, []);

  // Subscribe to branches of the active chat
  useEffect(() => {
    if (!currentUserData?.uid || !activeChatId) {
      setRawBranchesData({});
      // Also reset the stable ref
      stableBranchesDataRef.current = {};
      return;
    }

    const branchesRef = collection(
      db,
      "users",
      currentUserData.uid,
      "chats",
      activeChatId,
      "branches"
    );

    const unsubscribe = onSnapshot(
      branchesRef,
      (querySnapshot) => {
        const map: Record<string, BranchWithMessages> = {};
        querySnapshot.forEach((docSnap) => {
          const branch = docSnap.data() as BranchWithMessages;
          map[branch.id] = branch;
        });

        // Just set the new data - the useMemo will handle comparison
        setRawBranchesData(map);
      },
      (error) => {
        console.error("Error subscribing to branches:", error);
      }
    );

    return unsubscribe;
  }, [currentUserData?.uid, activeChatId]);

  const makeChatActive = (id: string) => {
    console.log("Active Chat ID", id);

    setActiveChatId(id);
    try {
      localStorage.setItem("activeChatId", id);
    } catch {}
  };

  // Memoize the entire context value
  const contextValue = useMemo(
    () => ({
      currentUserData,
      setCurrentUserData,
      branchesData,
      setBranchesData: setRawBranchesData,
      makeChatActive,
      allChats,
      activeChatId,
      isChatsLoading,
    }),
    [
      currentUserData,
      branchesData, // This is now stable
      allChats,
      activeChatId,
      isChatsLoading,
    ]
  );

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export default DataContextProvider;
