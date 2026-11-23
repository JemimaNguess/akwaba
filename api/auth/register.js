import bcrypt from 'bcryptjs'
import { db, ensureSchema } from '../_lib/db.js'
import { handle, onlyMethods, send, signToken } from '../_lib/http.js'

export default handle(async (req, res) => {
  if (!onlyMethods(req, res, ['POST'])) return
  const pseudo = String(req.body?.pseudo || '').trim()
  const password = String(req.body?.password || '')
  if (!/^[a-zA-Z0-9_.]{3,20}$/.test(pseudo))
    return send(res, 400, { error: 'Pseudo : 3 à 20 caractères (lettres, chiffres, _ ou .).' })
  if (password.length < 6) return send(res, 400, { error: 'Mot de passe : 6 caractères minimum.' })
  await ensureSchema()
  const sql = db()
  const exists = await sql`SELECT 1 FROM users WHERE LOWER(pseudo) = LOWER(${pseudo})`
  if (exists.length) return send(res, 409, { error: 'Ce pseudo est déjà pris.' })
  const hash = await bcrypt.hash(password, 10)
  const [user] = await sql`INSERT INTO users (pseudo, password_hash) VALUES (${pseudo}, ${hash}) RETURNING id, pseudo`
  await sql`INSERT INTO progress (user_id, data) VALUES (${user.id}, '{}'::jsonb)`
  send(res, 201, { token: signToken(user), pseudo: user.pseudo })
})
