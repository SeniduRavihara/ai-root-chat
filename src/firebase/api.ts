import { mockBranchesData } from "@/components/sections/data";
import { BranchWithMessages, UserDataType } from "@/types";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db, provider } from "./firebase_config";

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    // console.log(userCredential);
    return userCredential.user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const signup = async ({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    // console.log(userCredential);
    const user = userCredential.user;

    const payload = {
      uid: "",
      userName: "",
      email: "",
    };

    await setDoc(doc(db, "users", user.uid), {
      ...payload,
      uid: user.uid,
      userName: name,
      email,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const googleSignIn = async () => {
  try {
    const userCredential = await signInWithPopup(auth, provider);
    // console.log(userCredential);

    const user = userCredential.user;
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const payload = {
        uid: user.uid,
        userName: user.displayName || "",
        regNo: null,
        email: user.email || "",
        roles: "STUDENT",
        registered: false,
        lastResult: null,
      };

      await setDoc(userDocRef, payload);
    }

    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

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

export const addMockData = async (userId: string) => {
  const collectionRef = collection(db, "users", userId, "branches");

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

export async function addMessageToBranch(
  uid: string,
  branchId: string,
  message: any
) {
  const branchRef = doc(db, "users", uid, "branches", branchId);
  await updateDoc(branchRef, {
    messages: arrayUnion(message),
  });
}

/**
 * Create a new branch for a user in Firestore
 * @param uid - user id
 * @param branchData - branch object (id, name, color, parentId, parentMessageId, messages)
 */
export async function createBranchForUser(
  uid: string,
  branchData: BranchWithMessages
) {
  const branchRef = doc(db, "users", uid, "branches", branchData.id);
  await setDoc(branchRef, branchData);
}
