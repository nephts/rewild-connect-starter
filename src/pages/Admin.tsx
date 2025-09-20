import React from 'react'
import { useStore } from '@/lib/store'
import { TriangleAlert, ShieldCheck, Plus } from 'lucide-react'

export function Admin() {
  const role = useStore(s => s.role)
  if (role !== 'Admin') {
    return (
      <div className="rounded-2xl border border-white/10 p-6 text-white/80">
        <div className="inline-flex items-center gap-2 text-amber-300"><TriangleAlert className="h-5 w-5"/> Admins only</div>
        <p className="text-sm mt-2">You do not have permission to access the Admin panel.</p>
      </div>
    )
  }
  return <AdminPanel />
}

function AdminPanel() {
  const users = useStore(s => s.users)
  const locations = useStore(s => s.locations)
  const addLocation = useStore(s => s.addLocation)
  const addShift = useStore(s => s.addShift)
  const adjustHours = useStore(s => s.adjustHours)

  const [locName, setLocName] = React.useState('')
  const [locAddress, setLocAddress] = React.useState('')
  const [locDesc, setLocDesc] = React.useState('')

  const [shLoc, setShLoc] = React.useState(locations[0]?.id ?? '')
  const [shDate, setShDate] = React.useState('')
  const [shStart, setShStart] = React.useState('')
  const [shEnd, setShEnd] = React.useState('')
  const [shMax, setShMax] = React.useState(10)

  const [hoursUser, setHoursUser] = React.useState(users[0]?.id ?? '')
  const [hoursDelta, setHoursDelta] = React.useState(1)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-white/10 p-4 space-y-2">
        <div className="font-medium">Create Location</div>
        <input className="input" placeholder="Name" value={locName} onChange={e=>setLocName(e.target.value)} />
        <input className="input" placeholder="Address" value={locAddress} onChange={e=>setLocAddress(e.target.value)} />
        <textarea className="input" rows={3} placeholder="Description" value={locDesc} onChange={e=>setLocDesc(e.target.value)} />
        <button onClick={()=>{ if(!locName) return; addLocation(locName, locAddress, locDesc); setLocName(''); setLocAddress(''); setLocDesc(''); }} className="btn">
          <Plus className="h-4 w-4" /> Add Location
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 p-4 space-y-2">
        <div className="font-medium">Create Shift</div>
        <select className="input" value={shLoc} onChange={e=>setShLoc(e.target.value)}>
          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <input className="input" type="date" value={shDate} onChange={e=>setShDate(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className="input" type="time" value={shStart} onChange={e=>setShStart(e.target.value)} />
          <input className="input" type="time" value={shEnd} onChange={e=>setShEnd(e.target.value)} />
        </div>
        <input className="input" type="number" min={1} value={shMax} onChange={e=>setShMax(parseInt(e.target.value || '10'))} />
        <button onClick={()=>{ if(!shDate||!shStart||!shEnd) return; addShift(shLoc, shDate, shStart, shEnd, shMax); setShDate(''); setShStart(''); setShEnd(''); setShMax(10); }} className="btn">
          <Plus className="h-4 w-4" /> Add Shift
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 p-4 space-y-2">
        <div className="font-medium">Adjust User Hours</div>
        <select className="input" value={hoursUser} onChange={e=>setHoursUser(e.target.value)}>
          {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
        </select>
        <input className="input" type="number" value={hoursDelta} onChange={e=>setHoursDelta(parseFloat(e.target.value || '0'))} />
        <button onClick={()=>adjustHours(hoursUser, hoursDelta)} className="btn">
          <ShieldCheck className="h-4 w-4" /> Apply
        </button>
      </div>
    </div>
  )
}