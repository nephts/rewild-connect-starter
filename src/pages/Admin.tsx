import React from 'react'
import { useStore } from '@/lib/store'
import { hoursBetween } from '@/lib/data'
import { post, get } from '@/lib/api'
import {
  TriangleAlert,
  Plus,
  RefreshCcw,
  Download,
  Megaphone,
  Mail,
  ShieldCheck,
  UserCog,
  Clock3,
  CalendarDays,
  MapPin,
  ChevronDown,
  Search,
} from 'lucide-react'

const TABS: { id: TabKey; label: string }[] = [
  { id: 'access', label: 'Access Codes' },
  { id: 'locations', label: 'Locations' },
  { id: 'shifts', label: 'Shifts' },
  { id: 'users', label: 'Users' },
]

const ROLES: TabRole[] = ['Viewer', 'Volunteer', 'Intern', 'Admin']

type TabKey = 'access' | 'locations' | 'shifts' | 'users'
type TabRole = 'Viewer' | 'Volunteer' | 'Intern' | 'Admin'

type AccessCode = { code: string; role: string; active: number }
type AdminUser = { id: string; email?: string; first_name?: string; last_name?: string; role: string }
type AuditEntry = { id: string; message: string; at: Date }

export function Admin() {
  const role = useStore(s => s.role)
  if (role !== 'Admin') {
    return (
      <div className="card p-6 text-slate-600 shadow-md shadow-emerald-50/80">
        <div className="inline-flex items-center gap-2 text-amber-500 font-semibold"><TriangleAlert className="h-5 w-5"/> Admins only</div>
        <p className="text-sm mt-2">You do not have permission to access the Admin panel.</p>
      </div>
    )
  }
  return <AdminPanel />
}

function AdminPanel() {
  const storeUsers = useStore(s => s.users)
  const locations = useStore(s => s.locations)
  const shifts = useStore(s => s.shifts)
  const addLocation = useStore(s => s.addLocation)
  const addShift = useStore(s => s.addShift)
  const adjustHours = useStore(s => s.adjustHours)
  const sendMessage = useStore(s => s.send)
  const removeSignup = useStore(s => s.removeSignup)
  const userNotes = useStore(s => s.userNotes)
  const setUserNote = useStore(s => s.setUserNote)

  const [activeTab, setActiveTab] = React.useState<TabKey>('access')
  const [codes, setCodes] = React.useState<AccessCode[]>([])
  const [codeDrafts, setCodeDrafts] = React.useState<Record<string, string>>({})
  const [codesLoading, setCodesLoading] = React.useState(false)

  const [adminUsers, setAdminUsers] = React.useState<AdminUser[]>([])
  const [audit, setAudit] = React.useState<AuditEntry[]>([])

  const [broadcastTitle, setBroadcastTitle] = React.useState('')
  const [broadcastBody, setBroadcastBody] = React.useState('')
  const [broadcastAudience, setBroadcastAudience] = React.useState<'All' | TabRole>('All')
  const [broadcastPublishDate, setBroadcastPublishDate] = React.useState('')
  const [broadcastPublishTime, setBroadcastPublishTime] = React.useState('')
  const [broadcastDuration, setBroadcastDuration] = React.useState('72h')
  const [broadcastExpireDate, setBroadcastExpireDate] = React.useState('')
  const [broadcastExpireTime, setBroadcastExpireTime] = React.useState('')
  const [broadcastStatus, setBroadcastStatus] = React.useState<string>('')

  const [locName, setLocName] = React.useState('')
  const [locAddress, setLocAddress] = React.useState('')
  const [locDesc, setLocDesc] = React.useState('')

  const [shLoc, setShLoc] = React.useState(locations[0]?.id ?? '')
  const [shDate, setShDate] = React.useState('')
  const [shStart, setShStart] = React.useState('')
  const [shEnd, setShEnd] = React.useState('')
  const [shMax, setShMax] = React.useState(10)
  const [shTitle, setShTitle] = React.useState('')
  const [shDescription, setShDescription] = React.useState('')
  const [shNote, setShNote] = React.useState('')

  const [messageDrafts, setMessageDrafts] = React.useState<Record<string, { subject: string; body: string; open: boolean }>>({})
  const [hoursDrafts, setHoursDrafts] = React.useState<Record<string, number>>({})
  const [expandedUser, setExpandedUser] = React.useState<string | null>(null)
  const [userQuery, setUserQuery] = React.useState('')

  const addAudit = React.useCallback((message: string) => {
    setAudit(prev => [{ id: crypto.randomUUID(), message, at: new Date() }, ...prev].slice(0, 20))
  }, [])

  React.useEffect(() => {
    refreshCodes()
    refreshAdminUsers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refreshCodes = async () => {
    try {
      setCodesLoading(true)
      const res = await get<{ ok: boolean; codes: AccessCode[] }>('/api/codes')
      if (res?.codes) {
        setCodes(res.codes.filter(c => Number(c.active) === 1))
        const draft: Record<string, string> = {}
        res.codes.forEach(c => {
          if (Number(c.active) === 1) draft[c.role] = c.code
        })
        setCodeDrafts(draft)
      }
    } finally {
      setCodesLoading(false)
    }
  }

  const refreshAdminUsers = async () => {
    try {
      const res = await get<{ ok: boolean; users: AdminUser[] }>('/api/admin/users')
      if (res?.users) setAdminUsers(res.users)
    } catch {}
  }

  const userMap = React.useMemo(() => Object.fromEntries(storeUsers.map(u => [u.id, u])), [storeUsers])

  const mergedUsers = React.useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return storeUsers.map(u => {
      const full = adminUsers.find(a => a.id === u.id) || { id: u.id, role: u.role }
      const upcoming = shifts.filter(s => s.signedUpUserIds.includes(u.id) && s.date >= today)
      const completed = shifts.filter(s => s.signedUpUserIds.includes(u.id) && s.date < today)
      const upcomingHours = upcoming.reduce((total, s) => total + hoursBetween(s.start, s.end), 0)
      return {
        ...full,
        name: u.name || `${full.first_name || ''} ${full.last_name || ''}`.trim() || 'Unknown',
        role: u.role,
        hours: u.hours || 0,
        upcoming,
        completed,
        upcomingHours,
        note: userNotes[u.id] || '',
      }
    })
  }, [storeUsers, adminUsers, shifts, userNotes])

  const stats = React.useMemo(() => {
    const totalVolunteers = mergedUsers.filter(u => u.role !== 'Pending').length
    const totalHours = mergedUsers.reduce((sum, u) => sum + (u.hours || 0), 0)
    const upcomingShifts = shifts.filter(s => s.date >= new Date().toISOString().slice(0, 10)).length
    const openSlots = shifts.reduce((acc, s) => acc + Math.max(0, s.max - s.signedUpUserIds.length), 0)
    return { totalVolunteers, totalHours, upcomingShifts, openSlots }
  }, [mergedUsers, shifts])

  const handleCodeSave = async (role: string) => {
    const draft = codeDrafts[role]
    if (!draft) return
    try {
      await post('/api/admin/codes', { role, code: draft })
      await refreshCodes()
      addAudit(`Updated access code for ${role}`)
    } catch (err: any) {
      console.error(err)
    }
  }

  const toEpoch = (dateStr: string, timeStr: string) => {
    if (!dateStr) return null
    const time = timeStr || '00:00'
    const iso = `${dateStr}T${time}`
    const ms = Date.parse(iso)
    return Number.isNaN(ms) ? null : Math.floor(ms / 1000)
  }

  const durationToSeconds = (value: string) => {
    switch (value) {
      case '24h': return 24 * 3600
      case '72h': return 72 * 3600
      case '7d': return 7 * 24 * 3600
      case '30d': return 30 * 24 * 3600
      default: return null
    }
  }

  const handleBroadcast = async () => {
    if (!broadcastTitle || !broadcastBody) return
    try {
      setBroadcastStatus('sending')
      const nowTs = Math.floor(Date.now() / 1000)
      const publishAt = toEpoch(broadcastPublishDate, broadcastPublishTime) ?? nowTs

      let expiresAt: number | null = null
      if (broadcastDuration === 'custom') {
        expiresAt = toEpoch(broadcastExpireDate, broadcastExpireTime)
      } else {
        const seconds = durationToSeconds(broadcastDuration)
        if (seconds) expiresAt = publishAt + seconds
      }

      const taggedTitle = broadcastAudience === 'All' ? broadcastTitle : `[${broadcastAudience}] ${broadcastTitle}`
      await post('/api/announcements', {
        title: taggedTitle,
        body: broadcastBody,
        published: true,
        publishAt,
        expiresAt,
      })
      setBroadcastStatus('sent')
      setBroadcastTitle('')
      setBroadcastBody('')
      setBroadcastPublishDate('')
      setBroadcastPublishTime('')
      setBroadcastDuration('72h')
      setBroadcastExpireDate('')
      setBroadcastExpireTime('')
      addAudit(`Broadcast scheduled for ${broadcastAudience}`)
      setTimeout(() => setBroadcastStatus(''), 2500)
    } catch (err: any) {
      setBroadcastStatus('error')
      setTimeout(() => setBroadcastStatus(''), 2500)
    }
  }

  const handleCreateLocation = () => {
    if (!locName.trim()) return
    addLocation(locName.trim(), locAddress.trim(), locDesc.trim())
    addAudit(`Created location ${locName.trim()}`)
    setLocName('')
    setLocAddress('')
    setLocDesc('')
  }

  const handleCreateShift = () => {
    if (!shLoc || !shDate || !shStart || !shEnd || !shTitle.trim()) return
    addShift(shLoc, shDate, shStart, shEnd, shMax, shTitle.trim(), shDescription.trim(), shNote.trim() || undefined)
    addAudit(`Created shift ${shTitle.trim()}`)
    setShDate('')
    setShStart('')
    setShEnd('')
    setShMax(10)
    setShTitle('')
    setShDescription('')
    setShNote('')
  }

  const handleAdjustHours = (userId: string) => {
    const value = hoursDrafts[userId]
    if (!value) return
    adjustHours(userId, value)
    setHoursDrafts(prev => ({ ...prev, [userId]: 0 }))
    addAudit(`Adjusted hours for ${userId} by ${value}`)
  }

  const handleRoleChange = async (userId: string, role: TabRole) => {
    try {
      await post('/api/admin/set-role', { userId, role })
      useStore.setState(state => ({
        users: state.users.map(u => (u.id === userId ? { ...u, role } : u)),
      }))
      setAdminUsers(prev => prev.map(u => (u.id === userId ? { ...u, role } : u)))
      addAudit(`Changed role for ${userId} to ${role}`)
    } catch (err) {
      console.error(err)
    }
  }

  const exportUsersCSV = () => {
    const header = ['Name', 'Email', 'Role', 'Hours', 'Upcoming shifts']
    const rows = mergedUsers.map(u => {
      const upcomingNames = u.upcoming.map(s => `${s.date} ${s.start}-${s.end}`).join('; ')
      return [u.name, u.email || '', u.role, String(u.hours || 0), upcomingNames]
    })
    const csv = [header, ...rows].map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `rewild-users-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    addAudit('Exported users CSV')
  }

  const renderAccessTab = () => (
    <div className="flex flex-col gap-4">
      <div className="card p-5 shadow-md shadow-emerald-50/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Rotate Access Codes</h3>
          <button onClick={refreshCodes} className="inline-flex items-center gap-2 text-sm text-emerald-600">{codesLoading && <RefreshCcw className="h-4 w-4 animate-spin" />}Refresh</button>
        </div>
        <div className="space-y-4">
          {ROLES.map(role => {
            const current = codes.find(c => c.role === role)?.code || '—'
            return (
              <div key={role} className="flex flex-wrap items-end gap-3 border border-slate-100 rounded-2xl px-4 py-3">
                <div className="flex-1 min-w-[220px]">
                  <label className="text-xs font-semibold text-slate-500 block mb-1">{role} code</label>
                  <input
                    className="input"
                    value={codeDrafts[role] || ''}
                    onChange={e => setCodeDrafts(prev => ({ ...prev, [role]: e.target.value.toUpperCase() }))}
                  />
                  <p className="text-xs text-slate-400 mt-1">Current: <span className="font-mono text-slate-500">{current}</span></p>
                </div>
                <button onClick={() => handleCodeSave(role)} className="btn">Save</button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderLocationsTab = () => (
    <div className="flex flex-col gap-4">
      <div className="card p-5 shadow-md shadow-emerald-50/80">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Create Location</h3>
        <div className="space-y-3">
          <input className="input" placeholder="Name" value={locName} onChange={e=>setLocName(e.target.value)} />
          <input className="input" placeholder="Address" value={locAddress} onChange={e=>setLocAddress(e.target.value)} />
          <textarea className="input" rows={3} placeholder="Description" value={locDesc} onChange={e=>setLocDesc(e.target.value)} />
          <button onClick={handleCreateLocation} className="btn w-fit"><Plus className="h-4 w-4" />Add Location</button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {locations.map(loc => (
          <div key={loc.id} className="card p-4 shadow-sm shadow-emerald-50/60 space-y-2">
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-500" /> {loc.name}</div>
            <p className="text-xs text-slate-500">{loc.address}</p>
            <p className="text-sm text-slate-600 leading-5">{loc.description}</p>
            <p className="text-xs uppercase text-emerald-500">Coordinator: {loc.coordinator}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const upcomingShifts = React.useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return shifts.filter(s => s.date >= today).sort((a, b) => a.date.localeCompare(b.date))
  }, [shifts])

  const renderShiftsTab = () => (
    <div className="flex flex-col gap-4">
      <div className="card p-5 shadow-md shadow-emerald-50/80">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Shift</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-3">
            <select className="input" value={shLoc} onChange={e=>setShLoc(e.target.value)}>
              <option value="">Select a location</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <input className="input" placeholder="Shift title" value={shTitle} onChange={e=>setShTitle(e.target.value)} />
            <textarea className="input" rows={3} placeholder="Description" value={shDescription} onChange={e=>setShDescription(e.target.value)} />
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Date</label>
              <input className="input" type="date" value={shDate} onChange={e=>setShDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Start time</label>
                <input className="input" type="time" value={shStart} onChange={e=>setShStart(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">End time</label>
                <input className="input" type="time" value={shEnd} onChange={e=>setShEnd(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Maximum volunteers</label>
              <input
                className="input"
                type="number"
                min={1}
                value={shMax}
                onChange={e=>setShMax(parseInt(e.target.value || '10'))}
              />
              <p className="text-xs text-slate-400 mt-1">Number of participants allowed before signups close.</p>
            </div>
            <textarea className="input" rows={2} placeholder="Special notes (optional)" value={shNote} onChange={e=>setShNote(e.target.value)} />
            <button onClick={handleCreateShift} className="btn w-fit"><Plus className="h-4 w-4" />Create Shift</button>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {upcomingShifts.length === 0 && <div className="text-sm text-slate-400">No upcoming shifts scheduled.</div>}
        {upcomingShifts.map(sh => {
          const loc = locations.find(l => l.id === sh.locationId)
          const participants = `${sh.signedUpUserIds.length} / ${sh.max}`
          const spotsLeft = Math.max(0, sh.max - sh.signedUpUserIds.length)
          return (
            <div key={sh.id} className="card p-4 shadow-sm shadow-emerald-50/60">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-800">{sh.title}</div>
                  <div className="text-xs text-slate-500 uppercase">{loc?.name || 'Unknown location'}</div>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4 text-emerald-500" /> {sh.date}</span>
                  <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4 text-emerald-500" /> {sh.start} – {sh.end}</span>
                  <span>{participants} participants ({spotsLeft} open)</span>
                </div>
              </div>
              {sh.note && <div className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">Note: {sh.note}</div>}
              <div className="mt-3">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Participants</div>
                {sh.signedUpUserIds.length === 0 && <div className="text-xs text-slate-400">No one signed up yet.</div>}
                <ul className="space-y-1">
                  {sh.signedUpUserIds.map(id => {
                    const user = userMap[id]
                    return (
                      <li key={id} className="flex items-center justify-between text-xs text-slate-600 rounded-xl bg-slate-50 px-3 py-2">
                        <span>{user?.name || id}</span>
                        <button
                          onClick={() => { removeSignup(sh.id, id); addAudit(`Removed ${user?.name || id} from ${sh.title}`) }}
                          className="text-rose-500 hover:text-rose-600"
                        >
                          Remove
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const handleToggleUser = (userId: string) => {
    setExpandedUser(prev => {
      const next = prev === userId ? null : userId
      if (prev === userId) {
        setMessageDrafts(drafts => ({
          ...drafts,
          [userId]: drafts[userId] ? { ...drafts[userId], open: false } : drafts[userId],
        }))
      }
      return next
    })
  }

  const filteredUsers = React.useMemo(() => {
    const q = userQuery.trim().toLowerCase()
    const sorted = [...mergedUsers].sort((a, b) => a.name.localeCompare(b.name))
    if (!q) return sorted
    return sorted.filter(u =>
      u.name.toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    )
  }, [mergedUsers, userQuery])

  const renderUsersTab = () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-800">User Management</h3>
          <div className="relative">
            <Search className="h-4 w-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="input pl-9 w-72"
              placeholder="Search by name or email"
              value={userQuery}
              onChange={e => setUserQuery(e.target.value)}
            />
          </div>
        </div>
        <button onClick={exportUsersCSV} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:text-emerald-600"><Download className="h-4 w-4" /> Export CSV</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredUsers.map(user => (
          <div key={user.id} className="card p-4 shadow-sm shadow-emerald-50/60">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                <div className="text-xs text-slate-400">{user.email || 'no email on file'}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 text-emerald-600 px-3 py-1 text-xs font-semibold">{user.role}</span>
                <span className="rounded-full bg-slate-100 text-slate-600 px-3 py-1 text-xs font-semibold">{user.hours || 0}h</span>
                <button
                  onClick={() => handleToggleUser(user.id)}
                  className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                >
                  {expandedUser === user.id ? 'Hide details' : 'View details'}
                  <ChevronDown className={`h-3 w-3 transition-transform ${expandedUser === user.id ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-50 px-3 py-1">Upcoming: {user.upcoming.length}</span>
              <span className="rounded-full bg-slate-50 px-3 py-1">Completed: {user.completed.length}</span>
            </div>

            {expandedUser === user.id && (
              <div className="mt-4 space-y-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Role</label>
                    <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value as TabRole)} className="input">
                      {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Adjust hours</label>
                    <div className="flex gap-2">
                      <input
                        className="input"
                        type="number"
                        value={hoursDrafts[user.id] ?? 0}
                        onChange={e => setHoursDrafts(prev => ({ ...prev, [user.id]: parseFloat(e.target.value) }))}
                      />
                      <button onClick={() => handleAdjustHours(user.id)} className="btn"><ShieldCheck className="h-4 w-4" />Apply</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Admin notes</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Private note for admins"
                    value={user.note}
                    onChange={e => setUserNote(user.id, e.target.value)}
                  />
                  <p className="text-[11px] text-slate-400">Visible only to admins.</p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setMessageDrafts(prev => ({
                      ...prev,
                      [user.id]: { subject: prev[user.id]?.subject || '', body: prev[user.id]?.body || '', open: !prev[user.id]?.open },
                    }))}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:text-emerald-600"
                  >
                    <Mail className="h-4 w-4" /> Quick message
                  </button>
                  {messageDrafts[user.id]?.open && (
                    <div className="space-y-2">
                      <input
                        className="input"
                        placeholder="Subject"
                        value={messageDrafts[user.id]?.subject || ''}
                        onChange={e => setMessageDrafts(prev => ({ ...prev, [user.id]: { ...(prev[user.id] || { open: true, body: '' }), subject: e.target.value, open: true } }))}
                      />
                      <textarea
                        className="input"
                        rows={3}
                        placeholder="Quick message"
                        value={messageDrafts[user.id]?.body || ''}
                        onChange={e => setMessageDrafts(prev => ({ ...prev, [user.id]: { ...(prev[user.id] || { open: true, subject: '' }), body: e.target.value, open: true } }))}
                      />
                      <button
                        className="btn"
                        onClick={() => {
                          const draft = messageDrafts[user.id]
                          if (!draft?.subject || !draft?.body) return
                          sendMessage(user.id, draft.subject, draft.body)
                          setMessageDrafts(prev => ({ ...prev, [user.id]: { subject: '', body: '', open: false } }))
                          addAudit(`Messaged ${user.name}`)
                        }}
                      >
                        Send Message
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Upcoming shifts</div>
                  {user.upcoming.length === 0 && <div className="text-xs text-slate-400">None scheduled.</div>}
                  {user.upcoming.slice(0, 5).map(shift => (
                    <div key={shift.id} className="text-xs text-slate-500 flex items-center gap-2">
                      <CalendarDays className="h-3 w-3 text-emerald-500" /> {shift.date} • {shift.start}-{shift.end}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderTabContent = () => {
    if (activeTab === 'access') return renderAccessTab()
    if (activeTab === 'locations') return renderLocationsTab()
    if (activeTab === 'shifts') return renderShiftsTab()
    return renderUsersTab()
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="card p-6 shadow-lg shadow-emerald-50/70">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Admin Panel</h2>
            <p className="text-sm text-slate-500">Manage locations, users, access codes, and program settings.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center text-xs text-slate-500">
            <Stat label="Volunteers" value={stats.totalVolunteers} />
            <Stat label="Hours Logged" value={stats.totalHours} />
            <Stat label="Upcoming Shifts" value={stats.upcomingShifts} />
            <Stat label="Open Spots" value={stats.openSlots} />
          </div>
        </div>
      </div>

      <div className="card p-5 shadow-md shadow-emerald-50/80">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-3">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={tab.id === activeTab
                ? 'rounded-full bg-emerald-500/10 text-emerald-600 px-4 py-2 text-sm font-semibold'
                : 'rounded-full px-4 py-2 text-sm text-slate-500 hover:text-emerald-600'}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="pt-4">
          {renderTabContent()}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="card p-5 shadow-md shadow-emerald-50/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Quick Broadcast</h3>
              <p className="text-xs text-slate-500">Send an announcement now or schedule it for later.</p>
            </div>
            <Megaphone className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-3">
              <input className="input" placeholder="Title" value={broadcastTitle} onChange={e=>setBroadcastTitle(e.target.value)} />
              <select className="input" value={broadcastAudience} onChange={e=>setBroadcastAudience(e.target.value as any)}>
                <option value="All">All roles</option>
                {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Publish date</label>
                  <input className="input" type="date" value={broadcastPublishDate} onChange={e=>setBroadcastPublishDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Publish time</label>
                  <input className="input" type="time" value={broadcastPublishTime} onChange={e=>setBroadcastPublishTime(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Display duration</label>
                <select className="input" value={broadcastDuration} onChange={e=>setBroadcastDuration(e.target.value)}>
                  <option value="24h">24 hours</option>
                  <option value="72h">3 days</option>
                  <option value="7d">1 week</option>
                  <option value="30d">30 days</option>
                  <option value="custom">Custom end date</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Announcements expire automatically after this time.</p>
              </div>
              {broadcastDuration === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">End date</label>
                    <input className="input" type="date" value={broadcastExpireDate} onChange={e=>setBroadcastExpireDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">End time</label>
                    <input className="input" type="time" value={broadcastExpireTime} onChange={e=>setBroadcastExpireTime(e.target.value)} />
                  </div>
                </div>
              )}
              <textarea className="input" rows={5} placeholder="Write announcement..." value={broadcastBody} onChange={e=>setBroadcastBody(e.target.value)} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button onClick={handleBroadcast} className="btn"><Megaphone className="h-4 w-4" /> Schedule / Send</button>
            {broadcastStatus === 'sending' && <span className="text-xs text-slate-500">Sending…</span>}
            {broadcastStatus === 'sent' && <span className="text-xs text-emerald-600">Announcement saved!</span>}
            {broadcastStatus === 'error' && <span className="text-xs text-rose-500">Failed to send.</span>}
          </div>
        </div>

        <div className="card p-5 shadow-md shadow-emerald-50/80">
          <div className="flex items-center gap-2 mb-3">
            <UserCog className="h-5 w-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-slate-800">Recent Admin Activity</h3>
          </div>
          <ul className="space-y-2 max-h-56 overflow-auto pr-1 text-xs text-slate-500">
            {audit.length === 0 && <li>No recent activity yet.</li>}
            {audit.map(entry => (
              <li key={entry.id} className="rounded-2xl bg-slate-50 px-3 py-2">
                <div className="font-medium text-slate-700">{entry.message}</div>
                <div>{entry.at.toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-900">{value}</div>
    </div>
  )
}
