// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAI4RB4drp6DFn915g6Ju3r6rEOOrROXI8",
  authDomain: "convo-tree-ai.firebaseapp.com",
  projectId: "convo-tree-ai",
  storageBucket: "convo-tree-ai.firebasestorage.app",
  messagingSenderId: "148424182787",
  appId: "1:148424182787:web:95682b17241501b29c5236",
  measurementId: "G-0HDQH01FYW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
