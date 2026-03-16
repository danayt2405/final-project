import { useState } from "react";

export default function LockPage() {
  const [complaintType, setComplaintType] = useState("");
  const [adminName, setAdminName] = useState("");

  const addComplaintType = async () => {
    await fetch("http://localhost:5000/api/complaints/type", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: complaintType }),
    });
    alert("Complaint type added!");
  };

  const addAdmin = async () => {
    await fetch("http://localhost:5000/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: adminName }),
    });
    alert("Admin added!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Lock Page</h1>

      <div className="mt-4">
        <h2 className="font-semibold">Add Complaint Type</h2>
        <input
          value={complaintType}
          onChange={(e) => setComplaintType(e.target.value)}
          className="border p-2"
        />
        <button
          onClick={addComplaintType}
          className="ml-2 p-2 bg-blue-500 text-white"
        >
          Add
        </button>
      </div>

      <div className="mt-4">
        <h2 className="font-semibold">Add Admin</h2>
        <input
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          className="border p-2"
        />
        <button onClick={addAdmin} className="ml-2 p-2 bg-green-500 text-white">
          Add
        </button>
      </div>
    </div>
  );
}
