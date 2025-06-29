"use client";

import { mockBranchesData } from "@/components/sections/data";
import { INITIAL_DATA_CONTEXT } from "@/constants";
import { DataContextType, UserWithMessages } from "@/types";
import { migrateFirebaseData } from "@/utils/dataMigration";
import { createContext, useEffect, useMemo, useState } from "react";

export const DataContext = createContext<DataContextType>(INITIAL_DATA_CONTEXT);

const DataContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUserData, setCurrentUserData] =
    useState<UserWithMessages | null>(null);

  // Initialize with mock data if no user data exists
  useEffect(() => {
    if (!currentUserData?.branches) {
      // Migrate mock data to ensure compatibility
      const migratedData = migrateFirebaseData(mockBranchesData);
      setCurrentUserData({
        uid: "mock-user",
        userName: "Mock User",
        email: "mock@example.com",
        branches: migratedData,
      });
    }
  }, [currentUserData]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      currentUserData,
      setCurrentUserData,
      branchesData: currentUserData?.branches || mockBranchesData,
    }),
    [currentUserData]
  );

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export default DataContextProvider;
