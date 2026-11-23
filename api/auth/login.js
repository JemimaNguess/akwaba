import bcrypt from 'bcryptjs'
import { db, ensureSchema } from '../_lib/db.js'
import { handle, onlyMethods, send, signToken } from '../_lib/http.js'

export default handle(async (req, res) => {
  if (!onlyMethods(req, res, ['POST'])) return
  const pseudo = String(req.body?.pseudo || '').trim()
  const password = String(req.body?.password || '')
  await ensureSchema()
  const [user] = await db()`SELECT id, pseudo, password_hash FROM users WHERE LOWER(pseudo) = LOWER(${pseudo})`
  const ok = user && await bcrypt.compare(password, user.password_hash)
  if (!ok) return send(res, 401, { error: 'Pseudo ou mot de passe incorrect.' })
  send(res, 200, { token: signToken(user), pseudo: user.pseudo })
})
