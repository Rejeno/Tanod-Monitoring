"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  uid: string;
  name: string;
}

interface TimeRecord {
  id: string;
  type: "in" | "out";
  timestamp: Date;
  location: string;
}

function formatDate(date: Date): string {
  return date.toLocaleString();
}

export default function TanodsPage() {
  const router = useRouter();

  const [tanods, setTanods] = useState<User[]>([]);
  const [expandedUid, setExpandedUid] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<Record<string, TimeRecord[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTanods() {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "tanod"),
          orderBy("displayName")
        );
        const snapshot = await getDocs(q);
        const users: User[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          users.push({
            uid: doc.id,
            name: data.displayName || "No name",
          });
        });
        setTanods(users);
      } catch (e) {
        console.error(e);
      }
    }
    fetchTanods();
  }, []);

  useEffect(() => {
    if (!expandedUid) return;

    async function fetchAttendance() {
      try {
        setLoading(true);
        const q = query(
          collection(db, "attendanceLogs"),
          where("uid", "==", expandedUid),
          orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);
        const records: TimeRecord[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          records.push({
            id: doc.id,
            type: data.type,
            timestamp: data.timestamp.toDate(),
            location: data.location || "",
          });
        });
        setAttendance((prev) => ({ ...prev, [expandedUid as string]: records }));
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("Failed to load attendance.");
        setLoading(false);
      }
    }

    fetchAttendance();
  }, [expandedUid]);

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-gray-200 flex flex-col">
      {/* Back button */}
      <button
        onClick={() => router.push("/admin-dashboard")}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium transition"
        aria-label="Go back to Admin Dashboard"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      {/* Page title */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md">
          👮
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mt-4">Tanods Attendance</h1>
        <p className="text-gray-500 text-sm">View daily attendance logs</p>
      </div>

      {tanods.length === 0 && (
        <p className="text-center text-gray-600 italic">No tanods found.</p>
      )}

      <ul className="space-y-4 overflow-auto pr-2">
        {tanods.map((tanod) => {
          const isOpen = expandedUid === tanod.uid;
          return (
            <li
              key={tanod.uid}
              className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition"
            >
              <button
                className="flex justify-between w-full font-semibold text-lg text-gray-800"
                onClick={() => setExpandedUid(isOpen ? null : tanod.uid)}
                aria-expanded={isOpen}
              >
                {tanod.name}
                <span className="text-blue-600 font-bold">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="mt-3 pl-4 max-h-48 overflow-auto border-t pt-3">
                  {loading && (
                    <p className="text-gray-500 italic">Loading attendance logs...</p>
                  )}
                  {error && (
                    <p className="text-red-600 bg-red-50 border border-red-300 p-2 rounded">
                      {error}
                    </p>
                  )}

                  {!loading && !error && (
                    <>
                      {attendance[tanod.uid]?.length ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {attendance[tanod.uid].map((rec) => (
                            <li key={rec.id} className="text-gray-700">
                              <strong
                                className={`${rec.type === "in"
                                    ? "text-green-600"
                                    : "text-red-600"
                                  }`}
                              >
                                {rec.type === "in" ? "Time In" : "Time Out"}
                              </strong>{" "}
                              - {formatDate(rec.timestamp)} -{" "}
                              <span className="italic text-gray-600">
                                Location: {rec.location}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">
                          No attendance records.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
