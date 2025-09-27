import React from 'react'

export function StatCard({ title, value, sub }: { title: string, value: React.ReactNode, sub?: string }) {
  return (
    <div className="card p-5 shadow-lg shadow-emerald-50/80 relative overflow-hidden">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-200 to-sky-200 opacity-40 pointer-events-none" />
      <div className="relative z-10 text-sm font-medium text-slate-500">{title}</div>
      <div className="relative z-10 mt-2 text-3xl font-semibold text-slate-900">{value}</div>
      {sub && <div className="relative z-10 mt-2 text-xs font-semibold uppercase tracking-wide text-emerald-500">{sub}</div>}
    </div>
  )
}
