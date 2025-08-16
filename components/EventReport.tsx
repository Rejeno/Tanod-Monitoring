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
  const [reportDate, setReportDate] = useState("");
  const [reportTime, setReportTime] = useState("");

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
        timestamp: reportDate && reportTime
          ? Timestamp.fromDate(new Date(`${reportDate}T${reportTime}:00`))
          : Timestamp.fromDate(new Date()), // fallback if no date/time picked

      });
      setContent("");
      setLogType("normal");
      setLocation(""); // reset location input
      setReportDate(""); // reset date picker
      setReportTime(""); // reset time picker
      await fetchReports();
    } catch (error) {
      alert("Error submitting report: " + error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-10 max-w-2xl mx-auto p-6 border border-gray-200 rounded-xl shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Submit Event Report
      </h2>

      {/* Report Text Area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter your report here..."
        rows={4}
        className="w-full border border-gray-300 text-black rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:opacity-50"
        disabled={isSubmitting}
      />

      {/* Location Input */}
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Enter event location"
        className="w-full border border-gray-300 text-black rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:opacity-50"
        disabled={isSubmitting}
      />

      {/* Report Type Selector */}
      <div className="mb-6 flex items-center space-x-3">
        <label className="font-semibold text-gray-700">Report Type:</label>
        <select
          value={logType}
          onChange={(e) =>
            setLogType(e.target.value as "normal" | "emergency")
          }
          disabled={isSubmitting}
          className="border border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:opacity-50"
        >
          <option value="normal">Normal</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      {/* Report Date Input */}
      <label className="font-semibold text-gray-700">Date:</label>
      <input
        type="date"
        value={reportDate}
        onChange={(e) => setReportDate(e.target.value)}
        className="w-full border border-gray-300 text-black rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:opacity-50"
        disabled={isSubmitting}
      />
      {/* Report Time Input */}
      <label className="font-semibold text-gray-700">Time:</label>
      <input
        type="time"
        value={reportTime}
        onChange={(e) => setReportTime(e.target.value)}
        className="w-full border border-gray-300 text-black rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:opacity-50"
        disabled={isSubmitting}
      />

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md font-semibold transition transform active:scale-95 disabled:opacity-50"
      >
        Submit Report
      </button>

      {/* Report History */}
      <h3 className="mt-10 text-lg font-bold text-gray-700">Report History</h3>
      {reports.length === 0 ? (
        <p className="mt-3 text-gray-500 italic">No reports submitted yet.</p>
      ) : (
        <ul className="mt-4 max-h-64 overflow-y-auto space-y-3">
          {reports.map((report) => (
            <li
              key={report.id}
              className={`p-4 rounded-lg shadow-sm border transition ${report.logType === "emergency"
                ? "bg-red-50 border-red-300"
                : "bg-gray-50 border-gray-200"
                }`}
              title={`Submitted on ${report.timestamp.toLocaleString()}`}
            >
              <strong
                className={`block mb-1 ${report.logType === "emergency"
                  ? "text-red-600"
                  : "text-gray-800"
                  }`}
              >
                {report.logType === "emergency" ? "🚨 Emergency Report" : "Normal Report"}
              </strong>
              <p className="whitespace-pre-wrap text-gray-700">{report.content}</p>
              <small className="block mt-2 text-gray-600 font-medium">
                Location: {report.location}
              </small>
              <small className="text-gray-500">
                {report.timestamp.toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
