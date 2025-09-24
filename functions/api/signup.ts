import { jsonResponse, hashPassword, setSignedCookie } from './_helpers';

export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  await import('./_helpers').then(m => m.ensureDatabase(env));
  const body = await request.json().catch(() => ({} as any));
  const { email, password, firstName, lastName } = body;
  if (!email || !password) return jsonResponse({ ok: false, error: 'email and password required' }, 400);

  const existing = await import('./_helpers').then(m => m.dbFirst(env, 'SELECT id FROM users WHERE email = ?', email));
  if (existing && existing.id) return jsonResponse({ ok: false, error: 'email already in use' }, 400);

  const uid = crypto.randomUUID();
  const password_hash = await hashPassword(password);
  const created_at = Math.floor(Date.now() / 1000);

  await import('./_helpers').then(m => m.dbRun(env, 'INSERT INTO users(id, email, password_hash, first_name, last_name, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', uid, email, password_hash, firstName || null, lastName || null, 'Pending', created_at));

  const secret = env?.COOKIE_SECRET;
  const cookie1 = await setSignedCookie('uid', uid, secret);
  const cookie2 = await setSignedCookie('role', 'Pending', secret);
  return jsonResponse({ ok: true, user: { id: uid, email, first_name: firstName, last_name: lastName, role: 'Pending' } }, 200, { 'Set-Cookie': [cookie1, cookie2].join(', ') });
}

