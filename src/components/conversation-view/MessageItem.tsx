import { getMessageBranchId } from "../../services/branchTreeService";
import { BranchWithMessages, Message } from "../../types";
import { getBranchesArray } from "../../utils/branchHelpers";
import AssistantMessage from "./AssistantMessage";
import BranchTransitionIndicator from "./BranchTransitionIndicator";
import ForkPointIndicator from "./ForkPointIndicator";
import UserMessage from "./UserMessage";

interface MessageItemProps {
  message: Message;
  index: number;
  allMessages: Message[];
  branchesData: Record<string, BranchWithMessages>;
  isFromCurrentBranch: boolean;
  messageBranch?: BranchWithMessages;
  streamingContent: string;
  onCreateBranch: (branchId: string, messageId: string) => void;
}

export default function MessageItem({
  message,
  index,
  allMessages,
  branchesData,
  isFromCurrentBranch,
  messageBranch,
  streamingContent,
  onCreateBranch,
}: MessageItemProps) {
  // Check if there's a branch transition
  const showBranchTransition =
    index > 0 &&
    (() => {
      const prevMessageBranchId = getMessageBranchId(
        allMessages[index - 1].id,
        branchesData
      );
      const currentMessageBranchId = getMessageBranchId(
        message.id,
        branchesData
      );

      return (
        prevMessageBranchId &&
        currentMessageBranchId &&
        prevMessageBranchId !== currentMessageBranchId
      );
    })();

  const currentMessageBranchId = getMessageBranchId(message.id, branchesData);
  const currentBranch = currentMessageBranchId
    ? branchesData[currentMessageBranchId]
    : undefined;

  // Check if this message is a fork point
  const forkingBranches = getBranchesArray(branchesData).filter(
    (branch) => branch.parentMessageId === message.id
  );
  const hasBranches = forkingBranches.length > 0;
  const isLastMessage = index === allMessages.length - 1;

  return (
    <div key={message.id}>
      {/* Branch transition indicator */}
      {showBranchTransition && currentBranch && (
        <BranchTransitionIndicator branch={currentBranch} />
      )}

      {/* Message content */}
      {message.role === "user" ? (
        <UserMessage
          message={message}
          messageBranch={messageBranch}
          isFromCurrentBranch={isFromCurrentBranch}
        />
      ) : (
        <AssistantMessage
          message={message}
          messageBranch={messageBranch}
          isFromCurrentBranch={isFromCurrentBranch}
          isLastMessage={isLastMessage}
          streamingContent={streamingContent}
          onCreateBranch={() =>
            onCreateBranch(
              getMessageBranchId(message.id, branchesData)!,
              message.id
            )
          }
        />
      )}

      {/* Fork point indicator */}
      {hasBranches && message.role === "assistant" && (
        <ForkPointIndicator branches={forkingBranches} />
      )}
    </div>
  );
}
