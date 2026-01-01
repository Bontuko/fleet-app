"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import DashboardCards from "../components/DashboardCards";
import VehiclesTable from "../components/VehiclesTable";
import CommandsTable from "../components/CommandsTable";
import api from "../api";
import socket from "../socket";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [role, setRole] = useState(localStorage.getItem("role") || "user");
  const [updateFlag, setUpdateFlag] = useState(false);

  useEffect(() => {
    const toggleUpdate = () => setUpdateFlag(f => !f);

    socket.on("vehicle:created", toggleUpdate);
    socket.on("vehicle:updated", toggleUpdate);
    socket.on("vehicle:deleted", toggleUpdate);
    socket.on("command:received", toggleUpdate);
    socket.on("command:updated", toggleUpdate);

    return () => socket.off();
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main className="flex-1 flex flex-col pb-24">
        {/* Header */}
        <header className="h-14 border-b flex items-center justify-between px-8 bg-background sticky top-0 z-30">
          <div>
            <span className="text-xs text-muted-foreground">FLEET_ROOT /</span>
            <h2 className="text-xs font-bold uppercase tracking-widest">{activeSection}</h2>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-12">
          {/* OVERVIEW */}
          {activeSection === "overview" && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Fleet Overview</h1>
              <DashboardCards role={role} updateFlag={updateFlag} />
              {/* No VehiclesTable or CommandsTable here */}
            </div>
          )}

          {/* VEHICLES */}
          {activeSection === "vehicles" && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Fleet Assets</h1>
              <VehiclesTable role={role} updateFlag={updateFlag} />
            </div>
          )}

          {/* COMMANDS */}
          {activeSection === "commands" && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Command Logs</h1>
              <CommandsTable role={role} updateFlag={updateFlag} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
