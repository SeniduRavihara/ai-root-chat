"use client";

import { useState, useEffect } from "react";
import { Settings, Eye, EyeOff, Save, X } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem("gemini_api_key");
      if (stored) {
        setApiKey(stored);
      }
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("gemini_api_key", apiKey.trim());
      // Close modal after short delay
      setTimeout(() => {
        onClose();
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error("Failed to save API key:", error);
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setApiKey("");
    localStorage.removeItem("gemini_api_key");
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 4) + "*".repeat(key.length - 8) + key.substring(key.length - 4);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              API Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gemini API Key
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            {apiKey && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Current key: {maskApiKey(apiKey)}
              </p>
            )}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
            <p className="font-medium mb-1">Security Note:</p>
            <p>
              Your API key is stored locally in your browser and sent securely to our servers.
              If you don&apos;t provide a key, the app will use a shared key with usage limits.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save"}</span>
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
