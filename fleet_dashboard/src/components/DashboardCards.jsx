"use client"

import { useEffect, useState } from "react"
import api from "../api"
import socket from "../socket"
import { FaCar, FaTools, FaClipboardList, FaCarCrash } from "react-icons/fa"
import StatCard from "./StatCard"

export default function DashboardCards() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    offline: 0,  // ✅ added
    queued: 0,
  })

  const fetchStats = async () => {
    try {
      const vehiclesRes = await api.get("/vehicles")
      const commandsRes = await api.get("/commands")

      const vehicles = vehiclesRes.data || []
      const commands = commandsRes.data || []

      setStats({
        total: vehicles.length,
        active: vehicles.filter((v) => v.status === "active").length,
        maintenance: vehicles.filter((v) => v.status === "maintenance").length,
        offline: vehicles.filter((v) => v.status === "offline").length, // ✅ added
        queued: commands.filter((c) => c.status === "queued").length,
      })
    } catch (err) {
      console.error("Failed to fetch stats", err)
    }
  }

  useEffect(() => {
    fetchStats()
    socket.on("vehicle:created", fetchStats)
    socket.on("vehicle:updated", fetchStats)
    socket.on("vehicle:deleted", fetchStats)
    socket.on("command:received", fetchStats)
    socket.on("command:updated", fetchStats)

    return () => {
      socket.off("vehicle:created", fetchStats)
      socket.off("vehicle:updated", fetchStats)
      socket.off("vehicle:deleted", fetchStats)
      socket.off("command:received", fetchStats)
      socket.off("command:updated", fetchStats)
    }
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      <StatCard label="Total Vehicles" value={stats.total} icon={<FaCar />} />
      <StatCard label="Active Vehicles" value={stats.active} icon={<FaCar />} />
      <StatCard label="Maintenance" value={stats.maintenance} icon={<FaTools />} />
      <StatCard label="Offline Vehicles" value={stats.offline} icon={<FaCarCrash />} /> {/* ✅ new */}
      <StatCard label="Queued Commands" value={stats.queued} icon={<FaClipboardList />} />
    </div>
  )
}
