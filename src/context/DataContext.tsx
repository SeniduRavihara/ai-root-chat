"use client";

import { mockBranchesData } from "@/components/sections/data";
import { INITIAL_DATA_CONTEXT } from "@/constants";
import { DataContextType, UserWithMessages } from "@/types";
import { createContext, useEffect, useState } from "react";

export const DataContext = createContext<DataContextType>(INITIAL_DATA_CONTEXT);

const DataContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUserData, setCurrentUserData] =
    useState<UserWithMessages | null>(null);

  useEffect(() => {
    if (currentUserData?.branches) {
      console.log(currentUserData?.branches);
    }
  }, [currentUserData]);

  const value = {
    currentUserData,
    setCurrentUserData,
    branchesData: currentUserData?.branches || mockBranchesData,
  };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContextProvider;
