import React from 'react'

export function StatCard({ title, value, sub }: { title: string, value: React.ReactNode, sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4">
      <div className="text-sm/5 text-white/70">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {sub && <div className="mt-1 text-xs text-white/50">{sub}</div>}
    </div>
  )
}