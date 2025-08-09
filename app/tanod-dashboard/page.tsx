"use client";

import EventReport from "@/components/EventReport";
import TanodAttendanceWithLocation from "@/components/TanodAttendanceWithLocation";
import useAuthGuard from "@/hooks/useAuthGuard";

export default function TanodDashboardPage() {
  const { user, loading } = useAuthGuard();

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tanod Dashboard</h1>
      <p className="mb-6">
        Good day, <strong>{user.displayName || "Tanod"}</strong>!
      </p>
      <TanodAttendanceWithLocation userUid={user.uid} />
      {/* Event report component */}
      <EventReport userId={user.uid} />
    </div>
  );
}
