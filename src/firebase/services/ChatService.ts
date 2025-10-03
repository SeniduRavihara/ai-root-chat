import { db } from "@/firebase/firebase_config";
import { BranchWithMessages } from "@/types";
import { arrayUnion,updateDoc, doc, setDoc, getDocs, collection } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

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

export async function createNewChat(
    uid: string,
    name?: string
  ): Promise<BranchWithMessages> {
    const branchId = uuidv4();
    const newChat: BranchWithMessages = {
      id: branchId,
      name: name && name.trim() ? name.trim() : "New Chat",
      color: getRandomColor(),
      parentId: null,
      parentMessageId: null,
      messages: [],
    };
  
    const branchRef = doc(db, "users", uid, "chats", branchId);
    await setDoc(branchRef, newChat);
  
    return newChat;
  }

export async function addMessageToChat(
  uid: string,
  chatId: string,
  message: any
) {
  const chatRef = doc(db, "users", uid, "chats", chatId);
  await updateDoc(chatRef, {
    messages: arrayUnion(message),
  });
}

export const getChats = async (uid: string) => {
  const chatsRef = collection(db, "users", uid, "chats");
  const chats = await getDocs(chatsRef);
  return chats.docs.map((doc) => doc.data());
}
