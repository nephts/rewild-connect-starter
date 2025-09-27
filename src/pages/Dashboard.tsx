import React from 'react'
import { useStore } from '@/lib/store'
import { ROLE_GOAL, IMPACT } from '@/lib/data'
import { StatCard } from '@/components/StatCard'
import { get } from '@/lib/api'

type Announcement = {
  id: string
  title: string
  body: string
  created_at: number
  publish_at: number | null
  expires_at: number | null
}

export function Dashboard() {
  const role = useStore(s => s.role)
  const me = useStore(s => s.me)
  const shifts = useStore(s => s.shifts)
  const myId = me.id
  const nowISO = new Date().toISOString().slice(0,10)
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([])
  const [previousAnnouncements, setPreviousAnnouncements] = React.useState<Announcement[]>([])

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

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await get<{ active?: Announcement[]; previous?: Announcement[] }>('/api/announcements')
        if (!mounted) return
        setAnnouncements(res.active || [])
        setPreviousAnnouncements(res.previous || [])
      } catch {
        if (!mounted) return
        setAnnouncements([])
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const formatTimestamp = (ts: number | null, prefix?: string) => {
    if (!ts) return prefix ? `${prefix}: —` : '—'
    const d = new Date(ts * 1000)
    return `${prefix ? `${prefix}: ` : ''}${d.toLocaleString()}`
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="card p-6 shadow-lg shadow-emerald-50/70 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Welcome back, {me.name || 'volunteer'}!</h2>
          <p className="text-sm text-slate-500">Here’s a quick snapshot of your impact and upcoming commitments.</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-full bg-emerald-100/80 px-4 py-2 text-sm font-medium text-emerald-600">Role: {role}</div>
          <div className="rounded-full bg-sky-100/80 px-4 py-2 text-sm font-medium text-sky-600">Hours: {total}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard title="Role" value={role} />
        <StatCard title="Total Hours" value={total} sub={`${myCompletedHours} completed / ${myUpcomingHours} upcoming`} />
        <StatCard title="CO₂ Saved" value={`${co2} kg`} sub="est. based on hours" />
        <StatCard title="Trees Equivalent" value={`${trees}`} sub="~ trees planted" />

        <div className="md:col-span-2 card p-5 shadow-md shadow-emerald-50/80">
          <div className="font-semibold text-slate-700 mb-3">Goal Progress</div>
          {goal ? <Progress value={total} goal={goal} /> : <div className="text-sm text-slate-500">No fixed hour goal for this role.</div>}
        </div>

      <div className="md:col-span-2 card p-5 shadow-md shadow-emerald-50/80">
        <div className="font-semibold text-slate-700 mb-3">Impact Highlights</div>
        <ul className="text-sm text-slate-600 space-y-2">
          <li className="flex items-center justify-between">
            <span>🚗 Cars off road</span>
            <span className="font-semibold text-slate-800">{cars}</span>
          </li>
          <li className="flex items-center justify-between">
            <span>💧 Water saved</span>
            <span className="font-semibold text-slate-800">{water} L</span>
          </li>
        </ul>
      </div>
      </div>

      <div className="card p-5 shadow-md shadow-emerald-50/80 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Announcements</h3>
            <p className="text-xs text-slate-500">Latest updates from the admin team.</p>
          </div>
        </div>
        <div className="space-y-3">
          {announcements.length === 0 && <div className="text-sm text-slate-500">No announcements right now. Check back soon!</div>}
          {announcements.map(ann => (
            <div key={ann.id} className="rounded-2xl border border-slate-100 bg-white/70 px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{formatTimestamp(ann.publish_at || ann.created_at, 'Posted')}</span>
                {ann.expires_at && <span>{formatTimestamp(ann.expires_at, 'Ends')}</span>}
              </div>
              <div className="text-sm font-semibold text-slate-800 mt-1">{ann.title}</div>
              <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{ann.body}</p>
            </div>
          ))}
        </div>
      </div>

      {previousAnnouncements.length > 0 && (
        <div className="card p-5 shadow-md shadow-emerald-50/80">
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">Previous announcements</summary>
            <ul className="mt-3 space-y-2 text-xs text-slate-500">
              {previousAnnouncements.slice(0, 6).map(ann => (
                <li key={ann.id} className="rounded-2xl bg-slate-50 px-3 py-2">
                  <div className="font-semibold text-slate-700 text-sm">{ann.title}</div>
                  <div>{formatTimestamp(ann.publish_at || ann.created_at)}</div>
                  <p className="mt-1 text-slate-600 text-sm whitespace-pre-wrap">{ann.body}</p>
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </section>
  )
}

function Progress({ value, goal }: { value: number, goal: number }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, goal)) * 100))
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{pct}%</span>
        <span>{value} / {goal} hours</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-emerald-100">
        <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
