"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface StreamingMessageProps {
  content: string;
  isStreaming?: boolean;
  onComplete?: () => void;
}

export default function StreamingMessage({ content, isStreaming = false, onComplete }: StreamingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isStreaming && content.length > displayedContent.length) {
      // Calculate how much new content we need to add
      const newContent = content.slice(displayedContent.length);
      const typingSpeed = 20; // milliseconds per character

      if (newContent.length > 0) {
        let charIndex = 0;
        const typeNextChar = () => {
          if (charIndex < newContent.length) {
            setDisplayedContent(prev => prev + newContent[charIndex]);
            charIndex++;
            setTimeout(typeNextChar, typingSpeed);
          } else {
            // Check if streaming is complete
            if (!isStreaming) {
              onComplete?.();
            }
          }
        };

        typeNextChar();
      }
    } else if (!isStreaming && content !== displayedContent) {
      // For non-streaming or completed streaming, show full content
      setDisplayedContent(content);
      onComplete?.();
    }
  }, [content, isStreaming, displayedContent, onComplete]);

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ className, children, ...props }) {
            const isCodeBlock = className && className.startsWith("language-");
            return isCodeBlock ? (
              <pre className="overflow-x-auto rounded-lg bg-gray-800 p-4 text-gray-100 my-4">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
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
        {displayedContent}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
      )}
    </div>
  );
}
