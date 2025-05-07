"use client";

// components/BranchSelector.tsx
interface BranchSelectorProps {
  branches: any[];
  activeBranchId: string;
  onSelectBranch: (id: string) => void;
}

export default function BranchSelector({
  branches,
  activeBranchId,
  onSelectBranch,
}: BranchSelectorProps) {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto">
      {branches.map((branch) => (
        <button
          key={branch.id}
          onClick={() => onSelectBranch(branch.id)}
          className={`px-3 py-1 rounded-full text-sm ${
            branch.id === activeBranchId
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          {branch.name}
        </button>
      ))}
    </div>
  );
}