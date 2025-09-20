import React, { useMemo } from 'react'
import { useStore } from '@/lib/store'
import { Gauge, MapPin, CalendarDays, Images, MessageSquare, ShieldCheck, LogOut, Leaf } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const cx = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(' ')

export function Sidebar() {
  const role = useStore(s => s.role)
  const logout = useStore(s => s.logout)
  const { pathname } = useLocation()

  const links = useMemo(() => {
    const common = [
      { to: '/', label: 'Dashboard', icon: Gauge },
      { to: '/locations', label: 'Locations', icon: MapPin },
      { to: '/shifts', label: 'Shifts', icon: CalendarDays },
      { to: '/photos', label: 'Photos', icon: Images },
    ]
    const extended = [{ to: '/messages', label: 'Messages', icon: MessageSquare }]
    const admin = [{ to: '/admin', label: 'Admin', icon: ShieldCheck }]

    if (role === 'Pending') return []
    if (role === 'Viewer') return common
    if (role === 'Volunteer' || role === 'Intern') return [...common, ...extended]
    if (role === 'Admin') return [...common, ...extended, ...admin]
    return common
  }, [role])

  return (
    <div className="h-full w-64 shrink-0 border-r border-white/10 bg-gradient-to-b from-emerald-900/40 to-zinc-900/40 backdrop-blur">
      <div className="p-4 flex items-center gap-2 border-b border-white/10">
        <Leaf className="h-6 w-6" />
        <span className="font-semibold">ReWild Connect</span>
      </div>
      <nav className="p-2 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cx(
              'w-full flex items-center gap-3 px-3 py-2 rounded-xl',
              pathname === to ? 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40' : 'hover:bg-white/5'
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <button onClick={logout} className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 hover:bg-white/5">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  )
}