"use client";

import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase"; // make sure you export `auth` from firebase config
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface EmergencyReport {
  id: string;
  uid: string;
  description: string;
  location: string;
  timestamp: Date;
}

export default function AdminDashboard() {
  const [emergencyReports, setEmergencyReports] = useState<EmergencyReport[]>([]);
  const [tanodNames, setTanodNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // redirect to login page or landing page
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const reportsQuery = query(
          collection(db, "eventReports"),
          where("logType", "==", "emergency"),
          orderBy("timestamp", "desc")
        );
        const reportsSnapshot = await getDocs(reportsQuery);

        const reportsData: EmergencyReport[] = reportsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            uid: data.uid,
            description: data.content,
            location: data.location || "Unknown location",
            timestamp: data.timestamp.toDate(),
          };
        });

        setEmergencyReports(reportsData);

        const allTanodsQuery = query(
          collection(db, "users"),
          where("role", "==", "tanod")
        );
        const usersSnapshot = await getDocs(allTanodsQuery);

        const namesMap: Record<string, string> = {};
        usersSnapshot.forEach(doc => {
          const data = doc.data();
          namesMap[doc.id] = data.displayName || "No name";
        });
        setTanodNames(namesMap);

        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("Failed to load emergency reports.");
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="max-w-3xl mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg border border-gray-200">
      <header className="mb-6">
        {/* Header row with icon, title, and logout */}
        <div className="flex items-center justify-between mb-6">
          {/* Left: Icon + Title */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-md">
              🛡️
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-500 text-sm">Emergency Reports Monitoring</p>
            </div>
          </div>

          {/* Right: Logout */}
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 active:scale-95 transition transform"
          >
            Logout
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex justify-center space-x-4 mb-4">
          <Link
            href="/tanod-list"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 active:scale-95 transition transform"
          >
            Tanods
          </Link>
          <Link
            href="/report-list"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 active:scale-95 transition transform"
          >
            Reports
          </Link>
        </nav>
      </header>


      {loading && (
        <p className="text-center text-gray-600 italic">Loading emergency reports...</p>
      )}
      {error && (
        <p className="text-center text-red-600 font-semibold bg-red-50 border border-red-300 p-2 rounded">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          {emergencyReports.length === 0 ? (
            <p className="text-center text-gray-600 italic">
              No emergency reports found.
            </p>
          ) : (
            <ul className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: "70vh" }}>
              {emergencyReports.map((report) => (
                <li
                  key={report.id}
                  className="border rounded-lg p-4 bg-red-50 border-red-300 shadow hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-red-700 flex items-center">
                      🚨 Emergency Report
                    </h2>
                    <time className="text-sm text-gray-500">
                      {report.timestamp.toLocaleString()}
                    </time>
                  </div>
                  <p className="mb-2 text-gray-800 leading-snug">{report.description}</p>
                  <p className="text-sm text-gray-700 font-medium">
                    From:{" "}
                    <span className="text-gray-900">
                      {tanodNames[report.uid] || report.uid}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Location: <span className="font-medium">{report.location}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
