import { jsonResponse, getSessionFromRequest, uidFromSession } from '../_helpers';

export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  await import('../_helpers').then(m => m.ensureDatabase(env));
  const sess = await getSessionFromRequest(request, env);
  const uid = uidFromSession(sess.uid);
  if (!uid) return jsonResponse({ ok: false, error: 'unauthorized' }, 401);

  const body = await request.json().catch(() => ({} as any));
  const { shiftId } = body;
  if (!shiftId) return jsonResponse({ ok: false, error: 'shiftId required' }, 400);

  // Transactional-ish: check capacity, current signups, then insert if space.
  const shift = await import('../_helpers').then(m => m.dbFirst(env, 'SELECT capacity FROM shifts WHERE id = ?', shiftId));
  if (!shift) return jsonResponse({ ok: false, error: 'shift not found' }, 404);
  const capacity = Number(shift.capacity || 0);
  const countRow = await import('../_helpers').then(m => m.dbFirst(env, 'SELECT COUNT(*) as cnt FROM shift_signups WHERE shift_id = ?', shiftId));
  const current = Number(countRow?.cnt || 0);
  if (capacity > 0 && current >= capacity) return jsonResponse({ ok: false, error: 'shift full' }, 400);

  const id = crypto.randomUUID();
  const created_at = Math.floor(Date.now() / 1000);
  await import('../_helpers').then(m => m.dbRun(env, 'INSERT INTO shift_signups(id, shift_id, user_id, created_at) VALUES (?, ?, ?, ?)', id, shiftId, uid, created_at));
  return jsonResponse({ ok: true, signup: { id, shift_id: shiftId, user_id: uid } });
}
