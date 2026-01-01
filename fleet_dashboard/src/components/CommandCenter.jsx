// src/pages/CommandsPage.jsx
import { useEffect, useState } from "react";
import api from "../api";
import socket from "../socket";
import toast from "react-hot-toast";
import { Send } from "lucide-react";

export default function CommandsPage() {
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [requesterName, setRequesterName] = useState(""); // only admin
  const [commands, setCommands] = useState([]);

  // Fetch user info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = JSON.parse(atob(token.split(".")[1])); // decode JWT payload
    setRole(payload.role);
    setUsername(payload.username);
  }, []);

  // Fetch commands
  const fetchCommands = async () => {
    try {
      const res = await api.get("/commands");
      let data = res.data;
      if (role === "user") {
        data = data.filter((c) => c.requester_name === username);
      }
      setCommands(data);
    } catch (err) {
      toast.error("Failed to fetch commands");
    }
  };

  useEffect(() => {
    fetchCommands();
    socket.on("command:received", fetchCommands);
    socket.on("command:updated", fetchCommands);
    return () => socket.off();
  }, [role, username]);

  // Submit command
  const submitCommand = async () => {
    if (role === "user" && !message.trim()) return toast.error("Command required");
    if (role === "admin" && (!requesterName.trim() || !message.trim()))
      return toast.error("Requester and Command required");

    try {
      if (role === "user") {
        await api.post("/commands", { message });
      } else {
        await api.post("/commands", { requester_name: requesterName, message });
      }
      toast.success("Command sent successfully");
      setMessage("");
      setRequesterName("");
    } catch {
      toast.error("Failed to send command");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold">Commands</h2>

      {/* Input Form */}
      <div className="flex gap-2">
        {role === "admin" && (
          <input
            value={requesterName}
            onChange={(e) => setRequesterName(e.target.value)}
            placeholder="Requester Name"
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          />
        )}
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Command"
          className="flex-2 border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          onKeyDown={(e) => e.key === "Enter" && submitCommand()}
        />
        <button
          onClick={submitCommand}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Send size={16} /> Send
        </button>
      </div>

      {/* Commands Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg mt-4">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {role === "admin" && <th className="p-3 text-left border-b">Requester</th>}
              <th className="p-3 text-left border-b">Message</th>
              <th className="p-3 text-left border-b">Status</th>
              <th className="p-3 text-left border-b">Created At</th>
            </tr>
          </thead>
          <tbody>
            {commands.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 border-b last:border-b-0">
                {role === "admin" && <td className="p-3">{c.requester_name}</td>}
                <td className="p-3">{c.message}</td>
                <td className="p-3">{c.status}</td>
                <td className="p-3">{new Date(c.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {commands.length === 0 && (
              <tr>
                <td colSpan={role === "admin" ? 4 : 3} className="text-center p-4 text-gray-400">
                  No commands found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
