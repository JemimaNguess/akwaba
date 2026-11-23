import React, { useState } from 'react'
import { api } from '../api.js'
import { Icon } from '../components/Icon.jsx'

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [pseudo, setPseudo] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault(); setErr('')
    if (mode === 'register' && password !== confirm) return setErr('Les mots de passe ne correspondent pas.')
    setBusy(true)
    try {
      const r = await api(mode === 'login' ? 'auth/login' : 'auth/register', { method: 'POST', body: { pseudo, password } })
      await onAuth(r)
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  return (
    <div className="auth">
      <div className="auth-art">
        <div className="logo big">Akwaba</div>
        <h1>Apprends une langue en la <em>vivant</em>.</h1>
        <ul>
          <li><span>🔍</span>Chaque traduction devient une leçon</li>
          <li><span>🌍</span>Baoulé, dioula, wolof, fon… et l'anglais</li>
          <li><span>🎭</span>Des conversations dans des situations réelles</li>
          <li><span>📒</span>Ton carnet, sur tous tes appareils</li>
        </ul>
        <div className="blob b1" /><div className="blob b2" /><div className="blob b3" />
      </div>
      <form className="auth-card" onSubmit={submit}>
        <div className="seg">
          <button type="button" className={mode === 'login' ? 'on' : ''} onClick={() => { setMode('login'); setErr('') }}>Connexion</button>
          <button type="button" className={mode === 'register' ? 'on' : ''} onClick={() => { setMode('register'); setErr('') }}>Créer un compte</button>
        </div>
        <h2>{mode === 'login' ? 'Bon retour 👋' : 'Bienvenue 🌱'}</h2>
        <p className="mut">{mode === 'login' ? 'Retrouve ton carnet et ta série où que tu sois.' : 'Choisis un pseudo et un mot de passe, c’est tout.'}</p>
        <label>Pseudo
          <input value={pseudo} onChange={e => setPseudo(e.target.value)} placeholder="ex : jemi_dev" autoComplete="username" required maxLength={20} />
        </label>
        <label>Mot de passe
          <div className="pw">
            <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="6 caractères minimum" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={6} />
            <button type="button" className="eye" onClick={() => setShow(!show)} aria-label="Afficher"><Icon name="eye" size={18} /></button>
          </div>
        </label>
        {mode === 'register' && (
          <label>Confirme le mot de passe
            <input type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" required />
          </label>
        )}
        {err && <div className="err">{err}</div>}
        <button className="btn full" disabled={busy}>{busy ? 'Un instant…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</button>
      </form>
    </div>
  )
}
