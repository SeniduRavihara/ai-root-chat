"use client";

import { useEffect, useRef, useState } from "react";

interface CodeBlockProps {
  children: string;
  language?: string;
}

export default function CodeBlock({
  children,
  language = "javascript",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Dynamically load Prism and highlight
    if (typeof window !== "undefined" && codeRef.current) {
      import("prismjs").then((Prism) => {
        // Load language component if needed
        const loadLanguage = async (lang: string) => {
          try {
            switch (lang) {
              case "javascript":
              case "js":
                await import("prismjs/components/prism-javascript");
                break;
              case "typescript":
              case "ts":
                await import("prismjs/components/prism-typescript");
                break;
              case "jsx":
                await import("prismjs/components/prism-jsx");
                break;
              case "tsx":
                await import("prismjs/components/prism-tsx");
                break;
              case "python":
              case "py":
                await import("prismjs/components/prism-python");
                break;
              case "java":
                await import("prismjs/components/prism-java");
                break;
              case "cpp":
              case "c++":
                await import("prismjs/components/prism-cpp");
                break;
              case "csharp":
              case "cs":
                await import("prismjs/components/prism-csharp");
                break;
              case "go":
                await import("prismjs/components/prism-go");
                break;
              case "rust":
                await import("prismjs/components/prism-rust");
                break;
              case "php":
                await import("prismjs/components/prism-php");
                break;
              case "ruby":
              case "rb":
                await import("prismjs/components/prism-ruby");
                break;
              case "sql":
                await import("prismjs/components/prism-sql");
                break;
              case "bash":
              case "sh":
                await import("prismjs/components/prism-bash");
                break;
              case "json":
                await import("prismjs/components/prism-json");
                break;
              case "yaml":
              case "yml":
                await import("prismjs/components/prism-yaml");
                break;
              case "markdown":
              case "md":
                await import("prismjs/components/prism-markdown");
                break;
              case "css":
                await import("prismjs/components/prism-css");
                break;
              case "html":
              case "markup":
                await import("prismjs/components/prism-markup");
                break;
            }
          } catch (err) {
            console.log(`Language ${lang} not available`);
          }
        };

        loadLanguage(language).then(() => {
          if (codeRef.current) {
            Prism.default.highlightElement(codeRef.current);
          }
        });
      });
    }
  }, [children, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative my-4 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm border-b border-gray-200 dark:border-gray-700">
        <span className="font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200"
        >
          {copied ? (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="!my-0 !bg-gray-50 dark:!bg-gray-900 overflow-x-auto p-4">
        <code ref={codeRef} className={`language-${language}`}>
          {children}
        </code>
      </pre>
    </div>
  );
}
