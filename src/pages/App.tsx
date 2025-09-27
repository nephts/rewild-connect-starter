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
          setMe({ id: user.id, name: user.first_name || useStore.getState().me?.name, role: user.role })
        }
      } catch {
        // not signed in yet → ignore
      }
    })()
  }, [setRole, setMe])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-white text-slate-700">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] items-stretch gap-8 px-8 py-8">
        {role !== 'Pending' ? <Sidebar /> : <PendingSidebar />}
        <main className="flex-1 pb-12 flex flex-col gap-8">
          <Header />
          {role === 'Pending' ? <AuthPanel /> : <Outlet />}
        </main>
      </div>

    </div>
  )
}

function PendingSidebar() {
  return (
    <div className="w-64 shrink-0 rounded-3xl bg-white/80 border border-emerald-100/60 backdrop-blur px-5 py-6 flex flex-col">
      <div className="flex items-center gap-2 mb-6 text-emerald-600">
        <Leaf className="h-6 w-6" />
        <span className="font-semibold">ReWild Connect</span>
      </div>
      <div className="text-sm text-slate-500 leading-5">Enter an access code to continue.</div>
    </div>
  )
}

function Header() {
  const role = useStore(s => s.role)
  const me = useStore(s => s.me)

  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Leaf className="h-5 w-5 text-emerald-500" />
        <h1 className="text-2xl font-semibold text-slate-900">ReWild Connect</h1>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {role !== 'Pending' && <div>Signed in as <span className="font-medium text-slate-700">{me.name}</span> — {role}</div>}
      </div>
    </header>
  )
}

function AuthPanel() {
  const setRole = useStore(s => s.setRole)
  const setMe   = useStore(s => s.setMe)
  const localLogin = useStore(s => s.login)
  const me = useStore(s => s.me)

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
      setMe({ id: user.id, name: user.first_name || user.email?.split('@')[0], role: user.role })
    }
  }

  async function handle(action: 'signup'|'login'|'code') {
    setError('')

    if (action === 'signup') {
      try {
        await post('/api/signup', { firstName:first, lastName:last, email, password })
        await refreshMe()
        setMode('code')
      } catch (e: any) {
        setError(e.message || 'Something went wrong')
      }
      return
    }

    if (action === 'login') {
      try {
        await post('/api/login', { email, password })
        await refreshMe()
        setMode('code')
      } catch (e: any) {
        setError(e.message || 'Something went wrong')
      }
      return
    }

    const normalizedCode = code.trim().toUpperCase()
    if (!normalizedCode) {
      setError('Access code required')
      return
    }

    try {
      const result = await post('/api/enter-code', { code: normalizedCode }) as any
      if (result?.role) {
        setRole(result.role)
        setMe({ role: result.role })
      }
      await refreshMe()
      return
    } catch (e: any) {
      const message = e?.message || ''
      const networkFailure = message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('network')
      if (!networkFailure) {
        setError(message || 'Something went wrong')
        return
      }
      const fallbackName = [first, last].filter(Boolean).join(' ') || me.name || 'You'
      const result = localLogin(normalizedCode, fallbackName)
      if (result.ok) return
      setError(result.msg || message || 'Something went wrong')
    }
  }

  return (
    <div className="mx-auto max-w-md card p-6 shadow-lg shadow-emerald-100/60">
      <div className="flex items-center gap-2 mb-4 text-slate-700">
        <LogIn className="h-5 w-5 text-emerald-500" />
        <div className="font-semibold">
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
          <div className="text-xs text-slate-500 text-center">Already have an account? <button className="underline text-emerald-500" onClick={()=>setMode('login')}>Sign in</button></div>
        </div>
      )}

      {mode==='login' && (
        <div className="space-y-3">
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn w-full justify-center" onClick={()=>handle('login')}>Sign in</button>
          <div className="text-xs text-slate-500 text-center">New here? <button className="underline text-emerald-500" onClick={()=>setMode('signup')}>Create account</button></div>
        </div>
      )}

      {mode==='code' && (
        <div className="space-y-3">
          <input className="input tracking-widest" placeholder="Access code (e.g., VOL-123)" value={code} onChange={e=>setCode(e.target.value)} />
          <button className="btn w-full justify-center" onClick={()=>handle('code')}>Unlock</button>
          <div className="text-xs text-slate-500">Demo codes: VIEW-123, VOL-123, INT-123, ADMIN-123</div>
        </div>
      )}

      {mode!=='code' && (
        <div className="text-xs text-slate-500 text-center mt-2">
          After you sign in, you’ll enter an access code to unlock your role.
          <div><button className="underline mt-1 text-emerald-500" onClick={()=>setMode('code')}>I already have a code</button></div>
        </div>
      )}

      {error && (
        <div className="text-sm text-rose-500 mt-2 inline-flex items-center gap-2">
          <TriangleAlert className="h-4 w-4" /> {error}
        </div>
      )}
    </div>
  )
}
