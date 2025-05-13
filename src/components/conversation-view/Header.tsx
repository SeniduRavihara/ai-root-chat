import { BranchWithMessages } from "@/types";
import { GitBranch, GitFork, MoreHorizontal } from "lucide-react";
import React from "react";



type HeaderProps = {
  mockBranchesData: Record<string, BranchWithMessages>;
  activeBranch: string;
};

const Header: React.FC<HeaderProps> = ({ mockBranchesData, activeBranch }) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            className="w-8 h-8 rounded-full mr-3 flex items-center justify-center"
            style={{
              backgroundColor: `${mockBranchesData[activeBranch].color}20`,
            }}
          >
            <GitBranch
              size={16}
              style={{ color: mockBranchesData[activeBranch].color }}
            />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {mockBranchesData[activeBranch].name}
            </h2>
            {mockBranchesData[activeBranch].parentId && (
              <div className="text-sm text-gray-500 flex items-center">
                <span>Forked from</span>
                <span
                  className="ml-1 font-medium"
                  style={{
                    color:
                      mockBranchesData[mockBranchesData[activeBranch].parentId!]
                        .color,
                  }}
                >
                  {
                    mockBranchesData[mockBranchesData[activeBranch].parentId!]
                      .name
                  }
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
