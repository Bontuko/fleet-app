"use client";

import { useState, useEffect } from "react";
import api from "../api";
import socket from "../socket";
import toast from "react-hot-toast";
import { Send, MessageCircle, Download } from "lucide-react";

export default function CommandsTable({ role }) {
  const [commands, setCommands] = useState([]);
  const [message, setMessage] = useState(""); // user/admin new command
  const [replyingId, setReplyingId] = useState(null); // which command admin is replying to
  const [replyMessage, setReplyMessage] = useState(""); // admin reply
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch commands
  const fetchCommands = async () => {
    try {
      const res = await api.get("/commands");
      setCommands(res.data);
    } catch {
      toast.error("Failed to fetch commands");
    }
  };

  useEffect(() => {
    fetchCommands();
    socket.on("command:received", fetchCommands);
    socket.on("command:updated", fetchCommands);
    return () => socket.off();
  }, []);

  // User / Admin sends new command
  const sendCommand = async () => {
    if (!message) return toast.error("Command required");
    try {
      await api.post("/commands", { message });
      setMessage("");
      toast.success("Command sent");
    } catch {
      toast.error("Failed to send command");
    }
  };

  // Admin reply to a queued command
  const sendReply = async (commandId) => {
    if (!replyMessage) return toast.error("Reply required");
    try {
      await api.put(`/commands/${commandId}/reply`, { response: replyMessage });
      setReplyingId(null);
      setReplyMessage("");
      toast.success("Replied successfully");
    } catch {
      toast.error("Failed to send reply");
    }
  };

  // Filtered & sorted commands
  const filteredCommands = commands
    .filter((c) =>
      c.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.response || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.requester_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === "created_at") {
        return sortOrder === "asc"
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      } else {
        return sortOrder === "asc"
          ? (a[sortField] || "").localeCompare(b[sortField] || "")
          : (b[sortField] || "").localeCompare(a[sortField] || "");
      }
    });

  // Export to CSV
  const exportCSV = () => {
    const header = ["Requester", "Message", "Response", "Status", "Created At"];
    const rows = filteredCommands.map((c) => [
      c.requester_name,
      c.message,
      c.response || "",
      c.status,
      new Date(c.created_at).toLocaleString(),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "commands.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Top controls */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
        <input
          placeholder="Search..."
          className="border rounded px-3 py-2 w-full sm:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={exportCSV}
            className="bg-gray-800 text-white px-4 py-2 rounded flex items-center gap-1 hover:bg-gray-900"
          >
            <Download size={16} /> Export CSV
          </button>
          <select
            className="border px-2 py-1 rounded"
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="created_at">Date</option>
            <option value="status">Status</option>
            <option value="requester_name">Requester</option>
          </select>
          <button
            className="border px-2 py-1 rounded hover:bg-gray-100"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "Asc" : "Desc"}
          </button>
        </div>
      </div>

      {/* Commands table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left border-b">Requester</th>
              <th className="p-3 text-left border-b">Message</th>
              <th className="p-3 text-left border-b">Response</th>
              <th className="p-3 text-left border-b">Status</th>
              <th className="p-3 text-left border-b">Created At</th>
              {role === "admin" && <th className="p-3 text-left border-b">Action</th>}
            </tr>
          </thead>
          <tbody>
            {filteredCommands.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 border-b last:border-b-0">
                <td className="p-3">{c.requester_name}</td>
                <td className="p-3">{c.message}</td>
                <td className="p-3">{c.response || "-"}</td>
                <td className="p-3">{c.status}</td>
                <td className="p-3">{new Date(c.created_at).toLocaleString()}</td>

                {/* Admin reply action */}
                {role === "admin" && (
                  <td className="p-3">
                    {c.status === "queued" ? (
                      replyingId === c.id ? (
                        <div className="flex gap-2">
                          <input
                            className="border px-2 py-1 rounded flex-1"
                            placeholder="Write reply"
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                          />
                          <button
                            onClick={() => sendReply(c.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
                          >
                            <Send size={16} /> Send
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingId(c.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                        >
                          <MessageCircle size={16} /> Reply
                        </button>
                      )
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {filteredCommands.length === 0 && (
              <tr>
                <td
                  colSpan={role === "admin" ? 6 : 5}
                  className="text-center p-4 text-gray-400"
                >
                  No commands found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* USER input for new command */}
      {role !== "admin" && (
        <div className="bg-white shadow rounded-lg p-4 flex gap-2 items-center">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter command..."
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            onKeyDown={(e) => e.key === "Enter" && sendCommand()}
          />
          <button
            onClick={sendCommand}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Send size={16} /> Send
          </button>
        </div>
      )}
    </div>
  );
}
