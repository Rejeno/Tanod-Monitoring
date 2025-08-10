// app/login/page.tsx
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

export default function LoginPage() {
  const router = useRouter();
  const auth = getAuth(app);
  const provider = new FacebookAuthProvider();

  // ✅ Handle redirect sign-in result
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

  // ✅ Try Popup, fallback to Redirect if needed
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
    <div className="flex items-center justify-center min-h-screen">
      <button
        onClick={handleFacebookLogin}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Continue with Facebook
      </button>
    </div>
  );
}
