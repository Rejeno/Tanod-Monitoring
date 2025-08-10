import { NextPage } from "next";

const DataDeletion: NextPage = () => {
  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Data Deletion Instructions</h1>
      <p>Last updated: August 10, 2025</p>

      <p>
        If you would like to delete your account and all associated data from our
        systems, please follow the instructions below.
      </p>

      <h2>How to Request Data Deletion</h2>
      <ol>
        <li>Email us at <a href="mailto:support@yourapp.com">support@yourapp.com</a></li>
        <li>Include your account information (name, email used to register)</li>
        <li>State clearly that you are requesting data deletion</li>
      </ol>

      <p>
        Once we receive your request, we will verify your identity and process
        the deletion within 30 days.
      </p>
    </main>
  );
};

export default DataDeletion;
