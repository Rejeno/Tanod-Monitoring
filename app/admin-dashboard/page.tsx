"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
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

interface EventReport {
  id: string;
  logType: "normal" | "emergency";
  description: string;
  timestamp: Date;
}

export default function AdminTanodList() {
  const [tanods, setTanods] = useState<User[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null); // uid of expanded user
  const [attendance, setAttendance] = useState<Record<string, TimeRecord[]>>(
    {}
  );
  const [reports, setReports] = useState<Record<string, EventReport[]>>({});

  // Fetch all tanods (users with role 'tanod')
  useEffect(() => {
    const fetchTanods = async () => {
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
    };
    fetchTanods();
  }, []);

  // Fetch attendance and reports for expanded user
  useEffect(() => {
    if (!expanded) return;

    const fetchAttendance = async () => {
      const q = query(
        collection(db, "attendanceLogs"),
        where("uid", "==", expanded),
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
      setAttendance((prev) => ({ ...prev, [expanded]: records }));
    };

    const fetchReports = async () => {
      const q = query(
        collection(db, "eventReports"),
        where("uid", "==", expanded),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const recs: EventReport[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        recs.push({
          id: doc.id,
          logType: data.logType,
          description: data.description,
          timestamp: data.timestamp.toDate(),
        });
      });
      setReports((prev) => ({ ...prev, [expanded]: recs }));
    };

    fetchAttendance();
    fetchReports();
  }, [expanded]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tanod List</h1>
      {tanods.length === 0 && <p>No tanods found.</p>}

      <ul className="space-y-4">
        {tanods.map((tanod) => {
          const isOpen = expanded === tanod.uid;
          return (
            <li key={tanod.uid} className="border rounded p-3">
              <button
                onClick={() => setExpanded(isOpen ? null : tanod.uid)}
                className="text-left w-full font-semibold text-lg"
                aria-expanded={isOpen}
              >
                {tanod.name}
              </button>

              {isOpen && (
                <div className="mt-3 pl-4">
                  <h3 className="font-semibold mb-1">Attendance Logs:</h3>
                  {attendance[tanod.uid]?.length ? (
                    <ul className="list-disc pl-5 mb-4">
                      {attendance[tanod.uid].map((rec) => (
                        <li key={rec.id}>
                          <strong>{rec.type === "in" ? "Time In" : "Time Out"}</strong>{" "}
                          - {rec.timestamp.toLocaleString()} - Location: {rec.location}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No attendance records.</p>
                  )}

                  <h3 className="font-semibold mb-1">Event Reports:</h3>
                  {reports[tanod.uid]?.length ? (
                    <ul className="list-disc pl-5">
                      {reports[tanod.uid].map((rep) => (
                        <li
                          key={rep.id}
                          className={rep.logType === "emergency" ? "text-red-600 font-bold" : ""}
                        >
                          [{rep.logType.toUpperCase()}] {rep.description} -{" "}
                          {rep.timestamp.toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No event reports.</p>
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
