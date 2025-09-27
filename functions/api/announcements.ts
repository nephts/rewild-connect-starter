import { jsonResponse, getSessionFromRequest, requireRole, uidFromSession, now } from './_helpers';

const toEpoch = (value: any): number | null => {
  if (!value && value !== 0) return null
  const num = Number(value)
  if (!Number.isNaN(num) && num > 0) return Math.floor(num)
  return null
}

export async function onRequestGet({ env }: { env: any }) {
  await import('./_helpers').then(m => m.ensureDatabase(env));
  const rows = await import('./_helpers').then(m => m.dbAll(env, 'SELECT * FROM announcements WHERE published = 1 ORDER BY COALESCE(publish_at, created_at) DESC'));
  const list = (rows.results || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    created_by: row.created_by,
    created_at: Number(row.created_at),
    publish_at: row.publish_at != null ? Number(row.publish_at) : null,
    expires_at: row.expires_at != null ? Number(row.expires_at) : null,
  }))
  const nowTs = now()
  const isActive = (item: any) => {
    const starts = item.publish_at || item.created_at
    const ends = item.expires_at
    if (starts && starts > nowTs) return false
    if (ends && ends <= nowTs) return false
    return true
  }
  const active = list.filter(isActive)
  const previous = list.filter(item => !isActive(item) && (item.publish_at || item.created_at) <= nowTs)
  const upcoming = list.filter(item => (item.publish_at || item.created_at) > nowTs)
  return jsonResponse({ ok: true, active, previous, upcoming })
}

export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  const helpers = await import('./_helpers')
  await helpers.ensureDatabase(env)

  const sess = await getSessionFromRequest(request, env);
  if (!requireRole(sess.role, ['Admin', 'SuperAdmin'])) return jsonResponse({ ok: false, error: 'forbidden' }, 403);

  const body = await request.json().catch(() => ({} as any));
  const { title, body: content, published, publishAt, expiresAt } = body;
  if (!title || !content) return jsonResponse({ ok: false, error: 'title and body required' }, 400);

  const id = crypto.randomUUID();
  const created_at = Math.floor(Date.now() / 1000);
  const publish_at = toEpoch(publishAt) ?? created_at;
  const expires_at = toEpoch(expiresAt);

  await helpers.dbRun(env,
    'INSERT INTO announcements(id, title, body, created_by, created_at, published, publish_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    id,
    title,
    content,
    uidFromSession(sess.uid) || 'system',
    created_at,
    published ? 1 : 0,
    publish_at,
    expires_at,
  );

  return jsonResponse({ ok: true, announcement: { id, title, body: content, publish_at, expires_at } });
}
