import { jsonResponse, getSessionFromRequest, uidFromSession } from './_helpers';

export async function onRequestGet({ env }: { env: any }) {
  await import('./_helpers').then(m => m.ensureDatabase(env));
  const rows = await import('./_helpers').then(m => m.dbAll(env, 'SELECT m.id, m.body, m.created_at, m.user_id, u.first_name, u.last_name FROM messages m LEFT JOIN users u ON u.id = m.user_id ORDER BY m.created_at DESC'));
  return jsonResponse({ ok: true, messages: rows.results || [] });
}

export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  const sess = await getSessionFromRequest(request, env);
  const uid = uidFromSession(sess.uid);
  if (!uid) return jsonResponse({ ok: false, error: 'unauthorized' }, 401);

  const body = await request.json().catch(() => ({} as any));
  const { text } = body;
  if (!text) return jsonResponse({ ok: false, error: 'text required' }, 400);

  const id = crypto.randomUUID();
  const created_at = Math.floor(Date.now() / 1000);
  await import('./_helpers').then(m => m.dbRun(env, 'INSERT INTO messages(id, user_id, body, created_at) VALUES (?, ?, ?, ?)', id, uid, text, created_at));
  return jsonResponse({ ok: true, message: { id, user_id: uid, body: text, created_at } });
}
