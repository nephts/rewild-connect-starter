import { jsonResponse, getSessionFromRequest, requireRole } from '../_helpers';

export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  const helpers = await import('../_helpers');
  await helpers.ensureDatabase(env);

  const sess = await getSessionFromRequest(request, env);
  if (!requireRole(sess.role, ['Admin', 'SuperAdmin'])) {
    return jsonResponse({ ok: false, error: 'forbidden' }, 403);
  }

  const body = await request.json().catch(() => ({} as any));
  const role = String(body.role || '').trim();
  const rawCode = String(body.code || '').trim().toUpperCase();
  if (!role || !rawCode) {
    return jsonResponse({ ok: false, error: 'role and code required' }, 400);
  }

  const code = rawCode.replace(/\s+/g, '-');

  await helpers.dbRun(env, 'UPDATE access_codes SET active = 0 WHERE role = ?', role);
  await helpers.dbRun(env, 'INSERT OR REPLACE INTO access_codes(code, role, active) VALUES (?, ?, 1)', code, role);

  return jsonResponse({ ok: true, role, code });
}
