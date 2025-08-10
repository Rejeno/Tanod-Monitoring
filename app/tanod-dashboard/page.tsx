"use client";

import EventReport from "@/components/EventReport";
import TanodAttendanceWithLocation from "@/components/TanodAttendanceWithLocation";
import useAuthGuard from "@/hooks/useAuthGuard";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TanodDashboardPage() {
  const { user, loading } = useAuthGuard();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loadingName, setLoadingName] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserName(uid: string) {
      try {
        setLoadingName(true);
        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setDisplayName(data.displayName || null);
        } else {
          setDisplayName(null);
        }
      } catch (error) {
        console.error("Failed to fetch user displayName:", error);
        setDisplayName(null);
      } finally {
        setLoadingName(false);
      }
    }

    if (user?.uid) {
      fetchUserName(user.uid);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Redirect to login after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading || loadingName) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="max-w-md mx-auto p-4 bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header with logout button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {/* Shield Badge */}
          <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl shadow-md">
            🛡️
          </div>
          <h1 className="text-xl font-bold text-gray-800">
            Good Day, Tanod{" "}
            <span className="text-blue-600">{displayName || "Tanod"}</span>!
          </h1>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600 active:scale-95 transition"
        >
          Logout
        </button>
      </div>

      {/* Components */}
      <TanodAttendanceWithLocation userUid={user.uid} />
      <EventReport userId={user.uid} />
    </div>
  );
}
