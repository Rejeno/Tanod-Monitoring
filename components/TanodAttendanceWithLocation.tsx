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
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
        Attendance with Location
      </h2>

      {/* Location Input */}
      <input
        type="text"
        placeholder="Enter your current location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border border-gray-300 text-black rounded-lg px-4 py-2 w-full mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        disabled={isSaving}
      />

      {/* Buttons */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => handleTimeInOut("in")}
          disabled={!canTimeIn || isSaving}
          className={`px-6 py-2 rounded-lg shadow-md text-white font-semibold transition transform active:scale-95 ${canTimeIn
            ? "bg-green-500 hover:bg-green-600"
            : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          Time In
        </button>

        <button
          onClick={() => handleTimeInOut("out")}
          disabled={!canTimeOut || isSaving}
          className={`px-6 py-2 rounded-lg shadow-md text-white font-semibold transition transform active:scale-95 ${canTimeOut
            ? "bg-red-500 hover:bg-red-600"
            : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          Time Out
        </button>
      </div>

      {/* Records */}
      <h3 className="text-lg font-bold mb-3 text-gray-700">Recent Records</h3>
      {records.length === 0 ? (
        <p className="text-gray-500 italic">No records yet.</p>
      ) : (
        <ul className="space-y-3">
          {records.map((rec) => (
            <li
              key={rec.id}
              className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow transition"
            >
              <div className="flex justify-between items-center">
                <span
                  className={`font-semibold ${rec.type === "in" ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {rec.type === "in" ? "Time In" : "Time Out"}
                </span>
                <time className="text-sm text-gray-500">
                  {rec.timestamp.toLocaleString()}
                </time>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Location: <span className="font-medium">{rec.location}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
