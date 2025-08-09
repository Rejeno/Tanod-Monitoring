"use client";

import useAuthGuard from "@/hooks/useAuthGuard";

export default function AdminDashboard() {
  const { user, loading } = useAuthGuard();

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Pending Dashboard</h1>
      <p>Welcome, {user?.email}</p>
    </div>
  );
}
