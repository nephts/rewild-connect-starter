// functions/api/me.ts
import { jsonResponse, getSessionFromRequest } from './_helpers';

export async function onRequestGet({ request, env }: { request: Request; env: any }) {
  await import('./_helpers').then(m => m.ensureDatabase(env));
  const sess = await getSessionFromRequest(request, env);
  const uid = sess.uid;
  if (!uid) return jsonResponse({ ok: false, error: 'unauthorized' }, 401);

  const row = await import('./_helpers').then(m => m.dbFirst(env, 'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ?', uid));
  if (!row) return jsonResponse({ ok: false, error: 'unauthorized' }, 401);

  return jsonResponse({ ok: true, user: { id: row.id, email: row.email, first_name: row.first_name, last_name: row.last_name, role: row.role, created_at: row.created_at } });
}
