import bcrypt from 'bcryptjs';
import { parse as parseCookie, serialize as serializeCookie } from 'cookie';

export const now = () => Math.floor(Date.now() / 1000);

export function jsonResponse(data: any, status = 200, headers: Record<string,string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export function parseCookies(request: Request): Record<string, string> {
  const cookie = request.headers.get('Cookie') || '';
  const raw = parseCookie(cookie || '');
  const out: Record<string, string> = {};
  Object.keys(raw).forEach((k) => {
    out[k] = raw[k] || '';
  });
  return out;
}

export function setCookieHeader(name: string, value: string, opts: Record<string, any> = {}) {
  const defaultOpts = { path: '/', httpOnly: true, sameSite: 'lax' as const, maxAge: 60 * 60 * 24 * 30 };
  return serializeCookie(name, value, { ...defaultOpts, ...opts });
}

export async function hashPassword(pw: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}

export async function comparePassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

function base64UrlEncode(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmacSha256(secret: string, data: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return base64UrlEncode(sig);
}

export async function signValue(secret: string, value: string) {
  const sig = await hmacSha256(secret, value);
  return `${value}.${sig}`;
}

export async function unsignValue(secret: string, signed: string) {
  if (!signed) return null;
  const idx = signed.lastIndexOf('.');
  if (idx === -1) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = await hmacSha256(secret, value);
  if (sig === expected) return value;
  return null;
}

export async function setSignedCookie(name: string, value: string, secret: string | undefined, opts: Record<string, any> = {}) {
  if (!secret) return setCookieHeader(name, value, opts);
  const signed = await signValue(secret, value);
  return setCookieHeader(name, signed, opts);
}

export async function getSessionFromRequest(request: Request, env: any): Promise<{ uid: string | null; role: string | null }> {
  const cookies = parseCookies(request);
  const secret = env?.COOKIE_SECRET || env?.COOKIE_SECRET?.toString?.();
  if (!secret) {
    return { uid: cookies.uid || null, role: cookies.role || null };
  }
  const uid = await unsignValue(secret, cookies.uid || '');
  const role = await unsignValue(secret, cookies.role || '');
  return { uid, role };
}

export function requireRole(role: string | null, allowed: string[] = []) {
  const r = role || 'Pending';
  if (allowed.length === 0) return true;
  return allowed.includes(r) || r === 'SuperAdmin';
}

export function uidFromSession(uid: string | null) {
  return uid || null;
}

export async function ensureDatabase(env: any) {
  if (!env?.DB) return;
  // Create required tables if they don't exist. Run idempotent CREATE TABLE IF NOT EXISTS statements.
  const stmts = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      first_name TEXT,
      last_name TEXT,
      role TEXT NOT NULL DEFAULT 'Pending',
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS access_codes (
      code TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );`,
    `CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      published INTEGER NOT NULL DEFAULT 1,
      publish_at INTEGER,
      expires_at INTEGER
    );`,
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      caption TEXT,
      created_by TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS shifts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT,
      start_ts INTEGER NOT NULL,
      end_ts INTEGER,
      capacity INTEGER NOT NULL DEFAULT 0,
      created_by TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      published INTEGER NOT NULL DEFAULT 1
    );`,
    `CREATE TABLE IF NOT EXISTS shift_signups (
      id TEXT PRIMARY KEY,
      shift_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );`,
  ];

  for (const s of stmts) {
    // Make the users table creation strict so we fail fast in dev if D1 isn't available or statements error
    if (s.includes('CREATE TABLE IF NOT EXISTS users')) {
      try {
        await env.DB.prepare(s).run();
        try { console.debug && console.debug('ensureDatabase: users table created or already exists'); } catch (e) {}
      } catch (err) {
        try { console.error('ensureDatabase: failed creating users table', err); } catch (e) {}
        throw err;
      }
    } else {
      try {
        // run each statement; D1 prepare/run supports single-statement execution
        await env.DB.prepare(s).run();
      } catch (err) {
        // swallow non-critical errors but log for diagnostics
        try { console.warn('ensureDatabase: stmt failed', err); } catch (e) {}
      }
    }
  }

  // seed access codes if table empty
  try {
    const row = await env.DB.prepare('SELECT COUNT(*) as cnt FROM access_codes').first();
    const cnt = Number(row?.cnt || 0);
    if (cnt === 0) {
      const codes = [ ['VIEW-123','Viewer'], ['VOL-123','Volunteer'], ['INT-123','Intern'], ['ADMIN-123','Admin'] ];
      for (const [code, role] of codes) {
        await env.DB.prepare('INSERT OR IGNORE INTO access_codes(code, role, active) VALUES (?, ?, 1)').bind(code, role).run();
      }
    }
  } catch (err) {
    try { console.warn('ensureDatabase seed failed', err); } catch (e) {}
  }

  // Ensure announcements has scheduling columns (publish_at, expires_at)
  try {
    await env.DB.prepare('ALTER TABLE announcements ADD COLUMN publish_at INTEGER').run()
  } catch (err: any) {
    const msg = String(err?.message || '')
    if (!msg.includes('duplicate column name')) {
      try { console.warn('ensureDatabase: publish_at alter failed', err) } catch (e) {}
    }
  }
  try {
    await env.DB.prepare('ALTER TABLE announcements ADD COLUMN expires_at INTEGER').run()
  } catch (err: any) {
    const msg = String(err?.message || '')
    if (!msg.includes('duplicate column name')) {
      try { console.warn('ensureDatabase: expires_at alter failed', err) } catch (e) {}
    }
  }
}

async function retryOnce(fn: () => Promise<any>, env: any) {
  try {
    return await fn();
  } catch (err: any) {
    const msg = String(err?.message || err || '');
    if (msg.includes('no such table')) {
      // try to create schema then retry
      try {
        await ensureDatabase(env);
      } catch (e) {
        // failed to ensure DB, rethrow original
      }
      return await fn();
    }
    throw err;
  }
}

export async function dbFirst(env: any, sql: string, ...params: any[]) {
  return retryOnce(async () => {
    return await env.DB.prepare(sql).bind(...params).first();
  }, env);
}

export async function dbAll(env: any, sql: string, ...params: any[]) {
  return retryOnce(async () => {
    return await env.DB.prepare(sql).bind(...params).all();
  }, env);
}

export async function dbRun(env: any, sql: string, ...params: any[]) {
  return retryOnce(async () => {
    return await env.DB.prepare(sql).bind(...params).run();
  }, env);
}
