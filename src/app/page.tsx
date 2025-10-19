"use client";

import { useAuth } from "@/hooks/useAuth";
import { useData } from "@/hooks/useData";
import BranchingChatTree from "@/components/sections/BranchingChatTree";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { currentUser, loading: authLoading } = useAuth();
  const { currentUserData, isChatsLoading } = useData();
  const router = useRouter();

  // Handle logout redirect
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  // Show loading while auth is initializing or user data is loading
  if (authLoading || !currentUser || !currentUserData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {authLoading ? "Checking authentication..." :
             !currentUser ? "Authenticating..." : "Loading your data..."}
          </p>
        </div>
      </div>
    );
  }

  // Show loading while chats are loading (but allow app to render)
  if (isChatsLoading) {
    return (
      <main>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your chats...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <BranchingChatTree />
    </main>
  );
}
