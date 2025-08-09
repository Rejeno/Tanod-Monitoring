// lib/firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIVlXfMewvH3zR0WjrEopD6BQg_IWqNOI",
  authDomain: "tanod-monitoring-fca79.firebaseapp.com",
  projectId: "tanod-monitoring-fca79",
  storageBucket: "tanod-monitoring-fca79.firebasestorage.app",
  messagingSenderId: "461523727252",
  appId: "1:461523727252:web:87ad7a437f222802d55581"
};

// Avoid re-initializing during hot reload in dev
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
