import { logout } from "@/firebase/api";
import { useAuth } from "@/hooks/useAuth";
import {
  ChevronDown,
  ChevronRight,
  GitBranch,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  User,
  X,
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
  mockBranchesData: Record<string, BranchWithMessages>;
  treeViewHeight: number;
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
  mockBranchesData,
  treeViewHeight,
}: BranchExplorerProps) {
  const { currentUser } = useAuth();
  // State to track which branches are expanded in the tree view
  const [expandedBranches, setExpandedBranches] = useState<
    Record<string, boolean>
  >({});
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const router = useRouter();

  // Function to toggle branch expansion
  const toggleBranchExpansion = (branchId: string) => {
    setExpandedBranches((prev) => ({
      ...prev,
      [branchId]: !prev[branchId],
    }));
  };

  // Function to organize branches into a tree structure
  const buildBranchTree = () => {
    const tree: Record<string, BranchWithMessages> = {};
    const branchesWithChildren: Record<string, BranchWithMessages> = {};

    // Initialize all branches with empty children array
    filteredBranches.forEach((branch) => {
      branchesWithChildren[branch.id] = {
        ...branch,
        children: [],
      };
    });

    // Populate children arrays
    filteredBranches.forEach((branch) => {
      if (branch.parentId && branchesWithChildren[branch.parentId]) {
        branchesWithChildren[branch.parentId].children!.push(
          branchesWithChildren[branch.id]
        );
      }
    });

    // Get root level branches (those without parents or with non-existent parents)
    filteredBranches.forEach((branch) => {
      if (!branch.parentId || !branchesWithChildren[branch.parentId]) {
        tree[branch.id] = branchesWithChildren[branch.id];
      }
    });

    return { tree, branchesWithChildren };
  };

  const { tree: branchTree } = buildBranchTree();

  // Recursive function to render branch nodes with their children
  const renderBranchNode = (branch: BranchWithMessages) => {
    if (!branch) return null;
    const isActive = branch.id === activeBranch;
    const isExpanded = expandedBranches[branch.id];

    return (
      <div key={branch.id} className="mt-1">
        <div
          className={`flex items-center p-2 rounded-lg cursor-pointer ${
            isActive
              ? "bg-blue-50 dark:bg-blue-900/20"
              : "hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          {branch.children && branch.children.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBranchExpansion(branch.id);
              }}
              className="mr-1 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          )}
          <div
            className={`flex items-center flex-grow py-2 px-3 rounded-xl cursor-pointer transition-all ${
              isActive
                ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                : "hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent"
            }`}
            onClick={() => setActiveBranch(branch.id)}
          >
            <div
              className="w-1.5 h-12 rounded-full mr-3"
              style={{ backgroundColor: branch.color }}
            ></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{branch.name}</h4>
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${branch.color}20`,
                    color: branch.color,
                  }}
                >
                  {branch.messages.length}
                </div>
              </div>
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <MessageSquare size={12} className="mr-1" />
                <span>{branch.messages.length} messages</span>
                {branch.parentId && (
                  <span className="ml-3 flex items-center">
                    <GitBranch size={12} className="mr-1" />
                    from {mockBranchesData[branch.parentId]?.name || "Parent"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {isExpanded && branch.children && branch.children.length > 0 && (
          <div className="border-l-2 border-dashed border-gray-300 dark:border-gray-700 pl-4 ml-4">
            {branch.children.map((child) => renderBranchNode(child))}
          </div>
        )}
      </div>
    );
  };

  const createNewChat = async () => {
    
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div
      className={`${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 w-full lg:w-1/4 max-w-sm border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto flex flex-col transition-all duration-300 absolute lg:relative z-10 h-[calc(100%-${treeViewHeight}px-64px)] lg:h-auto`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Branch Explorer</h3>
        <button
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search branches..."
            className="w-full py-2 pl-10 pr-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Branches List with Tree Structure */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {Object.values(branchTree).map((branch) => renderBranchNode(branch))}
      </div>

      {/* Actions Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={createNewChat}
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
            <div className="p-2">
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
  );
}
