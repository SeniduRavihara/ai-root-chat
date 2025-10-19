"use client";

import { INITIAL_AUTH_CONTEXT } from "@/constants";
import { featchCurrentUserData } from "@/firebase/api";
import { auth } from "@/firebase/firebase_config";
import { useData } from "@/hooks/useData";
import { AuthContextType, UserDataType } from "@/types";
import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext<AuthContextType>(INITIAL_AUTH_CONTEXT);

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { setCurrentUserData } = useData();
const [currentUser, setCurrentUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);

  useEffect(() => {
  let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
  if (!isMounted) return;

      try {
  if (!user) {
  setCurrentUser(null);
  setCurrentUserData(null);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  console.log("Auth state is changed: LoggedOut");
} else {
    const userData = (await featchCurrentUserData(user)) as UserDataType;

    if (!isMounted) return;

          setCurrentUserData(userData);
  setCurrentUser(user);

  const accessToken = await user.getIdToken();
  localStorage.setItem("token", accessToken);
          localStorage.setItem("user", JSON.stringify(user));

  console.log("Auth state is changed: loggedIn");
}
      } catch (error) {
console.error("Error during auth state change:", error);
        if (isMounted) {
  setCurrentUser(null);
  setCurrentUserData(null);
}
} finally {
if (isMounted) {
  setLoading(false);
  }
}
});

return () => {
isMounted = false;
unsubscribe();
};
}, [setCurrentUserData]);

const value = {
currentUser,
setCurrentUser,
loading,
};

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthContextProvider;
