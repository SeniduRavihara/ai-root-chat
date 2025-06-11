"use client";

import { INITIAL_DATA_CONTEXT } from "@/constants";
import { DataContextType, UserWithMessages } from "@/types";
import { createContext, useEffect, useState } from "react";

export const DataContext = createContext<DataContextType>(INITIAL_DATA_CONTEXT);

const DataContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUserData, setCurrentUserData] =
    useState<UserWithMessages | null>(null);

  useEffect(() => {
    console.log(currentUserData);
  }, [currentUserData]);

  const value = { currentUserData, setCurrentUserData };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContextProvider;
