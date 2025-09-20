import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { useStore } from '@/lib/store'
import { Leaf, LogIn, TriangleAlert } from 'lucide-react'
import { post, get } from "@/lib/api";

export default function App() {
  const role = useStore(s => s.role)
  const setRole = useStore(s => s.setRole)
  const setMe   = useStore(s => s.setMe)

  React.useEffect(() => {
    (async () => {
      try {
        const { user } = await get('/api/me')
        if (user) {
          setRole(user.role)
          // keep your existing name if backend doesn't have one yet
          setMe({ name: user.first_name || useStore.getState().me?.name, role: user.role })
        }
      } catch {
        // not signed in yet → ignore
      }
    })()
  }, [setRole, setMe])

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-zinc-950 to-black text-white">
      <div className="mx-auto max-w-7xl flex min-h-screen">
        {role !== 'Pending' ? <Sidebar /> : <PendingSidebar />}
        <main className="flex-1 p-6">
          <Header />
          {role === 'Pending' ? <AuthPanel /> : <Outlet />}
        </main>
      </div>
     
    </div>
  )
}

function PendingSidebar() {
  return (
    <div className="w-64 shrink-0 border-r border-white/10 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Leaf className="h-6 w-6" />
        <span className="font-semibold">ReWild Connect</span>
      </div>
      <div className="text-sm text-white/70">Enter an access code to continue.</div>
    </div>
  )
}

function Header() {
  const role = useStore(s => s.role)
  const me = useStore(s => s.me)

  return (
    <header className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Leaf className="h-5 w-5 text-emerald-400" />
        <h1 className="text-xl font-semibold">ReWild Connect</h1>
      </div>
      <div className="flex items-center gap-2">
        {role !== 'Pending' && <div className="text-sm text-white/80">Signed in as <span className="font-medium">{me.name}</span> — {role}</div>}
      </div>
    </header>
  )
}

function AuthPanel() {
  const setRole = useStore(s => s.setRole)
  const setMe   = useStore(s => s.setMe)

  const [mode, setMode] = React.useState<'signup'|'login'|'code'>('signup')
  const [first, setFirst] = React.useState('')
  const [last, setLast] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  const [error, setError] = React.useState('')

  async function refreshMe() {
    const { user } = await get('/api/me')
    if (user) {
      setRole(user.role)
      setMe({ name: user.first_name || user.email?.split('@')[0], role: user.role })
    }
  }

  async function handle(action: 'signup'|'login'|'code') {
    try {
      setError('')
      if (action === 'signup') await post('/api/signup', { firstName:first, lastName:last, email, password })
      if (action === 'login')  await post('/api/login', { email, password })
      if (action === 'code')   await post('/api/enter-code', { code })
      await refreshMe()
      if (action !== 'code') setMode('code') // after signup/login, move to code step
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-2 mb-3">
        <LogIn className="h-5 w-5" />
        <div className="font-medium">
          {mode==='signup' && 'Create your account'}
          {mode==='login'  && 'Sign in'}
          {mode==='code'   && 'Enter access code to unlock'}
        </div>
      </div>

      {mode==='signup' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input className="input" placeholder="First name" value={first} onChange={e=>setFirst(e.target.value)} />
            <input className="input" placeholder="Last name"  value={last}  onChange={e=>setLast(e.target.value)} />
          </div>
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn w-full justify-center" onClick={()=>handle('signup')}>Create account</button>
          <div className="text-xs text-white/60 text-center">Already have an account? <button className="underline" onClick={()=>setMode('login')}>Sign in</button></div>
        </div>
      )}

      {mode==='login' && (
        <div className="space-y-3">
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn w-full justify-center" onClick={()=>handle('login')}>Sign in</button>
          <div className="text-xs text-white/60 text-center">New here? <button className="underline" onClick={()=>setMode('signup')}>Create account</button></div>
        </div>
      )}

      {mode==='code' && (
        <div className="space-y-3">
          <input className="input tracking-widest" placeholder="Access code (e.g., VOL-123)" value={code} onChange={e=>setCode(e.target.value)} />
          <button className="btn w-full justify-center" onClick={()=>handle('code')}>Unlock</button>
          <div className="text-xs text-white/60">Demo codes: VIEW-123, VOL-123, INT-123, ADMIN-123</div>
        </div>
      )}

      {mode!=='code' && (
        <div className="text-xs text-white/60 text-center mt-2">
          After you sign in, you’ll enter an access code to unlock your role.
          <div><button className="underline mt-1" onClick={()=>setMode('code')}>I already have a code</button></div>
        </div>
      )}

      {error && (
        <div className="text-sm text-rose-300 mt-2 inline-flex items-center gap-2">
          <TriangleAlert className="h-4 w-4" /> {error}
        </div>
      )}
    </div>
  )
}

