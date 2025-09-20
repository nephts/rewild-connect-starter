import React from 'react'
import { useStore } from '@/lib/store'
import { ROLE_GOAL, IMPACT } from '@/lib/data'
import { StatCard } from '@/components/StatCard'

export function Dashboard() {
  const role = useStore(s => s.role)
  const me = useStore(s => s.me)
  const shifts = useStore(s => s.shifts)
  const myId = me.id
  const nowISO = new Date().toISOString().slice(0,10)

  const mySignups = shifts.filter(s => s.signedUpUserIds.includes(myId))
  const hoursBetween = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    return Math.max(0, (eh + em/60) - (sh + sm/60))
  }
  const myUpcomingHours = mySignups.filter(s => s.date >= nowISO).reduce((a,s)=>a+hoursBetween(s.start,s.end),0)
  const myCompletedHours = mySignups.filter(s => s.date < nowISO).reduce((a,s)=>a+hoursBetween(s.start,s.end),0)

  const goal = ROLE_GOAL[role] || 0
  const total = myUpcomingHours + myCompletedHours
  const co2 = Math.round(total * IMPACT.co2PerHourKg)
  const trees = Math.round(total * IMPACT.treesPerHour * 10) / 10
  const cars = Math.round(total * IMPACT.carsOffPer10h * 10) / 10
  const water = total * IMPACT.litersWaterPerHour

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard title="Role" value={role} />
      <StatCard title="Total Hours" value={total} sub={`${myCompletedHours} completed / ${myUpcomingHours} upcoming`} />
      <StatCard title="CO₂ Saved" value={`${co2} kg`} sub="est. based on hours" />
      <StatCard title="Trees Equivalent" value={`${trees}`} sub="~ trees planted" />

      <div className="md:col-span-2 rounded-2xl border border-white/10 p-4">
        <div className="font-medium mb-2">Goal Progress</div>
        {goal ? <Progress value={total} goal={goal} /> : <div className="text-sm text-white/60">No fixed hour goal for this role.</div>}
      </div>

      <div className="md:col-span-2 rounded-2xl border border-white/10 p-4">
        <div className="font-medium mb-2">Impact Highlights</div>
        <ul className="text-sm text-white/80 space-y-1">
          <li>🚗 Cars off road: {cars}</li>
          <li>💧 Water saved: {water} L</li>
        </ul>
      </div>
    </div>
  )
}

function Progress({ value, goal }: { value: number, goal: number }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, goal)) * 100))
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-white/70">
        <span>{pct}%</span>
        <span>{value} / {goal} hours</span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}