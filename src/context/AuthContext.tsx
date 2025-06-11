"use client";

import { mockBranchesData } from "@/components/sections/data";
import { INITIAL_AUTH_CONTEXT } from "@/constants";
import { featchCurrentUserData, fetchUserBranchData } from "@/firebase/api";
import { auth } from "@/firebase/firebase_config";
import { useData } from "@/hooks/useData";
import { AuthContextType, BranchWithMessages, UserDataType } from "@/types";
import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext<AuthContextType>(INITIAL_AUTH_CONTEXT);

export const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;

  if (obj1 == null || obj2 == null) return false;

  if (typeof obj1 !== typeof obj2) return false;

  if (typeof obj1 !== "object") return obj1 === obj2;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
};

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { setCurrentUserData } = useData();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        console.log("Auth state is changed: LoggedOut");
        return;
      }

      const userData = (await featchCurrentUserData(user)) as UserDataType;
      const userBranchData = await fetchUserBranchData(user.uid);

      setCurrentUserData({
        ...userData,
        branches: userBranchData as Record<string, BranchWithMessages>,
      });

      setCurrentUser(user);

      const accessToken = await user.getIdToken();

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      console.log("Auth state is changed: loggedIn");
    });

    return unsubscribe;
  }, [setCurrentUserData]);

  const value = {
    currentUser,
    setCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthContextProvider;
