"use client";

// app/ChatApp.tsx
import { useEffect, useState } from "react";
import MessageItem from "./MessageItem";
import BranchSelector from "./BranchSelector";
import InputArea from "./InputArea";

import { Message, Branch } from "@/types";
import { addMessageToBranch, createBranch, getBranches, getMessages } from "@/firebase/services/branchService";

export default function ChatApp() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextBranchIndex, setNextBranchIndex] = useState<number>(1);

  const activeBranch = branches.find((b) => b.id === activeBranchId);

  // Load branches and set default
  useEffect(() => {
    const loadBranches = async () => {
      const loadedBranches = await getBranches();

      if (loadedBranches.length > 0) {
        setActiveBranchId(loadedBranches[0].id);
      } else {
        // Create master branch if none exists
        await createBranch("master", "Main", null, null);
        setBranches([{ id: "master", name: "Main", parentId: null, parentMessageId: null }]);
        setActiveBranchId("master");
      }

      setBranches(await getBranches());
    };

    loadBranches();
  }, []);

  // Load messages when branch changes
  useEffect(() => {
    if (!activeBranchId) return;

    const loadMessagesForBranch = async () => {
      const currentBranch = branches.find((b) => b.id === activeBranchId);
      let combined: Message[] = [];

      if (currentBranch?.parentId && currentBranch.parentMessageId) {
        // Child branch – load parent up to fork + own messages
        const parentBranch = branches.find((b) => b.id === currentBranch.parentId);
        if (!parentBranch) return;

        const parentMessages = await getMessages(parentBranch.id);
        const index = parentMessages.findIndex((m) => m.id === currentBranch.parentMessageId);
        const parentUpToFork = index >= 0 ? parentMessages.slice(0, index + 1) : [];

        const branchMessages = await getMessages(activeBranchId);
        combined = [...parentUpToFork, ...branchMessages];
      } else {
        // Master branch – just load its own messages
        combined = await getMessages(activeBranchId);
      }

      // Sort by timestamp
      combined.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      setMessages(combined);
    };

    loadMessagesForBranch();
  }, [activeBranchId, branches]);

  // Auto-scroll when new message arrives
  useEffect(() => {
    const container = document.getElementById("chat-container");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleCreateBranch = async (messageId: string) => {
    const newBranchId = `branch_${Date.now()}`;
    const newBranchName = `Branch ${nextBranchIndex}`;

    await createBranch(newBranchId, newBranchName, activeBranchId, messageId);

    const updatedBranches = await getBranches();
    setBranches(updatedBranches);
    setActiveBranchId(newBranchId);
    setNextBranchIndex(nextBranchIndex + 1);
  };

  const handleSendMessage = async (content: string) => {
    if (!activeBranchId) return;

    const userMessage = {
      role: "user" as const,
      content,
      timestamp: new Date(),
    };

    const aiMessage = {
      role: "assistant" as const,
      content: `You said: "${content}"`,
      timestamp: new Date(),
    };

    await addMessageToBranch(activeBranchId, userMessage);
    await addMessageToBranch(activeBranchId, aiMessage);

    const updated = await getMessages(activeBranchId);
    updated.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    setMessages(updated);
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">AI Chat</h1>

      <BranchSelector
        branches={branches}
        activeBranchId={activeBranchId}
        onSelectBranch={setActiveBranchId}
      />

      <div id="chat-container" className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} onCreateBranch={handleCreateBranch} />
          ))
        )}
      </div>

      <InputArea onSendMessage={handleSendMessage} />
    </div>
  );
}