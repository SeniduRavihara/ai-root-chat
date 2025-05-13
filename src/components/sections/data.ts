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
      },
      {
        id: "msg2",
        role: "assistant",
        content:
          "That depends on your risk tolerance and investment goals. Could you tell me more about your situation?",
        timestamp: "2025-05-08T10:01:00Z",
      },
      {
        id: "msg3",
        role: "user",
        content: "I'm moderate risk and looking for long-term growth.",
        timestamp: "2025-05-08T10:02:00Z",
      },
      {
        id: "msg4",
        role: "assistant",
        content:
          "For moderate risk with long-term growth, consider a portfolio with 60% broad market ETFs, 20% bonds, and 20% in select growth stocks.",
        timestamp: "2025-05-08T10:03:00Z",
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
      },
      {
        id: "msg6",
        role: "assistant",
        content:
          "For high-risk investors, consider 70% growth stocks, 20% emerging markets, and 10% speculative investments like crypto or startups.",
        timestamp: "2025-05-08T10:05:00Z",
      },
      {
        id: "msg7",
        role: "user",
        content: "Tell me more about crypto investing.",
        timestamp: "2025-05-08T10:06:00Z",
      },
      {
        id: "msg8",
        role: "assistant",
        content:
          "Crypto investing is highly volatile but potentially lucrative. Focus on established projects like Bitcoin and Ethereum as your core holdings (70%), then allocate 20% to mid-caps and 10% to promising new projects.",
        timestamp: "2025-05-08T10:07:00Z",
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
      },
      {
        id: "msg10",
        role: "assistant",
        content:
          "For conservative investors, I recommend 40% bonds, 40% blue-chip dividend stocks, 15% broad market ETFs, and 5% cash reserves.",
        timestamp: "2025-05-08T10:09:00Z",
      },
    ],
  },
  "crypto-focus": {
    id: "crypto-focus",
    name: "Crypto Deep Dive",
    parentId: "high-risk",
    parentMessageId: "msg8",
    color: "#f59e0b", // amber
    messages: [
      {
        id: "msg11",
        role: "user",
        content: "Can you recommend specific crypto projects to research?",
        timestamp: "2025-05-08T10:10:00Z",
      },
      {
        id: "msg12",
        role: "assistant",
        content:
          "Beyond Bitcoin and Ethereum, consider researching Solana for speed, Polygon for scaling, Chainlink for oracles, and Polkadot for interoperability. Each serves different purposes in the ecosystem.",
        timestamp: "2025-05-08T10:11:00Z",
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
      },
      {
        id: "msg14",
        role: "assistant",
        content:
          "Real estate makes an excellent addition to a moderate risk portfolio. Consider REITs for liquidity, rental properties for income, or crowdfunding platforms for lower capital requirements.",
        timestamp: "2025-05-08T10:13:00Z",
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
      },
      {
        id: "msg16",
        role: "assistant",
        content:
          "REITs are securities that invest in real estate and distribute 90% of taxable income to shareholders. Look for residential, commercial, healthcare, and data center REITs with strong dividend histories and manageable debt levels.",
        timestamp: "2025-05-08T10:15:00Z",
      },
    ],
  },

  // NEW BRANCHES BELOW

  "crypto-risk-management": {
    id: "crypto-risk-management",
    name: "Crypto Risk Management",
    parentId: "crypto-focus",
    parentMessageId: "msg12",
    color: "#eab308", // yellow
    messages: [
      {
        id: "msg17",
        role: "user",
        content: "How do I manage risk when investing in crypto?",
        timestamp: "2025-05-08T10:16:00Z",
      },
      {
        id: "msg18",
        role: "assistant",
        content:
          "Use position sizing, diversification, stop-loss orders, and avoid overexposure to volatile assets. Also, regularly rebalance and stay informed on regulatory changes.",
        timestamp: "2025-05-08T10:17:00Z",
      },
    ],
  },
  "emerging-markets": {
    id: "emerging-markets",
    name: "Emerging Markets Breakdown",
    parentId: "high-risk",
    parentMessageId: "msg6",
    color: "#0ea5e9", // sky blue
    messages: [
      {
        id: "msg19",
        role: "user",
        content: "What should I know about investing in emerging markets?",
        timestamp: "2025-05-08T10:18:00Z",
      },
      {
        id: "msg20",
        role: "assistant",
        content:
          "Emerging markets offer growth potential but come with political and currency risks. Focus on diversified ETFs across Asia, Latin America, and Eastern Europe, and monitor macroeconomic conditions.",
        timestamp: "2025-05-08T10:19:00Z",
      },
    ],
  },
  "bond-strategies": {
    id: "bond-strategies",
    name: "Bond Investment Strategies",
    parentId: "low-risk",
    parentMessageId: "msg10",
    color: "#60a5fa", // blue
    messages: [
      {
        id: "msg21",
        role: "user",
        content: "Can you break down bond investing further?",
        timestamp: "2025-05-08T10:20:00Z",
      },
      {
        id: "msg22",
        role: "assistant",
        content:
          "Sure. Consider a laddered bond portfolio, mix of government and corporate bonds, and varying durations. This provides predictable income and lowers interest rate risk.",
        timestamp: "2025-05-08T10:21:00Z",
      },
    ],
  },
  "rental-vs-reit": {
    id: "rental-vs-reit",
    name: "Rental vs. REIT Comparison",
    parentId: "real-estate",
    parentMessageId: "msg14",
    color: "#f472b6", // rose
    messages: [
      {
        id: "msg23",
        role: "user",
        content: "How do rentals compare to REITs in terms of returns?",
        timestamp: "2025-05-08T10:22:00Z",
      },
      {
        id: "msg24",
        role: "assistant",
        content:
          "Rentals can offer higher returns and tax advantages but require active management. REITs provide liquidity, diversification, and ease of access, though with lower control and often lower yield.",
        timestamp: "2025-05-08T10:23:00Z",
      },
    ],
  },
  "dividend-stocks": {
    id: "dividend-stocks",
    name: "Dividend Stock Picks",
    parentId: "low-risk",
    parentMessageId: "msg10",
    color: "#4ade80", // green
    messages: [
      {
        id: "msg25",
        role: "user",
        content: "Which dividend-paying stocks are worth considering?",
        timestamp: "2025-05-08T10:24:00Z",
      },
      {
        id: "msg26",
        role: "assistant",
        content:
          "Look at established companies with a strong dividend history like Johnson & Johnson, Procter & Gamble, Coca-Cola, and utilities like Duke Energy. Prioritize stability and payout consistency.",
        timestamp: "2025-05-08T10:25:00Z",
      },
    ],
  },
};
