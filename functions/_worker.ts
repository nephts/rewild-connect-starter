// functions/_worker.ts
import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import * as bcrypt from 'bcryptjs'

// Cloudflare provides the D1Database binding at runtime via c.env.DB
type Role = 'Pending' | 'Viewer' | 'Volunteer' | 'Intern' | 'Admin' | 'SuperAdmin'

type User = {
  id: string
  email: string
  password_hash: string | null
  first_name: string | null
  last_name: string | null
  role: Role
  created_at: number
}

type Bindings = { DB: D1Database }

const app = new Hono<{ Bindings: Bindings }>()

// ---------- helpers ----------
const uid = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
const now = () => Date.now()

async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const row = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<User>()
  return row ?? null
}

async function getUserById(db: D1Database, id: string): Promise<User | null> {
  const row = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<User>()
  return row ?? null
}

// middleware: requireUser and requireRole
const requireUser = async (c: any, next: any) => {
  const userId = getCookie(c, 'uid')
  if (!userId) return c.json({ error: 'unauthorized' }, 401)
  const user = await getUserById(c.env.DB, userId)
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  c.set('user', user)
  await next()
}

const requireRole = (roles: Role[]) => {
  return async (c: any, next: any) => {
    const user: User = c.get('user')
    if (!user || !roles.includes(user.role)) return c.json({ error: 'forbidden' }, 403)
    await next()
  }
}

// ---------- routes ----------

// signup (email/password)
app.post('/api/signup', async (c) => {
  const { email, password, firstName, lastName } = await c.req.json()
  if (!email || !password) return c.json({ error: 'email and password required' }, 400)
  const existing = await getUserByEmail(c.env.DB, email)
  if (existing) return c.json({ error: 'email taken' }, 409)

  const hash = await bcrypt.hash(password, 10)
  const id = uid()
  await c.env.DB.prepare(`
    INSERT INTO users(id, email, password_hash, first_name, last_name, role, created_at)
    VALUES (?, ?, ?, ?, ?, 'Pending', ?)
  `).bind(id, email, hash, firstName ?? null, lastName ?? null, now()).run()

  setCookie(c, 'uid', id, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
  return c.json({ ok: true })
})

// login (email/password)
app.post('/api/login', async (c) => {
  const { email, password } = await c.req.json()
  const user = await getUserByEmail(c.env.DB, email)
  if (!user || !user.password_hash) return c.json({ error: 'invalid credentials' }, 401)
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return c.json({ error: 'invalid credentials' }, 401)
  setCookie(c, 'uid', user.id, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
  return c.json({ ok: true })
})

// logout
app.post('/api/logout', async (c) => {
  deleteCookie(c, 'uid', { path: '/' })
  return c.json({ ok: true })
})

// me
app.get('/api/me', requireUser, async (c) => {
  const user: User = c.get('user')
  return c.json({ user })
})

// enter access code → promote role
app.post('/api/enter-code', requireUser, async (c) => {
  const user: User = c.get('user')
  const { code } = await c.req.json()
  if (!code) return c.json({ error: 'code required' }, 400)

  const row = await c.env.DB
    .prepare('SELECT role, active FROM access_codes WHERE code = ?')
    .bind(code)
    .first<{ role: Role; active: number }>()
  if (!row || row.active !== 1) return c.json({ error: 'invalid code' }, 400)

  const nextRole = row.role === 'SuperAdmin' ? 'Admin' : row.role
  await c.env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(nextRole, user.id).run()
  return c.json({ ok: true, role: nextRole })
})

// admin: list users
app.get('/api/admin/users', requireUser, requireRole(['Admin', 'SuperAdmin']), async (c) => {
  const rows = await c.env.DB
    .prepare('SELECT id,email,first_name,last_name,role,created_at FROM users')
    .all()
  return c.json(rows)
})

// admin: set role (only SuperAdmin can assign Admin/SuperAdmin)
app.post('/api/admin/set-role', requireUser, requireRole(['Admin', 'SuperAdmin']), async (c) => {
  const actor: User = c.get('user')
  const { userId, role } = (await c.req.json()) as { userId: string; role: Role }
  if (!userId || !role) return c.json({ error: 'userId and role required' }, 400)
  if (role === 'Admin' || role === 'SuperAdmin') {
    if (actor.role !== 'SuperAdmin') return c.json({ error: 'only SuperAdmin can set Admin/SuperAdmin' }, 403)
  }
  await c.env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, userId).run()
  return c.json({ ok: true })
})

export default app
