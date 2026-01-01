"use client"

import { LayoutDashboard, Truck, MessageSquare, Settings, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Sidebar({ activeSection, setActiveSection }) {
  const navigate = useNavigate()

  const items = [
    { label: "Overview", icon: <LayoutDashboard size={20} />, id: "overview" },
    { label: "Vehicles", icon: <Truck size={20} />, id: "vehicles" },
    { label: "Commands", icon: <MessageSquare size={20} />, id: "commands" },
  ]

  return (
    <div className="w-72 bg-card border-r border-border h-screen flex flex-col p-6 sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
          <Truck className="text-primary-foreground" size={18} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">FleetCore</h1>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
              activeSection === item.id
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <span
              className={`${
                activeSection === item.id
                  ? "text-primary-foreground"
                  : "text-muted-foreground group-hover:text-primary"
              }`}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Settings & Logout */}
      <div className="pt-6 border-t border-border space-y-1">
        <button
          onClick={() => navigate("/settings")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-all"
        >
          <Settings size={20} /> Settings
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("token")
            navigate("/login")
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-all"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  )
}
