// functions/api/me.ts
export async function onRequestGet({ request }) {
  const cookieHeader = request.headers.get('Cookie') || ''
  const cookies: Record<string, string> = {}
  cookieHeader.split(';').forEach((pair) => {
    const [k, v] = pair.trim().split('=')
    if (k) cookies[k] = v
  })

  const uid = cookies['uid']
  if (!uid) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const role = cookies['role'] || 'Pending'
  return new Response(JSON.stringify({ ok: true, user: { id: uid, role } }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
