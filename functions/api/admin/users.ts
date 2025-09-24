import { jsonResponse, getSessionFromRequest, requireRole } from '../_helpers';

export async function onRequestGet({ request, env }: { request: Request; env: any }) {
  await import('../_helpers').then(m => m.ensureDatabase(env));
  const sess = await getSessionFromRequest(request, env);
  if (!requireRole(sess.role, ['Admin', 'SuperAdmin'])) return jsonResponse({ ok: false, error: 'forbidden' }, 403);

  const rows = await import('../_helpers').then(m => m.dbAll(env, 'SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC'));
  return jsonResponse({ ok: true, users: rows.results || [] });
}
