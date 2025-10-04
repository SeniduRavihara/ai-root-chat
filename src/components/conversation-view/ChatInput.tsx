import { BranchWithMessages } from "@/types";
import { GitBranch, Plus, Send } from "lucide-react";

type ChatInputProps = {
  message: string;
  setMessage: (msg: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  branchesData: Record<string, BranchWithMessages>;
  activeBranch: string;
};

const ChatInput: React.FC<ChatInputProps> = ({
  message,
  setMessage,
  handleSubmit,
  branchesData,
  activeBranch,
}) => {
  const branch = branchesData[activeBranch];

  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1.5"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow bg-transparent outline-none px-2 py-1.5 text-sm"
        />
        <div className="flex items-center">
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <Plus size={16} />
          </button>
          <button
            type="submit"
            disabled={!message.trim()}
            className={`ml-1.5 px-3 py-1.5 text-sm ${
              message.trim()
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            } rounded-lg flex items-center transition-colors`}
          >
            <Send size={14} className="mr-1" /> Send
          </button>
        </div>
      </form>

      {/* Branch info pill */}
      <div className="flex justify-center mt-2">
        {branch && (
          <div
            className="flex items-center px-2 py-0.5 rounded-full text-xs"
            style={{
              backgroundColor: `${branch.color}15`,
              color: branch.color,
            }}
          >
            <GitBranch size={10} className="mr-1" />
            Currently in {branch.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
