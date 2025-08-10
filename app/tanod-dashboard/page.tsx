"use client";

import EventReport from "@/components/EventReport";
import TanodAttendanceWithLocation from "@/components/TanodAttendanceWithLocation";
import useAuthGuard from "@/hooks/useAuthGuard";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function TanodDashboardPage() {
  const { user, loading } = useAuthGuard();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loadingName, setLoadingName] = useState(true);

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

  if (loading || loadingName) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold text-center">
        Good Day Tanod <strong>{displayName || "Tanod"}</strong>!
      </h1>
      <TanodAttendanceWithLocation userUid={user.uid} />
      <EventReport userId={user.uid} />
    </div>
  );
}
