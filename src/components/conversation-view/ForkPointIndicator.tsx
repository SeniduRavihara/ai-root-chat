import { GitBranch } from "lucide-react";
import { BranchWithMessages } from "../../types";

interface ForkPointIndicatorProps {
  branches: BranchWithMessages[];
}

export default function ForkPointIndicator({
  branches,
}: ForkPointIndicatorProps) {
  return (
    <div className="flex justify-start pl-8 mt-1 mb-2">
      <div className="flex items-center space-x-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <GitBranch size={10} className="mr-1" />
          {branches.length === 1
            ? "1 branch"
            : `${branches.length} branches`}{" "}
          fork from here
        </div>
        <div className="flex space-x-1">
          {branches.slice(0, 3).map((branch) => (
            <div
              key={branch.id}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: branch.color }}
              title={branch.name}
            ></div>
          ))}
          {branches.length > 3 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              +{branches.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
