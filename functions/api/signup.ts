export async function onRequestPost({ request }) {
  const body = await request.json().catch(() => ({}))
  const { email, password, firstName, lastName } = body
  if (!email || !password) {
    return new Response(JSON.stringify({ ok:false, error:'email and password required' }), {
      status: 400, headers:{'Content-Type':'application/json'}
    })
  }
  // mint a fake user id and set cookie (dev-only)
  const uid = crypto.randomUUID()
  const thirtyDays = 60 * 60 * 24 * 30
  const set = (name: string, value: string) =>
    `${name}=${value}; Path=/; SameSite=Lax; HttpOnly; Max-Age=${thirtyDays}`

  return new Response(JSON.stringify({
    ok:true, user:{ id: uid, email, first_name:firstName, last_name:lastName, role:'Pending' }
  }), {
    headers: {
      'Content-Type':'application/json',
      'Set-Cookie': [
        set('uid', uid),
        set('role', 'Pending'),
      ].join(', ')
    }
  })
}

