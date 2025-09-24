// functions/api/enter-code.ts
export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  // Ensure DB + seeds exist (this will create access_codes if missing)
  await import('./_helpers').then(m => m.ensureDatabase(env));

  const body = await request.json().catch(() => ({} as any));
  const code = (body && body.code) || '';
  if (!code) {
    return new Response(JSON.stringify({ ok: false, error: 'code required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Look up the code in the DB (access_codes table). This verifies demo codes are present.
  const helpers = await import('./_helpers');
  const row = await helpers.dbFirst(env, 'SELECT role, active FROM access_codes WHERE code = ?', code);
  if (!row || !row.role || Number(row.active || 0) === 0) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid or inactive code' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const role = String(row.role);

  // Set a role cookie server-side. If COOKIE_SECRET is present in env, cookie will be signed.
  const cookieHeader = await helpers.setSignedCookie('role', role, env?.COOKIE_SECRET, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });

  return new Response(JSON.stringify({ ok: true, role }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookieHeader,
    },
  });
}

