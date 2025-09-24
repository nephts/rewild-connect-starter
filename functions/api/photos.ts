import { jsonResponse, getSessionFromRequest, uidFromSession } from './_helpers';

export async function onRequestGet({ env }: { env: any }) {
  await import('./_helpers').then(m => m.ensureDatabase(env));
  const rows = await import('./_helpers').then(m => m.dbAll(env, 'SELECT * FROM photos ORDER BY created_at DESC'));
  return jsonResponse({ ok: true, photos: rows.results || [] });
}

export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  const sess = await getSessionFromRequest(request, env);
  const uid = uidFromSession(sess.uid);
  if (!uid) return jsonResponse({ ok: false, error: 'unauthorized' }, 401);

  const body = await request.json().catch(() => ({} as any));
  const { url, caption } = body;
  if (!url) return jsonResponse({ ok: false, error: 'url required' }, 400);

  const id = crypto.randomUUID();
  const created_at = Math.floor(Date.now() / 1000);
  await import('./_helpers').then(m => m.dbRun(env, 'INSERT INTO photos(id, url, caption, created_by, created_at) VALUES (?, ?, ?, ?, ?)', id, url, caption || null, uid, created_at));
  return jsonResponse({ ok: true, photo: { id, url, caption, created_by: uid, created_at } });
}
