import { Bot } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="max-w-3/4 rounded-2xl p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md">
        <div className="flex items-center mb-2">
          <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 mr-2">
            <Bot size={16} className="text-gray-700 dark:text-gray-300" />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Assistant • typing...
          </span>
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
export default TypingIndicator