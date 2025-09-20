// functions/api/ping.ts
export async function onRequestGet() {
  return new Response('pong')
}
