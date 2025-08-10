"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

interface EmergencyReport {
  id: string;
  uid: string; // tanod user id who reported
  description: string;
  location: string;
  timestamp: Date;
}

export default function AdminDashboard() {
  const [emergencyReports, setEmergencyReports] = useState<EmergencyReport[]>([]);
  const [tanodNames, setTanodNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // 1. Fetch emergency reports ordered by timestamp descending
        const reportsQuery = query(
          collection(db, "eventReports"),
          where("logType", "==", "emergency"),
          orderBy("timestamp", "desc")
        );
        const reportsSnapshot = await getDocs(reportsQuery);

        // Map docs to array of reports
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

        // 2. Fetch all tanods for name resolution
        const allTanodsQuery = query(
          collection(db, "users"),
          where("role", "==", "tanod")
        );
        const usersSnapshot = await getDocs(allTanodsQuery);

        // Map uid => displayName
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
    <div className="max-w-md mx-auto p-4 min-h-screen bg-white flex flex-col">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          Admin Dashboard - Emergency Reports
        </h1>
        <nav className="flex justify-center space-x-4">
          <Link
            href="/tanod-list"
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
          >
            Tanods
          </Link>
          <Link
            href="/report-list"
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
          >
            Reports
          </Link>
        </nav>
      </header>

      {loading && (
        <p className="text-center text-gray-600">Loading emergency reports...</p>
      )}
      {error && (
        <p className="text-center text-red-600 font-semibold">{error}</p>
      )}

      {!loading && !error && (
        <>
          {emergencyReports.length === 0 ? (
            <p className="text-center text-gray-600">
              No emergency reports found.
            </p>
          ) : (
            <ul className="space-y-4 overflow-y-auto" style={{ maxHeight: "70vh" }}>
              {emergencyReports.map((report) => (
                <li
                  key={report.id}
                  className="border rounded p-4 bg-red-50 border-red-400 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-red-700">
                      🚨 Emergency Report
                    </h2>
                    <time className="text-sm text-gray-500">
                      {report.timestamp.toLocaleString()}
                    </time>
                  </div>
                  <p className="mb-2 text-gray-800">{report.description}</p>
                  <p className="text-sm text-gray-700 font-medium">
                    From: {tanodNames[report.uid] || report.uid}
                  </p>
                  <p className="text-sm text-gray-600">Location: {report.location}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
