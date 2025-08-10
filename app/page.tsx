// app/page.tsx or pages/index.tsx
"use client";

import { loginWithEmail } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const user = await loginWithEmail(email, password);
      console.log("Logged in:", user);
      router.push("/profile-setup"); // Redirect after login
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm border border-gray-200"
      >
        {/* Logo or Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md">
            🛡️
          </div>
          <h1 className="text-2xl font-bold mt-4 text-gray-800">
            Barangay Tanod System
          </h1>
          <p className="text-gray-500 text-sm mt-1">Login to continue</p>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="e.g., juan@example.com"
            className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition transform"
        >
          Login
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          Barangay Tanod Monitoring System © {new Date().getFullYear()}
        </p>
      </form>
    </div>

  );
}
