import { Bot, GitFork } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { formatMessageTime } from "../../services/messageService";
import { BranchWithMessages, Message } from "../../types";
import CodeBlock from "../ui/CodeBlock";
import StreamingMessage from "../ui/StreamingMessage";

interface AssistantMessageProps {
  message: Message;
  messageBranch?: BranchWithMessages;
  isFromCurrentBranch: boolean;
  isLastMessage: boolean;
  isTyping: boolean;
  streamingContent: string;
  onCreateBranch: () => void;
}

export default function AssistantMessage({
  message,
  messageBranch,
  isFromCurrentBranch,
  isLastMessage,
  isTyping,
  streamingContent,
  onCreateBranch,
}: AssistantMessageProps) {
  return (
    <div className="flex justify-start mb-6" data-message-id={message.id}>
      <div
        className={`w-full max-w-none ${
          !isFromCurrentBranch ? "border-l-4 shadow-sm" : ""
        }`}
        style={
          !isFromCurrentBranch && messageBranch
            ? {
                borderLeftColor: messageBranch.color,
              }
            : {}
        }
      >
        <div className="px-6 py-8">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Bot size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              {/* AI Message Content */}
              {isLastMessage && (isTyping || streamingContent) ? (
                <StreamingMessage
                  content={streamingContent || message.content}
                  isStreaming={isTyping}
                />
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      pre({ children }) {
                        // Pass through pre tag without any styling - CodeBlock handles its own styling
                        return <>{children}</>;
                      },
                      code({ className, children, ...props }) {
                        const isCodeBlock =
                          className && className.startsWith("language-");

                        if (isCodeBlock) {
                          const language =
                            className?.replace("language-", "") || "text";
                          const codeString = String(children).replace(
                            /\n$/,
                            ""
                          );
                          return (
                            <CodeBlock language={language}>
                              {codeString}
                            </CodeBlock>
                          );
                        }

                        return (
                          <code
                            className={`${className} rounded bg-gray-200 px-1.5 py-0.5 text-sm dark:bg-gray-700 text-gray-800 dark:text-gray-200`}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      table({ children }) {
                        return (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                              {children}
                            </table>
                          </div>
                        );
                      },
                      th({ children }) {
                        return (
                          <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-medium dark:border-gray-600 dark:bg-gray-700">
                            {children}
                          </th>
                        );
                      },
                      td({ children }) {
                        return (
                          <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                            {children}
                          </td>
                        );
                      },
                      blockquote({ children }) {
                        return (
                          <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 italic my-4 dark:bg-blue-900/20">
                            {children}
                          </blockquote>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}

              {/* Branch button and timestamp */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <button
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center transition-colors"
                    onClick={onCreateBranch}
                  >
                    <GitFork size={12} className="mr-1.5" /> Create Branch
                  </button>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatMessageTime(message.timestamp)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
