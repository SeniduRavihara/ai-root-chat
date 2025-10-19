import { addMockData } from "@/firebase/api";
import { logout } from "@/firebase/services/AuthService";
import { createNewChat } from "@/firebase/services/ChatService";
import { useAuth } from "@/hooks/useAuth";
import { useData } from "@/hooks/useData";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
  Search,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Branch } from "../../types";

interface BranchExplorerProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeBranch: string;
  setActiveBranch: (branchId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredBranches: BranchWithMessages[];
  branchesData: Record<string, BranchWithMessages>;
}

interface BranchWithMessages extends Branch {
  color: string;
  messages: { id: string; role: string; content: string; timestamp: string }[];
  children?: BranchWithMessages[];
}

export default function BranchExplorer({
  sidebarOpen,
  setSidebarOpen,
  activeBranch,
  setActiveBranch,
  searchQuery,
  setSearchQuery,
  filteredBranches,
  branchesData,
}: BranchExplorerProps) {
  const { currentUser } = useAuth();
  const {
    currentUserData,
    setCurrentUserData,
    allChats,
    makeChatActive,
    activeChatId,
    isChatsLoading,
  } = useData();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();



  const handleCreateNewChat = async () => {
    try {
      if (!currentUser) return;
      setIsCreating(true);
      // Create chat with default name - AI will rename it later
      const newChat = await createNewChat(currentUser.uid, "New Conversation");
      makeChatActive(newChat.id);
      // Don't close any modal since we're not using one
    } catch (error) {
      console.error("Failed to create new chat:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSeedSampleData = async () => {
    try {
      if (!currentUser) return;
      await addMockData(
        currentUser.uid,
        "1b84670a-856c-4a14-8c4e-6f2a2bb5f426"
      );
    } catch (error) {
      console.error("Seeding sample data failed:", error);
    }
  };

  return (
    <>
      {/* Collapsed Sidebar Toggle Button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-4 z-50 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Main Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } absolute left-0 top-0 w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 h-full z-40`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Branch Explorer</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              title="Collapse sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search branches..."
              className="w-full py-2 pl-10 pr-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isChatsLoading ? (
            <div className="space-y-1" aria-busy="true" aria-live="polite">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur animate-pulse"
                >
                  <div className="flex items-center">
                    <div className="w-1 h-6 rounded-full mr-2 bg-gray-200 dark:bg-gray-800" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-800" />
                        <div className="ml-2 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-800" />
                      </div>
                      <div className="mt-1 h-2 w-32 rounded bg-gray-200 dark:bg-gray-800" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : allChats && allChats.length > 0 ? (
            allChats.map((chat) => {
              const messages = Array.isArray(chat.messages)
                ? chat.messages
                : [];
              const count = messages.length;
              const lastMsg = count > 0 ? messages[count - 1] : undefined;

              const preview =
                lastMsg && typeof lastMsg.content === "string"
                  ? `${lastMsg.content.slice(0, 50)}${
                      lastMsg.content.length > 50 ? "…" : ""
                    }`
                  : "";

              return (
                <button
                  key={chat.id}
                  onClick={() => makeChatActive(chat.id)}
                  className={`w-full text-left p-2 rounded-lg transition-all duration-200 group
            ${
              activeChatId === chat.id
                ? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
                >
                  <div className="flex items-center">
                    <div
                      className="w-1 h-6 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: chat.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                          {chat.name}
                        </h4>
                        {count > 0 && (
                          <div
                            className="ml-2 flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium flex-shrink-0"
                            style={{
                              backgroundColor: `${chat.color}20`,
                              color: chat.color,
                            }}
                            title={`${count} messages`}
                          >
                            {count}
                          </div>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                        {preview || "No messages yet"}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="px-2 py-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              No chats yet. Create one to get started.
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleCreateNewChat}
            disabled={isCreating}
            className="w-full py-2 px-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus size={14} className="mr-1.5" /> New Chat
              </>
            )}
          </button>
        </div>

        {/* Account Menu */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-800 relative">
          <button
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className="w-full py-1.5 px-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg flex items-center justify-between text-sm font-medium border border-gray-200 dark:border-gray-700 transition-colors duration-200"
          >
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                <User size={12} className="text-blue-500" />
              </div>
              <span className="ml-2">Account</span>
            </div>
            <ChevronDown
              size={12}
              className={`transform transition-transform duration-200 ${
                isAccountMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Account Dropdown Menu */}
          {isAccountMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <User size={20} className="text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {currentUser?.displayName || "User"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentUser?.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-2 space-y-1">
                <button
                  onClick={handleSeedSampleData}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
                >
                  Seed sample data
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


    </>
  );
}
