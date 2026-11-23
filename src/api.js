const TOKEN_KEY = 'akwaba_token'
export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } }
export const setToken = t => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) } catch {} }

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const t = getToken()
  if (t) headers.Authorization = `Bearer ${t}`
  const r = await fetch(`/api/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  let data = {}
  try { data = await r.json() } catch {}
  if (!r.ok) {
    const err = new Error(data.error || `Erreur ${r.status}`)
    err.status = r.status
    throw err
  }
  return data
}
