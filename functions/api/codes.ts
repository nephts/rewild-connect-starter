import { jsonResponse, getSessionFromRequest, requireRole } from './_helpers';

export async function onRequestGet({ request, env }: { request: Request; env: any }) {
  await import('./_helpers').then(m => m.ensureDatabase(env));
  const sess = await getSessionFromRequest(request, env);
  if (!requireRole(sess.role, ['Admin', 'SuperAdmin'])) return jsonResponse({ ok: false, error: 'forbidden' }, 403);
  const rows = await import('./_helpers').then(m => m.dbAll(env, 'SELECT code, role, active FROM access_codes'));
  return jsonResponse({ ok: true, codes: rows.results || [] });
}
