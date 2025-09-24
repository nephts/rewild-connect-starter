import { jsonResponse, comparePassword, setSignedCookie, getSessionFromRequest } from './_helpers';

export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  await import('./_helpers').then(m => m.ensureDatabase(env));
  const body = await request.json().catch(() => ({} as any));
  const { email, password } = body;
  if (!email || !password) return jsonResponse({ ok: false, error: 'email and password required' }, 400);

  const res = await import('./_helpers').then(m => m.dbFirst(env, 'SELECT id, password_hash, role, first_name, last_name FROM users WHERE email = ?', email));
  if (!res || !res.id) return jsonResponse({ ok: false, error: 'invalid credentials' }, 401);

  const match = res.password_hash ? await comparePassword(password, res.password_hash) : false;
  if (!match) return jsonResponse({ ok: false, error: 'invalid credentials' }, 401);

  const uid = res.id;
  const role = res.role || 'Pending';
  const secret = env?.COOKIE_SECRET;
  const cookie1 = await setSignedCookie('uid', uid, secret);
  const cookie2 = await setSignedCookie('role', role, secret);

  return jsonResponse({ ok: true, user: { id: uid, email, first_name: res.first_name, last_name: res.last_name, role } }, 200, { 'Set-Cookie': [cookie1, cookie2].join(', ') });
}
