import { db, ensureSchema } from './_lib/db.js'
import { handle, onlyMethods, requireUser, send } from './_lib/http.js'

// GET : récupère la progression ; PUT : l'enregistre (synchro entre appareils)
export default handle(async (req, res) => {
  if (!onlyMethods(req, res, ['GET', 'PUT'])) return
  const user = requireUser(req, res); if (!user) return
  await ensureSchema()
  const sql = db()
  if (req.method === 'GET') {
    const [row] = await sql`SELECT data, updated_at FROM progress WHERE user_id = ${user.id}`
    return send(res, 200, { pseudo: user.pseudo, data: row?.data || {}, updatedAt: row?.updated_at })
  }
  const data = req.body?.data
  if (!data || typeof data !== 'object') return send(res, 400, { error: 'Données invalides.' })
  const json = JSON.stringify(data)
  if (json.length > 500_000) return send(res, 413, { error: 'Carnet trop volumineux.' })
  await sql`INSERT INTO progress (user_id, data, updated_at) VALUES (${user.id}, ${json}::jsonb, NOW())
            ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`
  send(res, 200, { ok: true })
})
