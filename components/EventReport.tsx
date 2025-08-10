"use client";

import { db } from "@/lib/firebase";
import { addDoc, collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
import { useEffect, useState } from "react";

interface Report {
  id: string;
  content: string;
  logType: "normal" | "emergency";
  timestamp: Date;
  location: string; // add location field here
}

interface Props {
  userId: string;
}

export default function EventReport({ userId }: Props) {
  const [reports, setReports] = useState<Report[]>([]);
  const [content, setContent] = useState("");
  const [logType, setLogType] = useState<"normal" | "emergency">("normal");
  const [location, setLocation] = useState(""); // new location state
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchReports() {
    const q = query(
      collection(db, "eventReports"),
      where("uid", "==", userId),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    const fetchedReports: Report[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      fetchedReports.push({
        id: doc.id,
        content: data.content,
        logType: data.logType,
        timestamp: data.timestamp.toDate(),
        location: data.location || "Unknown location", // fallback if no location
      });
    });
    setReports(fetchedReports);
  }

  useEffect(() => {
    fetchReports().catch(console.error);
  }, [userId]);

  async function handleSubmit() {
    if (content.trim() === "") {
      alert("Please enter your report.");
      return;
    }
    if (location.trim() === "") {
      alert("Please enter the location of the event.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "eventReports"), {
        uid: userId,
        content: content.trim(),
        logType,
        location: location.trim(),  // save location here
        timestamp: Timestamp.fromDate(new Date()),
      });
      setContent("");
      setLogType("normal");
      setLocation(""); // reset location input
      await fetchReports();
    } catch (error) {
      alert("Error submitting report: " + error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-8 p-4 border rounded-md shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-4">Submit Event Report</h2>

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Enter your report here..."
        rows={4}
        className="w-full border border-gray-300 rounded p-2 mb-3"
        disabled={isSubmitting}
      />

      {/* New Location input */}
      <input
        type="text"
        value={location}
        onChange={e => setLocation(e.target.value)}
        placeholder="Enter event location"
        className="w-full border border-gray-300 rounded p-2 mb-3"
        disabled={isSubmitting}
      />

      <div className="mb-4">
        <label className="mr-2 font-semibold">Report Type:</label>
        <select
          value={logType}
          onChange={e => setLogType(e.target.value as "normal" | "emergency")}
          disabled={isSubmitting}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="normal">Normal</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Submit Report
      </button>

      <h3 className="mt-8 text-lg font-semibold">Report History</h3>
      {reports.length === 0 ? (
        <p className="mt-2 text-gray-600">No reports submitted yet.</p>
      ) : (
        <ul className="mt-2 max-h-64 overflow-y-auto space-y-2">
          {reports.map((report) => (
            <li
              key={report.id}
              className={`p-3 border rounded ${
                report.logType === "emergency" ? "bg-red-100 border-red-400 text-red-700" : "bg-gray-50"
              }`}
              title={`Submitted on ${report.timestamp.toLocaleString()}`}
            >
              <strong>{report.logType === "emergency" ? "🚨 Emergency" : "Normal"} Report</strong>
              <p className="whitespace-pre-wrap">{report.content}</p>
              {/* Show location */}
              <small className="block text-gray-600 font-medium">Location: {report.location}</small>
              <small className="text-gray-500">{report.timestamp.toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
