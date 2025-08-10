// app/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-lg text-center p-8 bg-white rounded-2xl shadow-lg">
        {/* Logo / Title */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Our App
        </h1>
        <p className="text-gray-600 mb-6">
          Your gateway to amazing features.  
          Sign in to get started.
        </p>

        {/* Continue Button */}
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 text-lg bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all duration-300"
        >
          Continue to Login
        </button>
      </div>
    </div>
  );
}
