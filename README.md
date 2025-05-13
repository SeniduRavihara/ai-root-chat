# 🧠 Branching Chat App

A **multi-path AI chat interface** that supports branching from any message — allowing users to explore multiple paths of conversation and reasoning.

This app lets users:
- Send messages like a normal chat
- Create branches from any assistant message
- Maintain isolated context per branch
- Switch between branches and see full inherited history
- Store everything in **Firebase Firestore**

Perfect for:
- Exploring different answers to the same question
- Creative writing
- Research & decision-making
- Visualizing AI reasoning as a tree

## 🔍 Overview

### 🧭 Core Idea

This isn’t just a chat log — it’s a **tree of thought-based interface**, inspired by Git version control.

Users can:
1. Start with one main path (`master` branch)
2. Click on any message and create a new branch
3. Continue exploring different outcomes
4. All while maintaining clean, independent message histories

The UI only stores messages in their respective branches — but reconstructs full context when switching branches.

## 📦 Features

| Feature | Description |
|--------|-------------|
| ✨ Branch Support | Create new branches from any assistant message |
| 🧬 Context Inheritance | Show parent messages up to branch point |
| 💬 Message History | Messages are stored in Firebase Firestore |
| 🔁 Non-linear Conversations | Explore multiple directions simultaneously |
| 🌲 Lightweight Branches | No duplication — just references |
| 🎯 Easy AI Integration | Feed full context into AI models |

## 🧱 Technology Stack

| Layer | Tech Used |
|------|-----------|
| Frontend | React + TypeScript + Next.js (optional) |
| Styling | Tailwind CSS |
| Backend | Firebase Firestore |
| State Management | React useState / useEffect |
| Deployment | Vercel, Netlify, or local dev server |

## 📁 File Structure

```
project-root/
│
├── app/
│   └── ChatApp.tsx                  # Main chat component
│
├── components/
│   ├── MessageItem.tsx               # Individual message display
│   ├── BranchSelector.tsx            # Switch between branches
│   └── InputArea.tsx                 # Input box + send button
│
├── services/
│   └── branchService.ts              # Firestore interaction logic
│
├── types.ts                          # Shared type definitions
├── lib/firebase.ts                   # Firebase SDK setup
│
└── .env.local                        # Firebase config
```

## 🛠️ Setup Instructions

### 1. Clone the Project

```bash
git clone https://github.com/yourusername/branching-chat.git 
cd branching-chat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

Go to [Firebase Console](https://console.firebase.google.com/ ) and:
- Create a new project
- Enable **Firestore Database**
- Go to **Project Settings → General** and add a web app

Add keys to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🧩 Branching Logic Explained

Each branch contains:
- Its own messages
- A reference to its parent branch and message

When displaying a branch:
- The app loads:
  - All messages from parent branch up to the fork
  - Then all messages from current branch
- These are merged and sorted chronologically

This mimics how Git shows commit history when switching branches.

## 📝 Example Use Case

User asks:
> "What should I invest in?"

AI replies:
> "Depends on your risk tolerance."

User creates a branch:
> "I'm moderate."

AI replies:
> "Consider ETFs and bonds."

User creates another branch from earlier message:
> "What if I'm aggressive?"

AI replies:
> "Try growth stocks or crypto."

## 🚀 Future Enhancements (Optional)

| Feature | Description |
|--------|-------------|
| Visual Tree UI | Show messages as a mind map or flowchart |
| Branch Merging | Combine two branches into one |
| Export Branch | Save/share as Markdown or JSON |
| AI Branching | Let AI auto-create branches for different reasoning paths |
| Multi-user Support | Collaborative branching with real-time updates |

## 💡 Want Help Customizing?

Would you like help:
1. Adding **branch comparison** features
2. Feeding this into an **AI model API**
3. Building a **visual tree view**
4. Deploying this app online

Let me know — and we’ll build it together! 💡🚀