"use client";

import { createContext } from "react";

export const DataContext = createContext({});

const DataContextProvider = ({ children }: { children: React.ReactNode }) => {
  const value = {};
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
export default DataContextProvider;
