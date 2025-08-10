"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import Link from "next/link"; // for client-side navigation
import { useEffect, useState } from "react";

interface EventReport {
  id: string;
  uid: string;
  logType: "normal" | "emergency";
  description: string;
  location: string;
  timestamp: Date;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<EventReport[]>([]);
  const [tanodNames, setTanodNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date filter state in ISO yyyy-MM-dd format
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  function getTodayISODate() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  async function fetchTanods() {
    try {
      const allTanodsQuery = query(
        collection(db, "users"),
        where("role", "==", "tanod")
      );
      const usersSnapshot = await getDocs(allTanodsQuery);
      const namesMap: Record<string, string> = {};
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        namesMap[doc.id] = data.displayName || "No name";
      });
      setTanodNames(namesMap);
    } catch (e) {
      console.error("Failed to fetch tanods:", e);
      setError("Failed to load tanod users.");
    }
  }

  async function fetchReportsFiltered(start: Date, end: Date) {
    try {
      setLoading(true);
      setError(null);

      const startTimestamp = Timestamp.fromDate(start);
      const endTimestamp = Timestamp.fromDate(end);

      const reportsQuery = query(
        collection(db, "eventReports"),
        where("timestamp", ">=", startTimestamp),
        where("timestamp", "<=", endTimestamp),
        orderBy("timestamp", "desc")
      );

      const snapshot = await getDocs(reportsQuery);
      const reportsData: EventReport[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: data.uid,
          logType: data.logType,
          description: data.content,
          location: data.location || "Unknown location",
          timestamp: data.timestamp.toDate(),
        };
      });

      setReports(reportsData);
    } catch (e) {
      console.error(e);
      setError("Failed to load reports.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const todayStr = getTodayISODate();
    setStartDate(todayStr);
    setEndDate(todayStr);
    fetchTanods();
  }, []);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T23:59:59.999");

    fetchReportsFiltered(start, end);
  }, [startDate, endDate]);

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-gray-200 flex flex-col">
      {/* Back Button */}
      <div className="mb-4">
        <Link
          href="/admin-dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition"
          aria-label="Back to Admin Dashboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Page Title */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md">
          📋
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mt-4">Reports</h1>
        <p className="text-gray-500 text-sm">View and filter barangay reports</p>
      </div>

      {/* Date Filters */}
      <div className="flex flex-col sm:flex-row sm:space-x-4 mb-6">
        <label className="flex flex-col mb-4 sm:mb-0">
          <span className="font-semibold mb-1 text-gray-700">Start Date</span>
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-semibold mb-1 text-gray-700">End Date</span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </label>
      </div>

      {/* Loading and Error */}
      {loading && (
        <p className="text-center text-gray-500 italic">Loading reports...</p>
      )}
      {error && (
        <p className="text-center text-red-600 bg-red-50 border border-red-300 p-2 rounded">
          {error}
        </p>
      )}

      {/* Reports List */}
      {!loading && !error && (
        <>
          {reports.length === 0 ? (
            <p className="text-center text-gray-600 italic">
              No reports found for selected dates.
            </p>
          ) : (
            <ul className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: "60vh" }}>
              {reports.map((report) => (
                <li
                  key={report.id}
                  className={`border rounded-lg p-4 shadow hover:shadow-md transition ${report.logType === "emergency"
                    ? "bg-red-50 border-red-300"
                    : "bg-white border-gray-300"
                    }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`font-semibold text-lg ${report.logType === "emergency"
                        ? "text-red-700"
                        : "text-gray-800"
                        }`}
                    >
                      {report.logType === "emergency" ? "🚨 Emergency" : "Normal"} Report
                    </span>
                    <time className="text-sm text-gray-500">
                      {report.timestamp.toLocaleString()}
                    </time>
                  </div>
                  <p className="mb-2 text-gray-800">{report.description}</p>
                  <p className="text-sm text-gray-700 font-medium">
                    From: {tanodNames[report.uid] || report.uid}
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
