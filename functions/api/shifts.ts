import { jsonResponse, getSessionFromRequest, requireRole, uidFromSession } from './_helpers';

export async function onRequestGet({ env }: { env: any }) {
  await import('./_helpers').then(m => m.ensureDatabase(env));
  const rows = await import('./_helpers').then(m => m.dbAll(env, 'SELECT * FROM shifts ORDER BY start_ts ASC'));
  return jsonResponse({ ok: true, shifts: rows.results || [] });
}

export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  // create shift (admin)
  await import('./_helpers').then(m => m.ensureDatabase(env));
  const sess = await getSessionFromRequest(request, env);
  if (!requireRole(sess.role, ['Admin', 'SuperAdmin'])) return jsonResponse({ ok: false, error: 'forbidden' }, 403);

  const body = await request.json().catch(() => ({} as any));
  const { title, description, location, start_ts, end_ts, capacity } = body;
  if (!title || !start_ts) return jsonResponse({ ok: false, error: 'title and start_ts required' }, 400);

  const id = crypto.randomUUID();
  const created_at = Math.floor(Date.now() / 1000);
  await import('./_helpers').then(m => m.dbRun(env, 'INSERT INTO shifts(id, title, description, location, start_ts, end_ts, capacity, created_by, created_at, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)', id, title, description || null, location || null, start_ts, end_ts || null, capacity || 0, uidFromSession(sess.uid) || 'system', created_at));

  return jsonResponse({ ok: true, shift: { id, title, description, location, start_ts, end_ts, capacity } });
}
