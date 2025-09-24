import { jsonResponse, getSessionFromRequest, requireRole } from '../_helpers';

export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  await import('../_helpers').then(m => m.ensureDatabase(env));
  const sess = await getSessionFromRequest(request, env);
  if (!requireRole(sess.role, ['Admin', 'SuperAdmin'])) return jsonResponse({ ok: false, error: 'forbidden' }, 403);

  const body = await request.json().catch(() => ({} as any));
  const { userId, role } = body;
  if (!userId || !role) return jsonResponse({ ok: false, error: 'userId and role required' }, 400);

  await import('../_helpers').then(m => m.dbRun(env, 'UPDATE users SET role = ? WHERE id = ?', role, userId));
  return jsonResponse({ ok: true });
}
