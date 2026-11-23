import jwt from 'jsonwebtoken'

export function send(res, status, body) {
  res.status(status).json(body)
}

export function onlyMethods(req, res, methods) {
  if (!methods.includes(req.method)) {
    res.setHeader('Allow', methods.join(', '))
    send(res, 405, { error: 'Méthode non autorisée' })
    return false
  }
  return true
}

const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET manquant.')
  return process.env.JWT_SECRET
}

export const signToken = user => jwt.sign({ id: user.id, pseudo: user.pseudo }, secret(), { expiresIn: '30d' })

// Renvoie l'utilisateur connecté ou envoie 401
export function requireUser(req, res) {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  try {
    if (!token) throw new Error()
    return jwt.verify(token, secret())
  } catch {
    send(res, 401, { error: 'Session expirée, reconnecte-toi.' })
    return null
  }
}

export function handle(fn) {
  return async (req, res) => {
    try { await fn(req, res) }
    catch (e) {
      console.error(e)
      send(res, e.status || 500, { error: e.publicMessage || e.message || 'Erreur serveur' })
    }
  }
}
