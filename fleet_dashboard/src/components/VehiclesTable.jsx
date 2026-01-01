"use client";

import { useEffect, useState } from "react";
import api from "../api";
import toast from "react-hot-toast";
import { Trash2, Edit2, Plus, Save, X, Download } from "lucide-react";

export default function VehiclesTable({ role, updateFlag }) {
  const [vehicles, setVehicles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    plate_no: "",
    model: "",
    status: "active",
    fuel_level: "",
    odometer: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("plate_no");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles");
      setVehicles(res.data);
    } catch {
      toast.error("Failed to fetch vehicles");
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [updateFlag]);

  const filteredVehicles = vehicles
    .filter(
      (v) =>
        v.plate_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === "fuel_level" || sortField === "odometer") {
        return sortOrder === "asc"
          ? (a[sortField] || 0) - (b[sortField] || 0)
          : (b[sortField] || 0) - (a[sortField] || 0);
      } else {
        return sortOrder === "asc"
          ? (a[sortField] || "").localeCompare(b[sortField] || "")
          : (b[sortField] || "").localeCompare(a[sortField] || "");
      }
    });

  const handleEdit = (v) => {
    setEditingId(v.id);
    setFormData({
      plate_no: v.plate_no,
      model: v.model,
      status: v.status,
      fuel_level: v.fuel_level || "",
      odometer: v.odometer || "",
    });
  };

  const handleSave = async (id) => {
    try {
      await api.put(`/vehicles/${id}`, formData);
      toast.success("Vehicle updated");
      setEditingId(null);
    } catch {
      toast.error("Failed to update vehicle");
    }
  };

  const handleAdd = async () => {
    try {
      await api.post("/vehicles", formData);
      toast.success("Vehicle added");
      setFormData({
        plate_no: "",
        model: "",
        status: "active",
        fuel_level: "",
        odometer: "",
      });
      setShowAddForm(false);
    } catch {
      toast.error("Failed to add vehicle");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/vehicles/${id}`);
      toast.success("Vehicle deleted");
    } catch {
      toast.error("Failed to delete vehicle");
    }
  };

  const exportCSV = () => {
    const header = ["Plate No", "Model", "Status", "Fuel Level", "Odometer"];
    const rows = filteredVehicles.map((v) => [
      v.plate_no,
      v.model,
      v.status,
      v.fuel_level,
      v.odometer,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "vehicles.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported");
  };

  return (
    <div className="space-y-4">
      {/* Top controls */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-center mb-4">
        <input
          placeholder="Search vehicles..."
          className="border rounded px-3 py-2 w-full sm:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-2 mt-2 sm:mt-0 items-center">
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
            <option value="plate_no">Plate No</option>
            <option value="model">Model</option>
            <option value="status">Status</option>
            <option value="fuel_level">Fuel Level</option>
            <option value="odometer">Odometer</option>
          </select>
          <button
            className="border px-2 py-1 rounded hover:bg-gray-100"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "Asc" : "Desc"}
          </button>
          {role === "admin" && (
            <button
              onClick={() => setShowAddForm((prev) => !prev)}
              className="bg-black text-white px-4 py-2 rounded flex items-center gap-1 hover:bg-gray-900"
            >
              <Plus size={16} /> Add Vehicle
            </button>
          )}
        </div>
      </div>

      {/* Add Vehicle Card */}
      {showAddForm && role === "admin" && (
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md mx-auto space-y-3">
          <h3 className="font-bold text-lg">Add New Vehicle</h3>
          <input
            placeholder="Plate No"
            className="border rounded px-3 py-2 w-full"
            value={formData.plate_no}
            onChange={(e) => setFormData({ ...formData, plate_no: e.target.value })}
          />
          <input
            placeholder="Model"
            className="border rounded px-3 py-2 w-full"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          />
          <select
            className="border rounded px-3 py-2 w-full"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>
          <input
            type="number"
            placeholder="Fuel Level (%)"
            className="border rounded px-3 py-2 w-full"
            value={formData.fuel_level}
            onChange={(e) => setFormData({ ...formData, fuel_level: e.target.value })}
          />
          <input
            type="number"
            placeholder="Odometer (km)"
            className="border rounded px-3 py-2 w-full"
            value={formData.odometer}
            onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleAdd}
              className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-1"
            >
              <Save size={16} /> Add
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded flex items-center gap-1"
            >
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Vehicles List */}
      <div className="grid gap-2">
        {filteredVehicles.map((v) => (
          <div
            key={v.id}
            className="bg-white border p-4 rounded-lg flex justify-between items-center"
          >
            {editingId === v.id ? (
              <div className="flex gap-2 flex-1">
                <input
                  value={formData.plate_no}
                  onChange={(e) => setFormData({ ...formData, plate_no: e.target.value })}
                  className="border px-2 py-1 rounded"
                />
                <input
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="border px-2 py-1 rounded"
                />
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="border px-2 py-1 rounded"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
                <input
                  type="number"
                  value={formData.fuel_level}
                  onChange={(e) => setFormData({ ...formData, fuel_level: e.target.value })}
                  className="border px-2 py-1 rounded w-24"
                />
                <input
                  type="number"
                  value={formData.odometer}
                  onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                  className="border px-2 py-1 rounded w-24"
                />
                <button
                  onClick={() => handleSave(v.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                  <Save size={16} /> Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-400 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <p className="font-bold">{v.plate_no}</p>
                  <p className="text-sm">{v.model}</p>
                  <p className="text-xs text-gray-500">Status: {v.status}</p>
                  <p className="text-xs text-gray-500">
                    Fuel: {v.fuel_level || 0}% | Odometer: {v.odometer || 0} km
                  </p>
                </div>
                {role === "admin" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(v)}
                      className="p-1.5 rounded-md hover:bg-gray-100"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="p-1.5 rounded-md hover:text-red-600 hover:bg-white border hover:border-red-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {filteredVehicles.length === 0 && (
          <p className="text-center p-4 text-gray-400">No vehicles found</p>
        )}
      </div>
    </div>
  );
}
