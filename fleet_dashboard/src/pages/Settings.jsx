import { useState } from "react";
import api from "../api";
import toast from "react-hot-toast";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put("/auth/settings", { username, password });
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Settings</h1>
      <form onSubmit={handleUpdate} className="space-y-4 max-w-sm">
        <div>
          <label className="block text-sm">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
}
