"use client";

import { INITIAL_AUTH_CONTEXT } from "@/constants";
import { featchCurrentUserData, fetchUserBranchData } from "@/firebase/api";
import { auth } from "@/firebase/firebase_config";
import { useData } from "@/hooks/useData";
import { AuthContextType } from "@/types";
import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext<AuthContextType>(INITIAL_AUTH_CONTEXT);

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

      const userData = await featchCurrentUserData(user);
      const userBranchData = await fetchUserBranchData(user.uid);

      // console.log("SENU", userData, userBranchData);

      setCurrentUserData({ ...userData, branches: userBranchData });

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
