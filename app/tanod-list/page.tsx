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
    <div className="max-w-md mx-auto p-4 bg-white min-h-screen flex flex-col">
      {/* Back button */}
      <button
        onClick={() => router.push("/admin-dashboard")}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
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

      <h1 className="text-2xl font-bold mb-4 text-center">Tanods Attendance</h1>

      {tanods.length === 0 && <p className="text-center">No tanods found.</p>}

      <ul className="space-y-4 overflow-auto">
        {tanods.map((tanod) => {
          const isOpen = expandedUid === tanod.uid;
          return (
            <li key={tanod.uid} className="border rounded p-3">
              <button
                className="flex justify-between w-full font-semibold text-lg"
                onClick={() => setExpandedUid(isOpen ? null : tanod.uid)}
                aria-expanded={isOpen}
              >
                {tanod.name}
                <span>{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && (
                <div className="mt-3 pl-4 max-h-48 overflow-auto">
                  {loading && <p>Loading attendance logs...</p>}
                  {error && <p className="text-red-600">{error}</p>}

                  {!loading && !error && (
                    <>
                      {attendance[tanod.uid]?.length ? (
                        <ul className="list-disc pl-5">
                          {attendance[tanod.uid].map((rec) => (
                            <li key={rec.id}>
                              <strong>{rec.type === "in" ? "Time In" : "Time Out"}</strong> -{" "}
                              {formatDate(rec.timestamp)} - Location: {rec.location}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No attendance records.</p>
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
