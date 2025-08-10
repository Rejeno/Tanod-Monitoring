"use client";

import app from "@/lib/firebase";
import {
  FacebookAuthProvider,
  getAuth,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  UserCredential,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const router = useRouter();
  const auth = getAuth(app);
  const provider = new FacebookAuthProvider();

  // Handle redirect sign-in result (for mobile or popup-blocked browsers)
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result: UserCredential | null = await getRedirectResult(auth);
        if (result && result.user) {
          router.push("/profile-setup");
        }
      } catch (err) {
        console.error("Redirect login failed:", err);
      }
    };
    checkRedirect();
  }, [auth, router]);

  // Try popup login, fallback to redirect
  const handleFacebookLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push("/profile-setup");
    } catch (error: any) {
      console.warn("Popup login failed, trying redirect...", error);
      await signInWithRedirect(auth, provider);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to Our App
        </h1>
        <p className="text-gray-600 mb-8">
          Connect with Facebook to get started. We’ll help set up your profile
          and take you to the right dashboard.
        </p>
        <button
          onClick={handleFacebookLogin}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 w-full"
        >
          Continue with Facebook
        </button>
      </div>
    </main>
  );
}
