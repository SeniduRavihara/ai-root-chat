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
  } = useData();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const openNewChatModal = () => {
    setNewChatName("");
    setIsNewChatModalOpen(true);
  };

  const closeNewChatModal = () => {
    if (isCreating) return;
    setIsNewChatModalOpen(false);
  };

  const handleCreateNewChat = async () => {
    try {
      if (!currentUser) return;
      setIsCreating(true);
      const name = newChatName.trim() || "New Chat";
      const newChat = await createNewChat(currentUser.uid, name);
      makeChatActive(newChat.id);
      setIsNewChatModalOpen(false);
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
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {allChats && allChats.length > 0 ? (
            allChats.map((chat) => {
              const messages = Array.isArray(chat.messages)
                ? chat.messages
                : [];
              const count = messages.length;
              const lastMsg = count > 0 ? messages[count - 1] : undefined;

              const preview =
                lastMsg && typeof lastMsg.content === "string"
                  ? `${lastMsg.content.slice(0, 80)}${
                      lastMsg.content.length > 80 ? "…" : ""
                    }`
                  : "";

              return (
                <button
                  key={chat.id}
                  onClick={() => makeChatActive(chat.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all
            ${
              activeChatId === chat.id
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-800"
            }`}
                >
                  <div className="flex items-center">
                    <div
                      className="w-1.5 h-10 rounded-full mr-3"
                      style={{ backgroundColor: chat.color }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium truncate">{chat.name}</h4>
                        <div
                          className="ml-3 flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: `${chat.color}20`,
                            color: chat.color,
                          }}
                          title={`${count} messages`}
                        >
                          {count}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {preview || "No messages yet"}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="px-3 py-6 text-sm text-gray-500 dark:text-gray-400">
              No chats yet. Create one to get started.
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={openNewChatModal}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center font-medium"
          >
            <Plus size={16} className="mr-2" /> New Chat
          </button>
        </div>

        {/* Account Menu */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 relative">
          <button
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className="w-full py-2 px-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg flex items-center justify-between font-medium border border-gray-200 dark:border-gray-700 transition-colors duration-200"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <User size={16} className="text-blue-500" />
              </div>
              <span className="ml-3">Account</span>
            </div>
            <ChevronDown
              size={16}
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

      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeNewChatModal}
          />
          <div className="relative w-full max-w-md mx-4 rounded-xl shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <h4 className="text-lg font-semibold">Create New Chat</h4>
            </div>
            <div className="px-5 py-4">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Chat name
              </label>
              <input
                type="text"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                placeholder="e.g., Market research, Math session"
                className="mt-2 w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCreating}
              />
            </div>
            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
              <button
                onClick={closeNewChatModal}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewChat}
                className={`px-4 py-2 rounded-lg text-white ${
                  isCreating ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"
                }`}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
