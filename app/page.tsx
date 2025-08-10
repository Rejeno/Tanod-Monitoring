"use client";

import app from "@/lib/firebase";
import {
  FacebookAuthProvider,
  getAuth,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const auth = getAuth(app);
  const provider = new FacebookAuthProvider();

  // Detect mobile devices on mount
  useEffect(() => {
    const mobileCheck =
      /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
      );
    setIsMobile(mobileCheck);
  }, []);

  // Handle redirect result (for desktop login flow)
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("Redirect login success:", result.user);
          router.push("/profile-setup");
        }
      } catch (error) {
        console.error("Error handling redirect result:", error);
      }
    };
    checkRedirectResult();
  }, [auth, router]);

  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      if (isMobile) {
        // ✅ Mobile: Use popup
        await signInWithPopup(auth, provider);
        router.push("/profile-setup");
      } else {
        // ✅ Desktop: Use redirect flow
        await signInWithRedirect(auth, provider);
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4 text-center">
        Welcome to Barangay Tanod Monitoring
      </h1>
      <p className="text-gray-600 mb-8 text-center max-w-lg">
        Keep your community safe and connected — anywhere, anytime.
      </p>

      <button
        onClick={handleFacebookLogin}
        disabled={loading}
        className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 disabled:opacity-50"
      >
        {loading ? (
          <span>Loading...</span>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="white"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path d="M22.676 0H1.326C.594 0 0 .593 0 1.326v21.348C0 23.406.594 24 1.326 24H12.82v-9.293H9.692V11.08h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24h-1.918c-1.505 0-1.797.716-1.797 1.766v2.316h3.594l-.468 3.627h-3.126V24h6.128C23.406 24 24 23.406 24 22.674V1.326C24 .593 23.406 0 22.676 0" />
            </svg>
            Continue with Facebook
          </>
        )}
      </button>

      <footer className="mt-12 text-xs text-gray-500 text-center">
        By continuing, you agree to our{" "}
        <a
          href="/privacy-policy"
          className="underline hover:text-blue-700"
          target="_blank"
        >
          Privacy Policy
        </a>{" "}
        and{" "}
        <a
          href="/data-deletion"
          className="underline hover:text-blue-700"
          target="_blank"
        >
          Data Deletion Policy
        </a>
        .
      </footer>
    </main>
  );
}
