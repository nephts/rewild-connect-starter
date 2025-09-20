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
    <div className="space-y-3">
      {shifts.map(s => {
        const loc = locById[s.locationId]
        const duration = hoursBetween(s.start, s.end)
        const isFull = s.signedUpUserIds.length >= s.max
        const already = s.signedUpUserIds.includes(me.id)
        return (
          <div key={s.id} className="rounded-2xl border border-white/10 p-4">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="space-y-1">
                <div className="font-semibold">{loc?.name}</div>
                <div className="text-sm text-white/70 inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> {s.date}
                  <Clock3 className="h-4 w-4" /> {s.start}–{s.end} ({duration}h)
                </div>
                <div className="text-sm text-white/80">{s.description}</div>
                <div className="text-xs text-white/60">{s.signedUpUserIds.length}/{s.max} signed up</div>
              </div>
              <div className="flex items-center gap-2">
                {already && <div className="text-emerald-400 inline-flex items-center gap-1 text-sm"><CheckCircle2 className="h-4 w-4" /> You're in</div>}
                {!already && (
                  <button
                    disabled={!canSignup || isFull}
                    onClick={() => signup(s.id)}
                    className={
                      canSignup && !isFull ? 'inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-emerald-600 hover:bg-emerald-500' :
                      'inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white/10 text-white/60 cursor-not-allowed'
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
  )
}