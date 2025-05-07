// services/branchService.ts
import { Branch, Message } from "@/types";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase_config";

const userId = "demo_user"; // Replace with real auth later
export const chatId = "chat_1";

export async function getBranches() {
  const branchesRef = collection(db, "users", userId, "branches");
  const snapshot = await getDocs(branchesRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as any as Branch[];
}

export async function createBranch(
  branchId: string,
  name: string,
  parentId: string | null,
  parentMessageId: string | null
) {
  const branchRef = doc(db, "users", userId, "branches", branchId);
  await setDoc(branchRef, {
    name,
    parentId,
    parentMessageId,
    chatId,
    createdAt: new Date(),
  });
}

export async function addMessageToBranch(
  branchId: string,
  message: Omit<Message, "id">
) {
  const messagesRef = collection(
    db,
    "users",
    userId,
    "branches",
    branchId,
    "messages"
  );

  const messageWithId = {
    ...message,
    timestamp: new Date(message.timestamp),
  };

  await addDoc(messagesRef, messageWithId);
}

export async function getMessages(branchId: string) {
  const messagesRef = collection(
    db,
    "users",
    userId,
    "branches",
    branchId,
    "messages"
  );
  const q = query(messagesRef, orderBy("timestamp"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: (doc.data().timestamp as any).toDate(),
  })) as Message[];
}
