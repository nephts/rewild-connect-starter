export async function post<T=any>(path: string, body: any): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    credentials: 'include',
    body: JSON.stringify(body)
  })
  const data = await res.json().catch(()=> ({}))
  if (!res.ok) throw new Error((data && (data.error||data.message)) || 'Request failed')
  return data
}

export async function get<T=any>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: 'include' })
  const data = await res.json().catch(()=> ({}))
  if (!res.ok) throw new Error((data && (data.error||data.message)) || 'Request failed')
  return data
}
