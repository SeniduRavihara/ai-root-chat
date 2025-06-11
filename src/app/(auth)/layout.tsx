"use client";

import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();

  if (currentUser) {
    redirect("/");
  }

  return <>{children}</>;
};
export default AuthLayout;
