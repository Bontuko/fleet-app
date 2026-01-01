import React from "react"

export default function StatCard({ label, value, icon }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[140px] transition-all hover:border-primary/50 group">
      {/* Icon */}
      {icon && (
        <div className="mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-muted-foreground group-hover:text-primary transition-colors">
          {icon}
        </div>
      )}

      {/* Text */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest leading-tight">
        {label}
      </p>
      <p className="text-3xl font-bold mt-1 tabular-nums text-foreground">
        {value}
      </p>
    </div>
  )
}
