import { BranchWithMessages } from "@/types";
import { GitBranch, GitFork, MoreHorizontal } from "lucide-react";
import React from "react";

type HeaderProps = {
  mockBranchesData: Record<string, BranchWithMessages>;
  activeBranch: string;
};

const Header: React.FC<HeaderProps> = ({ mockBranchesData, activeBranch }) => {
  const branch = mockBranchesData[activeBranch];
  if (!branch) {
    // Optionally, render a fallback UI or nothing
    return (
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="text-gray-500">Branch not found</div>
      </div>
    );
  }
  const parentBranch = branch.parentId
    ? mockBranchesData[branch.parentId]
    : undefined;
  return (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            className="w-8 h-8 rounded-full mr-3 flex items-center justify-center"
            style={{
              backgroundColor: `${branch.color}20`,
            }}
          >
            <GitBranch size={16} style={{ color: branch.color }} />
          </div>
          <div>
            <h2 className="text-lg font-bold">{branch.name}</h2>
            {branch.parentId && parentBranch && (
              <div className="text-sm text-gray-500 flex items-center">
                <span>Forked from</span>
                <span
                  className="ml-1 font-medium"
                  style={{
                    color: parentBranch.color,
                  }}
                >
                  {parentBranch.name}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
            <GitFork size={18} />
          </button>
          <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
