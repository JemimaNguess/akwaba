import React, { useCallback, useEffect, useRef, useState } from 'react'
import { api, getToken, setToken } from './api.js'
import { EMPTY, today } from './data.js'
import Auth from './pages/Auth.jsx'
import Translate from './pages/Translate.jsx'
import Scenes from './pages/Scenes.jsx'
import Carnet from './pages/Carnet.jsx'
import Progress from './pages/Progress.jsx'
import { Icon } from './components/Icon.jsx'

const VIEWS = [
  ['traduire', 'Traduire', 'translate'], ['scenes', 'Scènes', 'chat'],
  ['carnet', 'Carnet', 'book'], ['progres', 'Progrès', 'chart']
]

export default function App() {
  const [pseudo, setPseudo] = useState(null)
  const [booting, setBooting] = useState(!!getToken())
  const [S, setS] = useState(EMPTY)
  const [view, setView] = useState('traduire')
  const [toast, setToast] = useState(null)
  const [sync, setSync] = useState('ok')
  const loaded = useRef(false)

  const notify = useCallback(t => { setToast({ t, k: Date.now() }) }, [])
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 1800); return () => clearTimeout(id) }, [toast])

  // Connexion automatique si un jeton existe
  useEffect(() => {
    if (!getToken()) return
    api('progress').then(r => { setPseudo(r.pseudo); setS({ ...EMPTY, ...r.data }); loaded.current = true })
      .catch(() => setToken(null)).finally(() => setBooting(false))
  }, [])

  // Sauvegarde dans le cloud 1,2 s après chaque changement
  useEffect(() => {
    if (!pseudo || !loaded.current) return
    setSync('saving')
    const id = setTimeout(() => {
      api('progress', { method: 'PUT', body: { data: S } }).then(() => setSync('ok')).catch(e => {
        setSync('error'); if (e.status === 401) logout()
      })
    }, 1200)
    return () => clearTimeout(id)
  }, [S, pseudo])

  const onAuth = async ({ token, pseudo }) => {
    setToken(token)
    const r = await api('progress')
    setS({ ...EMPTY, ...r.data }); loaded.current = true; setPseudo(pseudo)
  }
  function logout() { setToken(null); setPseudo(null); setS(EMPTY); loaded.current = false; setView('traduire') }

  const update = useCallback(fn => setS(prev => fn(structuredClone(prev))), [])
  const addXP = useCallback((n, msg) => {
    update(s => {
      const d = today(); s.xp += n; s.days[d] = (s.days[d] || 0) + n
      if (s.last !== d) {
        const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
        s.streak = s.last === y ? s.streak + 1 : 1; s.last = d
      }
      return s
    })
    notify(msg || `+${n} XP`)
  }, [update, notify])

  if (booting) return <div className="boot"><div className="dots"><span /><span /><span /></div></div>
  if (!pseudo) return <Auth onAuth={onAuth} />

  const ctx = { S, update, addXP, notify, go: setView }
  return (
    <div className="app">
      <aside>
        <div className="logo">Akwaba<small>Traduire. Comprendre. Parler.</small></div>
        {VIEWS.map(([k, l, i]) => (
          <button key={k} className={'nav' + (view === k ? ' on' : '')} onClick={() => { setView(k); window.scrollTo({ top: 0 }) }}>
            <Icon name={i} />{l}
          </button>
        ))}
        <div className="side-foot">
          <div className="chip">🔥 {S.streak} jour{S.streak > 1 ? 's' : ''}</div>
          <div className="chip anis">✨ {S.xp} XP</div>
          <div className="me">
            <div className="avatar">{pseudo[0].toUpperCase()}</div>
            <div><b>{pseudo}</b><span className={'sync ' + sync}>{sync === 'ok' ? 'Synchronisé' : sync === 'saving' ? 'Enregistrement…' : 'Hors ligne'}</span></div>
            <button className="ic" title="Se déconnecter" onClick={logout}><Icon name="logout" /></button>
          </div>
        </div>
      </aside>
      <main>
        <div className="mhead">
          <div className="logo">Akwaba</div>
          <div className="row">
            <div className="chip">🔥 {S.streak}</div><div className="chip anis">✨ {S.xp}</div>
            <button className="avatar" title="Se déconnecter" onClick={logout}>{pseudo[0].toUpperCase()}</button>
          </div>
        </div>
        {view === 'traduire' && <Translate {...ctx} />}
        {view === 'scenes' && <Scenes {...ctx} />}
        {view === 'carnet' && <Carnet {...ctx} />}
        {view === 'progres' && <Progress {...ctx} pseudo={pseudo} />}
      </main>
      {toast && <div className="toast" key={toast.k}>{toast.t}</div>}
    </div>
  )
}
