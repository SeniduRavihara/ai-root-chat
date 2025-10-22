import { GitBranch } from "lucide-react";
import { BranchWithMessages } from "../../types";

interface BranchTransitionIndicatorProps {
  branch: BranchWithMessages;
}

export default function BranchTransitionIndicator({
  branch,
}: BranchTransitionIndicatorProps) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="w-full max-w-xs flex items-center">
        <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
        <div
          className="px-4 py-1 text-xs rounded-full flex items-center mx-2"
          style={{
            backgroundColor: `${branch.color}20`,
            color: branch.color,
          }}
        >
          <GitBranch size={12} className="mr-1" />
          {branch.name} branch begins
        </div>
        <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
      </div>
    </div>
  );
}
