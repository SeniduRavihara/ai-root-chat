import { mockBranchesData } from "@/components/sections/data";
import { BranchWithMessages, UserDataType } from "@/types";
import { User } from "firebase/auth";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase_config";

export const featchCurrentUserData = async (currentUser: User) => {
  try {
    const documentRef = doc(db, "users", currentUser.uid);
    const userDataDoc = await getDoc(documentRef);

    if (userDataDoc.exists()) {
      const userData = userDataDoc.data() as UserDataType;
      console.log("Current user data fetched successfully");
      return userData;
    } else {
      console.log("Document does not exist.");
      return null;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchUserBranchData = async (
  userId: string
): Promise<Record<string, BranchWithMessages>> => {
  const collectionRef = collection(db, "users", userId, "branches");

  try {
    const querySnapshot = await getDocs(collectionRef);
    const branchData: Record<string, BranchWithMessages> = {};

    querySnapshot.forEach((doc) => {
      const branch = doc.data() as BranchWithMessages;
      branchData[branch.id] = branch;
    });

    console.log(
      `Successfully retrieved ${
        Object.keys(branchData).length
      } branches from Firestore for user: ${userId}`
    );
    return branchData;
  } catch (error) {
    console.error("Error retrieving data from Firestore:", error);
    throw error;
  }
};

export const addMockData = async (userId: string, chatId: string) => {
  const collectionRef = collection(db, "users", userId, "chats", chatId,  "branches");

  try {
    // Convert the Record to an array of branch objects
    const branches = Object.values(mockBranchesData);

    // Use Promise.all to add all branches concurrently
    await Promise.all(
      branches.map((branch) => setDoc(doc(collectionRef, branch.id), branch))
    );

    console.log(
      `Successfully added ${branches.length} branches to Firestore for user: ${userId}`
    );
  } catch (error) {
    console.error("Error adding mock data to Firestore:", error);
    throw error;
  }
};


