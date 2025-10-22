import { BranchWithMessages, Message } from "../../types";

interface UserMessageProps {
  message: Message;
  messageBranch?: BranchWithMessages;
  isFromCurrentBranch: boolean;
}

export default function UserMessage({
  message,
  messageBranch,
  isFromCurrentBranch,
}: UserMessageProps) {
  return (
    <div className="flex justify-end mb-6" data-message-id={message.id}>
      <div className="max-w-[85%] rounded-2xl bg-blue-500 text-white shadow-lg">
        <div className="p-4">
          <p className="text-sm leading-relaxed">{message.content}</p>
          {!isFromCurrentBranch && messageBranch && (
            <span
              className="ml-2 text-xs px-1.5 py-0.5 rounded-full text-gray-600 dark:text-gray-300"
              style={{
                backgroundColor: `${messageBranch.color}20`,
                color: messageBranch.color,
              }}
            >
              {messageBranch.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
