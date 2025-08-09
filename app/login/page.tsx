// app/login/page.tsx
"use client";

import app from "@/lib/firebase";
import { FacebookAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const auth = getAuth(app);
  const provider = new FacebookAuthProvider();

  const handleFacebookLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push("/profile-setup"); // redirect after login
    } catch (error) {
      console.error("Login failed:", error);
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
