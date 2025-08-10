"use client";

import { initializeApp } from 'firebase/app';
import { FacebookAuthProvider, getAuth, getRedirectResult, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { Facebook, Loader2, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase outside the component to prevent re-initialization
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new FacebookAuthProvider();

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isProfileSetup, setIsProfileSetup] = useState(false);

  // Use useEffect to handle the redirect result and auth state changes
  useEffect(() => {
    // This function handles the redirect result when the page loads
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User was redirected back and is now logged in
          console.log("Redirect login successful:", result.user);
          setIsProfileSetup(true);
        }
      } catch (redirectError) {
        // Handle redirect errors
        console.error("Redirect login failed:", redirectError);
        setError("Login failed. Please try again later.");
      }
    };
    handleRedirectResult();

    // This listener handles all auth state changes, including pop-up and redirect
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        console.log("Auth state changed, user is logged in:", currentUser);
        // Set the state to show the profile setup page if user is logged in
        setIsProfileSetup(true);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Function to handle Facebook login with popup first, then redirect as fallback
  const handleFacebookLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Try to sign in with a pop-up. This is preferred for most devices.
      const result = await signInWithPopup(auth, provider);
      console.log("Popup login successful:", result.user);
      setIsProfileSetup(true);

    } catch (error) {
      console.warn("Popup login failed, trying redirect:", error);

      // Handle the case where the pop-up was closed or blocked.
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        try {
          // 2. Fallback to redirect for environments where pop-ups don't work well (e.g., some mobile browsers).
          await signInWithRedirect(auth, provider);
        } catch (redirectError) {
          console.error("Redirect login failed:", redirectError);
          // Replace alert with a state-based error message
          setError("Login failed. Please try again later.");
        }
      } else {
        // Handle the cases where the popup was closed, but no fatal error occurred.
        setError("Login cancelled. Please try again.");
      }
    } finally {
      // Note: For redirect login, this `finally` block won't be reached as the page reloads.
      if (user === null) {
         setLoading(false);
      }
    }
  };

  if (isProfileSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Setup</h2>
          <p className="text-gray-600">
            This is where the profile setup form would be. You can now access user data.
          </p>
          <button
            onClick={() => {
              signOut(auth);
              setIsProfileSetup(false);
            }}
            className="mt-6 flex items-center gap-3 px-6 py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-transform hover:scale-105"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 px-4">
      {/* Logo / App Name */}
      <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4 text-center">
        Welcome to My App
      </h1>
      <p className="text-gray-600 mb-8 text-center max-w-lg">
        Connect with your friends, share updates, and explore the world — all in
        one place.
      </p>

      {/* Login Button */}
      <button
        onClick={handleFacebookLogin}
        disabled={loading}
        className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin h-5 w-5" />
            <span>Loading...</span>
          </div>
        ) : (
          <>
            <Facebook className="w-6 h-6" />
            Continue with Facebook
          </>
        )}
      </button>

      {/* Error Message Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Footer */}
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

