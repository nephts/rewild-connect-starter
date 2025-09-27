import React from 'react'
import { useStore } from '@/lib/store'
import { CalendarDays, Clock3, Users } from 'lucide-react'
import { hoursBetween } from '@/lib/data'

export function Locations() {
  const locations = useStore(s => s.locations)
  const shifts = useStore(s => s.shifts)
  const [expanded, setExpanded] = React.useState<string | null>(null)
  const today = new Date().toISOString().slice(0, 10)

  return (
    <section className="flex flex-col gap-6">
      <div className="card p-6 shadow-lg shadow-emerald-50/70 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Project Locations</h2>
          <p className="text-sm text-slate-500">Explore active restoration sites and what volunteers tackle onsite.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {locations.map(loc => {
          const upcoming = shifts
            .filter(s => s.locationId === loc.id && s.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date))
          const isOpen = expanded === loc.id
          return (
            <div key={loc.id} className="card overflow-hidden shadow-md shadow-emerald-50/80">
              {loc.images[0] && <img src={loc.images[0]} alt={loc.name} className="h-36 w-full object-cover" />}
              <div className="p-5 space-y-3 text-slate-600">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{loc.name}</div>
                    <div className="text-sm text-slate-500">{loc.address}</div>
                  </div>
                  <button
                    onClick={() => setExpanded(prev => prev === loc.id ? null : loc.id)}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 rounded-full bg-emerald-50 px-3 py-1"
                  >
                    {isOpen ? 'Hide shifts' : 'View shifts'}
                  </button>
                </div>
                <p className="text-sm leading-5">{loc.description}</p>
                <div className="text-xs uppercase tracking-wide text-emerald-500">Coordinator: {loc.coordinator}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {loc.activities.map(a => <span key={a} className="rounded-full bg-emerald-100/70 text-emerald-700 px-3 py-1 text-xs font-medium">{a}</span>)}
                </div>

                {isOpen && (
                  <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                    <div className="text-xs font-semibold text-slate-500 uppercase">Upcoming shifts</div>
                    {upcoming.length === 0 && <div className="text-xs text-slate-400">No upcoming shifts at this location.</div>}
                    {upcoming.map(shift => {
                      const duration = hoursBetween(shift.start, shift.end)
                      const spotsLeft = Math.max(0, shift.max - shift.signedUpUserIds.length)
                      return (
                        <div key={shift.id} className="rounded-2xl bg-slate-50 border border-slate-100 px-3 py-3 text-xs text-slate-500 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-slate-700 text-sm">{shift.title}</div>
                            <span className="inline-flex items-center gap-1 text-emerald-600"><Users className="h-3 w-3" /> {shift.signedUpUserIds.length}/{shift.max} ({spotsLeft} open)</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3 text-emerald-500" /> {shift.date}</span>
                            <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3 text-emerald-500" /> {shift.start} – {shift.end} ({duration}h)</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-5">{shift.description}</p>
                          {shift.note && <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">Note: {shift.note}</div>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
