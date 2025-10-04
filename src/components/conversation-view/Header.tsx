import { BranchWithMessages } from "@/types";
import { GitBranch, GitFork, MoreHorizontal } from "lucide-react";
import React from "react";

type HeaderProps = {
  branchesData: Record<string, BranchWithMessages>;
  activeBranch: string;
};

const Header: React.FC<HeaderProps> = ({ branchesData, activeBranch }) => {
  const branch = branchesData[activeBranch];
  if (!branch) {
    // Optionally, render a fallback UI or nothing
    return (
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Branch not found
        </div>
      </div>
    );
  }
  const parentBranch = branch.parentId
    ? branchesData[branch.parentId]
    : undefined;
  return (
    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            className="w-6 h-6 rounded-full mr-2 flex items-center justify-center"
            style={{
              backgroundColor: `${branch.color}20`,
            }}
          >
            <GitBranch size={12} style={{ color: branch.color }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {branch.name}
            </h2>
            {branch.parentId && parentBranch && (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
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

        <div className="flex items-center space-x-1">
          <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
            <GitFork size={14} />
          </button>
          <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
