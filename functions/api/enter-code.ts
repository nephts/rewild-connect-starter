// functions/api/enter-code.ts
export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  const helpers = await import('./_helpers');
  await helpers.ensureDatabase(env);

  const body = await request.json().catch(() => ({} as any));
  const rawCode = typeof body.code === 'string' ? body.code : '';
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return helpers.jsonResponse({ ok: false, error: 'code required' }, 400);
  }

  const session = await helpers.getSessionFromRequest(request, env);
  const uid = helpers.uidFromSession(session.uid);
  if (!uid) return helpers.jsonResponse({ ok: false, error: 'unauthorized' }, 401);

  const row = await helpers.dbFirst(env, 'SELECT role, active FROM access_codes WHERE code = ?', code);
  if (!row || !row.role || Number(row.active || 0) === 0) {
    return helpers.jsonResponse({ ok: false, error: 'invalid or inactive code' }, 400);
  }

  const role = String(row.role);
  await helpers.dbRun(env, 'UPDATE users SET role = ? WHERE id = ?', role, uid);

  const updated = await helpers.dbFirst(env, 'SELECT id, email, first_name, last_name, role FROM users WHERE id = ?', uid);
  const cookieHeader = await helpers.setSignedCookie('role', role, env?.COOKIE_SECRET, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });

  return helpers.jsonResponse({ ok: true, role, user: updated }, 200, { 'Set-Cookie': cookieHeader });
}
