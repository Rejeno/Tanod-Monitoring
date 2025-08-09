import { FacebookAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import app from "./firebase";

// Initialize Auth
const auth = getAuth(app);

// Initialize Facebook Provider
const provider = new FacebookAuthProvider();

// Function to sign in with Facebook
export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    // Access user info
    const user = result.user;
    console.log("User info:", user);
    return user;
  } catch (error) {
    console.error("Facebook login error:", error);
    throw error;
  }
};
