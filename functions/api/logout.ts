import { jsonResponse, setSignedCookie } from './_helpers';

export async function onRequestPost({ env }: { env: any }) {
  const secret = env?.COOKIE_SECRET;
  if (secret) {
    const c1 = await setSignedCookie('uid', '', secret, { maxAge: 0 });
    const c2 = await setSignedCookie('role', '', secret, { maxAge: 0 });
    return jsonResponse({ ok: true }, 200, { 'Set-Cookie': [c1, c2].join(', ') });
  }
  // fallback unsigned
  const expired = (name: string) => `${name}=; Path=/; HttpOnly; Max-Age=0`;
  return jsonResponse({ ok: true }, 200, { 'Set-Cookie': [expired('uid'), expired('role')].join(', ') });
}
