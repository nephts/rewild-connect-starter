import React from 'react'
import { useStore } from '@/lib/store'

export function Locations() {
  const locations = useStore(s => s.locations)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {locations.map(loc => (
        <div key={loc.id} className="rounded-2xl border border-white/10 overflow-hidden">
          {loc.images[0] && <img src={loc.images[0]} alt={loc.name} className="h-36 w-full object-cover" />}
          <div className="p-4 space-y-2">
            <div className="text-lg font-semibold">{loc.name}</div>
            <div className="text-sm text-white/70">{loc.address}</div>
            <p className="text-sm text-white/80">{loc.description}</p>
            <div className="text-xs text-white/60">Coordinator: {loc.coordinator}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {loc.activities.map(a => <span key={a} className="rounded-full bg-white/5 px-2 py-1 text-xs">{a}</span>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}