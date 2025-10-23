import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { BranchWithMessages, Chat } from "../../types";
import { db } from "../firebase_config";

function getRandomColor(): string {
  const colors = [
    "#6366f1",
    "#ec4899",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#14b8a6",
    "#f43f5e",
    "#0ea5e9",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export async function createNewChat(uid: string, name?: string) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const newChat: Chat = {
    id,
    name: name && name.trim() ? name.trim() : "New Chat",
    color: getRandomColor(),
    messages: [],
    createdAt: now,
    updatedAt: now,
  };

  const chatRef = doc(db, "users", uid, "chats", id);
  await setDoc(chatRef, newChat);

  const branchRef = doc(db, "users", uid, "chats", id, "branches", "main");

  await setDoc(branchRef, {
    id: "main",
    name: "Main Branch",
    parentId: null,
    parentMessageId: null,
    color: "#6366f1", // indigo
    messages: [],
  });

  return newChat;
}

export async function addMessageToBranch(
  uid: string,
  branchId: string,
  message: any,
  activeChatId: string
) {
  const branchRef = doc(
    db,
    "users",
    uid,
    "chats",
    activeChatId,
    "branches",
    branchId
  );
  await updateDoc(branchRef, {
    messages: arrayUnion(message),
  });

  // Update the chat's updatedAt timestamp
  await updateChatTimestamp(uid, activeChatId);
}

export const getChats = async (uid: string) => {
  console.log("UID", uid);

  const chatsRef = collection(db, "users", uid, "chats");
  const chats = await getDocs(chatsRef);
  return chats.docs.map((doc) => doc.data());
};

export async function updateChatName(
  uid: string,
  chatId: string,
  name: string
) {
  const chatRef = doc(db, "users", uid, "chats", chatId);
  await updateDoc(chatRef, {
    name: name.trim(),
    updatedAt: new Date().toISOString(),
    autoRenamed: true,
  });
}

export async function manuallyRenameChat(
  uid: string,
  chatId: string,
  name: string
) {
  const chatRef = doc(db, "users", uid, "chats", chatId);
  await updateDoc(chatRef, {
    name: name.trim(),
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteChat(uid: string, chatId: string) {
  // Delete all branches first
  const branchesRef = collection(db, "users", uid, "chats", chatId, "branches");
  const branchesSnapshot = await getDocs(branchesRef);

  const deletePromises = branchesSnapshot.docs.map((branchDoc) =>
    deleteDoc(branchDoc.ref)
  );
  await Promise.all(deletePromises);

  // Then delete the chat document
  const chatRef = doc(db, "users", uid, "chats", chatId);
  await deleteDoc(chatRef);
}

export async function updateChatTimestamp(uid: string, chatId: string) {
  const chatRef = doc(db, "users", uid, "chats", chatId);
  await updateDoc(chatRef, {
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Create a new branch for a user in Firestore
 * @param uid - user id
 * @param branchData - branch object (id, name, color, parentId, parentMessageId, messages)
 */
export async function updateBranchName(
  uid: string,
  chatId: string,
  branchId: string,
  name: string
) {
  const branchRef = doc(
    db,
    "users",
    uid,
    "chats",
    chatId,
    "branches",
    branchId
  );
  await updateDoc(branchRef, {
    name: name.trim(),
  });

  // Update the chat's updatedAt timestamp
  await updateChatTimestamp(uid, chatId);
}

export async function createBranchForUser(
  uid: string,
  chatId: string,
  branchData: BranchWithMessages
) {
  const branchRef = doc(
    db,
    "users",
    uid,
    "chats",
    chatId,
    "branches",
    branchData.id
  );
  await setDoc(branchRef, branchData);
}
