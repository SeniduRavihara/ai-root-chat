import { BranchWithMessages } from "@/types";
import { GitBranch, Plus, Send } from "lucide-react";

type ChatInputProps = {
  message: string;
  setMessage: (msg: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  mockBranchesData: Record<string, BranchWithMessages>;
  activeBranch: string;
};

const ChatInput: React.FC<ChatInputProps> = ({
  message,
  setMessage,
  handleSubmit,
  mockBranchesData,
  activeBranch,
}) => {
  const branch = mockBranchesData[activeBranch];

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow bg-transparent outline-none px-3 py-2"
        />
        <div className="flex items-center">
          <button
            type="button"
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <Plus size={20} />
          </button>
          <button
            type="submit"
            disabled={!message.trim()}
            className={`ml-2 px-4 py-2 ${
              message.trim()
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            } rounded-lg flex items-center`}
          >
            <Send size={16} className="mr-2" /> Send
          </button>
        </div>
      </form>

      {/* Branch info pill */}
      <div className="flex justify-center mt-3">
        {branch && (
          <div
            className="flex items-center px-3 py-1 rounded-full text-xs"
            style={{
              backgroundColor: `${branch.color}15`,
              color: branch.color,
            }}
          >
            <GitBranch size={12} className="mr-1" />
            Currently in {branch.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
