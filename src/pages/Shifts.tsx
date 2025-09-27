import React from 'react'
import { useStore } from '@/lib/store'
import { CalendarDays, Clock3, Plus, Lock, CheckCircle2 } from 'lucide-react'
import { hoursBetween } from '@/lib/data'

export function Shifts() {
  const role = useStore(s => s.role)
  const me = useStore(s => s.me)
  const shifts = useStore(s => s.shifts)
  const locations = useStore(s => s.locations)
  const signup = useStore(s => s.signup)

  const canSignup = role === 'Volunteer' || role === 'Intern' || role === 'Admin'
  const locById = Object.fromEntries(locations.map(l => [l.id, l]))

  return (
    <section className="flex flex-col gap-6">
      <div className="card p-6 shadow-lg shadow-emerald-50/70 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Volunteer Shifts</h2>
          <p className="text-sm text-slate-500">Sign up for upcoming workdays and track site capacity in real time.</p>
        </div>
      </div>

      <div className="space-y-4">
        {shifts.map(s => {
          const loc = locById[s.locationId]
          const duration = hoursBetween(s.start, s.end)
          const isFull = s.signedUpUserIds.length >= s.max
          const already = s.signedUpUserIds.includes(me.id)
          const spotsLeft = Math.max(0, s.max - s.signedUpUserIds.length)
          const title = s.title || loc?.name || 'Volunteer shift'
          return (
            <div key={s.id} className="card p-5 shadow-md shadow-emerald-50/80">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="space-y-1">
                <div className="font-semibold text-lg text-slate-900">{title}</div>
                <div className="text-xs uppercase text-emerald-500">{loc?.name || 'Unknown location'}</div>
                <div className="text-sm text-slate-500 inline-flex items-center gap-3">
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4 text-emerald-500" /> {s.date}</span>
                  <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4 text-emerald-500" /> {s.start}–{s.end} ({duration}h)</span>
                </div>
                <div className="text-sm text-slate-600 leading-5">{s.description}</div>
                <div className="text-xs font-medium text-slate-500">{s.signedUpUserIds.length} of {s.max} spots filled — {spotsLeft} remaining</div>
                {s.note && <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">Note: {s.note}</div>}
              </div>
              <div className="flex items-center gap-2">
                {already && <div className="text-emerald-500 inline-flex items-center gap-1 text-sm font-medium"><CheckCircle2 className="h-4 w-4" /> You're in</div>}
                {!already && (
                  <button
                    disabled={!canSignup || isFull}
                    onClick={() => signup(s.id)}
                    className={
                      canSignup && !isFull ? 'btn' :
                      'inline-flex items-center gap-2 rounded-full px-4 py-2 bg-slate-100 text-slate-400 cursor-not-allowed'
                    }>
                    {isFull ? <Lock className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {isFull ? 'Full' : 'Sign up'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
        })}
      </div>
    </section>
  )
}
