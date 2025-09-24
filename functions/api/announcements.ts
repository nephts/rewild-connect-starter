import { jsonResponse, getSessionFromRequest, requireRole, uidFromSession } from './_helpers';

export async function onRequestGet({ env }: { env: any }) {
  await import('./_helpers').then(m => m.ensureDatabase(env));
  const rows = await import('./_helpers').then(m => m.dbAll(env, 'SELECT * FROM announcements WHERE published = 1 ORDER BY created_at DESC'));
  return jsonResponse({ ok: true, announcements: rows.results || [] });
}

export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  const sess = await getSessionFromRequest(request, env);
  if (!requireRole(sess.role, ['Admin', 'SuperAdmin'])) return jsonResponse({ ok: false, error: 'forbidden' }, 403);

  const body = await request.json().catch(() => ({} as any));
  const { title, body: content, published } = body;
  if (!title || !content) return jsonResponse({ ok: false, error: 'title and body required' }, 400);

  const id = crypto.randomUUID();
  const created_at = Math.floor(Date.now() / 1000);
  await import('./_helpers').then(m => m.dbRun(env, 'INSERT INTO announcements(id, title, body, created_by, created_at, published) VALUES (?, ?, ?, ?, ?, ?)', id, title, content, uidFromSession(sess.uid) || 'system', created_at, published ? 1 : 0));

  return jsonResponse({ ok: true, announcement: { id, title, body: content } });
}
