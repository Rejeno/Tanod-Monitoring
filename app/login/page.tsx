// app/login/page.tsx
"use client";

import app from "@/lib/firebase";
import { FacebookAuthProvider, getAuth, signInWithRedirect } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const auth = getAuth(app);
  const provider = new FacebookAuthProvider();

  // Handle redirect result after returning from Facebook
  useEffect(() => {
    import("firebase/auth").then(({ getRedirectResult }) => {
      getRedirectResult(auth)
        .then((result) => {
          if (result?.user) {
            // User is signed in, redirect
            router.push("/profile-setup");
          }
        })
        .catch((error) => {
          console.error("Redirect login failed:", error);
        });
    });
  }, [auth, router]);

  const handleFacebookLogin = async () => {
    try {
      await signInWithRedirect(auth, provider);
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
