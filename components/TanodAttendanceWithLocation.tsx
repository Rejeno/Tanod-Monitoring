"use client";

import { db } from "@/lib/firebase";
import { addDoc, collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

interface TimeRecord {
  id: string;
  type: "in" | "out";
  timestamp: Date;
  location: string;
}

interface Props {
  userUid: string;
}

export default function TanodAttendanceWithLocation({ userUid }: Props) {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [location, setLocation] = useState("");

  // Fetch records from Firestore
  useEffect(() => {
    if (!userUid) return;

    const fetchRecords = async () => {
      const q = query(
        collection(db, "attendanceLogs"),
        where("uid", "==", userUid),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const fetched: TimeRecord[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          type: data.type,
          timestamp: data.timestamp.toDate(),
          location: data.location || "",
        });
      });
      setRecords(fetched);
    };

    fetchRecords();
  }, [userUid]);

  // Determine if user can time in or out
  // If last record is "in" => disable time in, enable time out
  // If last record is "out" or no records => enable time in, disable time out
  const lastRecord = records[0];
  const canTimeIn = !lastRecord || lastRecord.type === "out";
  const canTimeOut = lastRecord && lastRecord.type === "in";

  // Save time in or out along with location
  const handleTimeInOut = async (type: "in" | "out") => {
    if (!userUid) return;
    if (!location.trim()) {
      alert("Please enter your location before timing " + type);
      return;
    }

    setIsSaving(true);

    try {
      await addDoc(collection(db, "attendanceLogs"), {
        uid: userUid,
        type,
        timestamp: new Date(),
        location: location.trim(),
      });

      // Refresh records
      const q = query(
        collection(db, "attendanceLogs"),
        where("uid", "==", userUid),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const fetched: TimeRecord[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          type: data.type,
          timestamp: data.timestamp.toDate(),
          location: data.location || "",
        });
      });
      setRecords(fetched);

      // Clear location after save
      setLocation("");
    } catch (error) {
      alert("Error saving record: " + error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Attendance with Location</h2>

      <input
        type="text"
        placeholder="Enter your current location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border px-3 py-2 rounded w-full mb-4"
        disabled={isSaving}
      />

      <div className="space-x-4 mb-6">
        <button
          onClick={() => handleTimeInOut("in")}
          disabled={!canTimeIn || isSaving}
          className={`px-4 py-2 rounded text-white ${
            canTimeIn
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Time In
        </button>

        <button
          onClick={() => handleTimeInOut("out")}
          disabled={!canTimeOut || isSaving}
          className={`px-4 py-2 rounded text-white ${
            canTimeOut
              ? "bg-red-500 hover:bg-red-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Time Out
        </button>
      </div>

      <h3 className="text-lg font-semibold mb-2">Recent Records</h3>
      {records.length === 0 ? (
        <p>No records yet.</p>
      ) : (
        <ul className="list-disc pl-5 space-y-1">
          {records.map((rec) => (
            <li key={rec.id}>
              <strong>{rec.type === "in" ? "Time In" : "Time Out"}</strong> -{" "}
              {rec.timestamp.toLocaleString()} - Location: {rec.location}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
