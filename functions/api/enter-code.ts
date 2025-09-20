// functions/api/enter-code.ts
const ACCESS = {
  VIEWER: 'VIEW-123',
  VOLUNTEER: 'VOL-123',
  INTERN: 'INT-123',
  ADMIN: 'ADMIN-123',
};

export async function onRequestPost({ request }: { request: Request }) {
  const { code } = await request.json().catch(() => ({} as any));
  if (!code) {
    return new Response(JSON.stringify({ ok: false, error: 'code required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let role: string | null = null;
  if (code === ACCESS.ADMIN) role = 'Admin';
  else if (code === ACCESS.INTERN) role = 'Intern';
  else if (code === ACCESS.VOLUNTEER) role = 'Volunteer';
  else if (code === ACCESS.VIEWER) role = 'Viewer';

  if (!role) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid code' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const thirtyDays = 60 * 60 * 24 * 30;
  const set = (name: string, value: string) =>
    `${name}=${value}; Path=/; SameSite=Lax; HttpOnly; Max-Age=${thirtyDays}`;

  return new Response(JSON.stringify({ ok: true, role }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': set('role', role),
    },
  });
}

