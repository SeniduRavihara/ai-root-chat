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
import { createContext, useEffect, useState } from "react";

export const DataContext = createContext<DataContextType>(INITIAL_DATA_CONTEXT);

const DataContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [activeBranch, setActiveBranch] = useState<string | null>(null);
  const [isChatsLoading, setIsChatsLoading] = useState<boolean>(true);

  const [currentUserData, setCurrentUserData] = useState<UserDataType | null>(
    null
  );
  const [branchesData, setBranchesData] = useState<
    Record<string, BranchWithMessages>
  >({});

  const [currentChat, setCurrentChat] = useState();

  useEffect(() => {
    if (!currentUserData) return;

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
      () => setIsChatsLoading(false)
    );

    return unsubscribe;
  }, [currentUserData, setCurrentUserData]);

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
      setBranchesData({});
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
        setBranchesData(map);
        console.log(map);
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

  // Initialize with mock data if no user data exists
  // useEffect(() => {
  //   if (!currentUserData?.branches) {
  //     // Migrate mock data to ensure compatibility
  //     const migratedData = migrateFirebaseData(mockBranchesData);
  //     setCurrentUserData({
  //       uid: "mock-user",
  //       userName: "Mock User",
  //       email: "mock@example.com",
  //       branches: migratedData,
  //     });
  //   }
  // }, [currentUserData]);

  // Memoized context value to prevent unnecessary re-renders
  // const contextValue = useMemo(
  //   () => ({
  //     currentUserData,
  //     setCurrentUserData,
  //     branchesData: currentUserData?.branches || mockBranchesData,
  //   }),
  //   [currentUserData]
  // );

  return (
    <DataContext.Provider
      value={{
        currentUserData,
        setCurrentUserData,
        branchesData,
        setBranchesData,
        makeChatActive,
        allChats,
        activeChatId,
        isChatsLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContextProvider;
