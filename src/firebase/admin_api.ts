import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase_config";

export async function createBranchFromMessage(
  chatId: string,
  messageId: string,
  branchName: string
) {
  const branchesRef = collection(
    db,
    "chats",
    chatId,
    "messages",
    messageId,
    "branches"
  );

  const newBranch = {
    name: branchName,
    chatId,
    originMessageId: messageId,
    createdAt: Timestamp.now(),
  };

  const branchDoc = await addDoc(branchesRef, newBranch);
  return branchDoc.id; // returns branchId
}

// -----------------------------------------------------------

export async function sendMessageToBranch(
  chatId: string,
  messageId: string,
  branchId: string,
  role: "user" | "model",
  content: string
) {
  const branchMessagesRef = collection(
    db,
    "chats",
    chatId,
    "messages",
    messageId,
    "branches",
    branchId,
    "messages"
  );

  const message = {
    role,
    content,
    timestamp: Timestamp.now(),
  };

  await addDoc(branchMessagesRef, message);
}

// -----------------------------------------------------------

async function loadBranchMessages(
  chatId: string,
  messageId: string,
  branchId: string
) {
  const branchMessagesRef = collection(
    db,
    "chats",
    chatId,
    "messages",
    messageId,
    "branches",
    branchId,
    "messages"
  );

  const snapshot = await getDocs(branchMessagesRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// -----------------------------------------------------------

export async function getFullContextForBranch(
  chatId: string,
  messageId: string,
  branchId: string
) {
  // 1. Get original message
  const originalMessageSnap = await getDoc(
    doc(db, "chats", chatId, "messages", messageId)
  );
  const originalMessage = originalMessageSnap.data();

  // 2. Get all messages before this one (in main chat)
  const beforeMessagesSnap = await getDocs(
    query(
      collection(db, "chats", chatId, "messages"),
      where("timestamp", "<", originalMessage?.timestamp)
    )
  );
  const beforeMessages = beforeMessagesSnap.docs.map((d) => d.data());

  // 3. Get all branch messages
  const branchMessages = await loadBranchMessages(chatId, messageId, branchId);

  // Combine all
  return [...beforeMessages, originalMessage, ...branchMessages];
}

// -----------------------------------------------------------
