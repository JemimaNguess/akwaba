import { neon } from '@neondatabase/serverless'

let sql = null
let ready = null

export function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL manquant (configure Neon dans Vercel).')
  if (!sql) sql = neon(process.env.DATABASE_URL)
  return sql
}

// Crée les tables automatiquement au premier appel
export async function ensureSchema() {
  if (!ready) {
    const s = db()
    ready = (async () => {
      await s`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        pseudo VARCHAR(20) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`
      await s`CREATE TABLE IF NOT EXISTS progress (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        data JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`
    })().catch(e => { ready = null; throw e })
  }
  return ready
}
