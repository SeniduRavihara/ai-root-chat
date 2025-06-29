import { BranchWithMessages } from "@/types";

export const mockBranchesData: Record<string, BranchWithMessages> = {
  main: {
    id: "main",
    name: "Main Branch",
    parentId: null,
    parentMessageId: null,
    color: "#6366f1", // indigo
    messages: [
      {
        id: "msg1",
        role: "user",
        content: "What should I invest in?",
        timestamp: "2025-05-08T10:00:00Z",
        threadId: "thread-main",
        branchId: "main",
      },
      {
        id: "msg2",
        role: "assistant",
        content:
          "That depends on your risk tolerance and investment goals. Could you tell me more about your situation?",
        timestamp: "2025-05-08T10:01:00Z",
        threadId: "thread-main",
        branchId: "main",
      },
      {
        id: "msg3",
        role: "user",
        content: "I'm moderate risk and looking for long-term growth.",
        timestamp: "2025-05-08T10:02:00Z",
        threadId: "thread-main",
        branchId: "main",
      },
      {
        id: "msg4",
        role: "assistant",
        content:
          "For moderate risk with long-term growth, consider a portfolio with 60% broad market ETFs, 20% bonds, and 20% in select growth stocks.",
        timestamp: "2025-05-08T10:03:00Z",
        threadId: "thread-main",
        branchId: "main",
      },
    ],
  },
  "high-risk": {
    id: "high-risk",
    name: "High Risk Strategy",
    parentId: "main",
    parentMessageId: "msg2",
    color: "#ec4899", // pink
    messages: [
      {
        id: "msg5",
        role: "user",
        content: "Actually, I can tolerate high risk for better returns.",
        timestamp: "2025-05-08T10:04:00Z",
        threadId: "thread-high-risk",
        branchId: "high-risk",
      },
      {
        id: "msg6",
        role: "assistant",
        content:
          "For high-risk investors, consider 70% growth stocks, 20% emerging markets, and 10% speculative investments like crypto or startups.",
        timestamp: "2025-05-08T10:05:00Z",
        threadId: "thread-high-risk",
        branchId: "high-risk",
      },
      {
        id: "msg7",
        role: "user",
        content: "Tell me more about crypto investing.",
        timestamp: "2025-05-08T10:06:00Z",
        threadId: "thread-high-risk",
        branchId: "high-risk",
      },
      {
        id: "msg8",
        role: "assistant",
        content:
          "Crypto investing is highly volatile but potentially lucrative. Focus on established projects like Bitcoin and Ethereum as your core holdings (70%), then allocate 20% to mid-caps and 10% to promising new projects.",
        timestamp: "2025-05-08T10:07:00Z",
        threadId: "thread-high-risk",
        branchId: "high-risk",
      },
    ],
  },
  "low-risk": {
    id: "low-risk",
    name: "Conservative Approach",
    parentId: "main",
    parentMessageId: "msg2",
    color: "#10b981", // emerald
    messages: [
      {
        id: "msg9",
        role: "user",
        content: "What if I prefer lower risk instead?",
        timestamp: "2025-05-08T10:08:00Z",
        threadId: "thread-low-risk",
        branchId: "low-risk",
      },
      {
        id: "msg10",
        role: "assistant",
        content:
          "For conservative investors, I recommend 40% bonds, 40% blue-chip dividend stocks, 15% broad market ETFs, and 5% cash reserves.",
        timestamp: "2025-05-08T10:09:00Z",
        threadId: "thread-low-risk",
        branchId: "low-risk",
      },
    ],
  },
  "crypto-focus": {
    id: "crypto-focus",
    name: "Crypto Deep Dive",
    parentId: "reits-focus2",
    parentMessageId: "msg15",
    color: "#f59e0b", // amber
    messages: [
      {
        id: "msg11",
        role: "user",
        content: "Can you recommend specific crypto projects to research?",
        timestamp: "2025-05-08T10:10:00Z",
        threadId: "thread-crypto-focus",
        branchId: "crypto-focus",
      },
      {
        id: "msg12",
        role: "assistant",
        content:
          "Beyond Bitcoin and Ethereum, consider researching Solana for speed, Polygon for scaling, Chainlink for oracles, and Polkadot for interoperability. Each serves different purposes in the ecosystem.",
        timestamp: "2025-05-08T10:11:00Z",
        threadId: "thread-crypto-focus",
        branchId: "crypto-focus",
      },
    ],
  },

  "real-estate": {
    id: "real-estate",
    name: "Real Estate Option",
    parentId: "main",
    parentMessageId: "msg4",
    color: "#8b5cf6", // violet
    messages: [
      {
        id: "msg13",
        role: "user",
        content: "What about including real estate in my portfolio?",
        timestamp: "2025-05-08T10:12:00Z",
        threadId: "thread-real-estate",
        branchId: "real-estate",
      },
      {
        id: "msg14",
        role: "assistant",
        content:
          "Real estate makes an excellent addition to a moderate risk portfolio. Consider REITs for liquidity, rental properties for income, or crowdfunding platforms for lower capital requirements.",
        timestamp: "2025-05-08T10:13:00Z",
        threadId: "thread-real-estate",
        branchId: "real-estate",
      },
    ],
  },
  "reits-focus": {
    id: "reits-focus",
    name: "REITs Analysis",
    parentId: "real-estate",
    parentMessageId: "msg14",
    color: "#14b8a6", // teal
    messages: [
      {
        id: "msg15",
        role: "user",
        content: "Tell me more about REITs specifically.",
        timestamp: "2025-05-08T10:14:00Z",
        threadId: "thread-reits-focus",
        branchId: "reits-focus",
      },
      {
        id: "msg16",
        role: "assistant",
        content:
          "REITs are securities that invest in real estate and distribute 90% of taxable income to shareholders. Look for residential, commercial, healthcare, and data center REITs with strong dividend histories and manageable debt levels.",
        timestamp: "2025-05-08T10:15:00Z",
        threadId: "thread-reits-focus",
        branchId: "reits-focus",
      },
    ],
  },
  "reits-focus2": {
    id: "reits-focus2",
    name: "REITs Analysis2",
    parentId: "real-estate",
    parentMessageId: "msg14",
    color: "#14b8a6", // teal
    messages: [
      {
        id: "msg15",
        role: "user",
        content: "Tell me more about REITs specifically.",
        timestamp: "2025-05-08T10:14:00Z",
        threadId: "thread-reits-focus2",
        branchId: "reits-focus2",
      },
      {
        id: "msg16",
        role: "assistant",
        content:
          "REITs are securities that invest in real estate and distribute 90% of taxable income to shareholders. Look for residential, commercial, healthcare, and data center REITs with strong dividend histories and manageable debt levels.",
        timestamp: "2025-05-08T10:15:00Z",
        threadId: "thread-reits-focus2",
        branchId: "reits-focus2",
      },
    ],
  },
};
