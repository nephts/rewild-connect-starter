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
    <div className="w-64 shrink-0 rounded-3xl bg-gradient-to-b from-emerald-100/70 via-white to-white border border-emerald-100 px-6 py-6 shadow-sm flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-1 pb-6 border-b border-emerald-100/60 text-emerald-600">
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6" />
          <span className="font-semibold text-slate-800">ReWild Connect</span>
        </div>
        <span className="text-xs uppercase tracking-wide text-emerald-500/80">Summer Program</span>
      </div>
      <nav className="space-y-4 text-sm font-medium text-slate-600 flex-1 pt-6">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cx(
              'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition',
              pathname === to
                ? 'bg-gradient-to-r from-emerald-400 to-sky-400 text-white shadow-md shadow-emerald-100/60'
                : 'hover:bg-emerald-100/70 hover:text-emerald-700'
            )}
          >
            <Icon className={cx('h-5 w-5', pathname === to ? 'text-white' : 'text-emerald-500/80')} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="pt-6 border-t border-emerald-100/60 mt-auto">
        <button
          onClick={logout}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200/70 px-3 py-2 text-slate-600 hover:text-rose-500 hover:border-rose-200 transition"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  )
}
