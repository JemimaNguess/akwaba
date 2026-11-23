import React, { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'
import { SCENES, langName } from '../data.js'
import { canDictate, dictate, speak } from '../speech.js'
import { Icon } from '../components/Icon.jsx'
import { LangSelect } from './Translate.jsx'

export default function Scenes({ update, addXP }) {
  const [lang, setLang] = useState('en')
  const [scene, setScene] = useState(null)
  const [items, setItems] = useState([]) // {kind:'ai'|'me'|'fix', ...}
  const [hist, setHist] = useState([])
  const [hint, setHint] = useState('')
  const [progress, setProgress] = useState(0)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [rec, setRec] = useState(false)
  const stop = useRef(null)
  const box = useRef(null)

  useEffect(() => { box.current?.scrollTo({ top: 1e9, behavior: 'smooth' }) }, [items, busy])

  async function turn(sc, history, message) {
    setBusy(true)
    try {
      const r = await api('scene', { method: 'POST', body: { scene: sc, lang, history, message } })
      const add = []
      if (message && r.correction) {
        add.push({ kind: 'fix', ok: r.correction.ok, corrected: r.correction.corrected, explain: r.correction.explain })
        addXP(r.correction.ok ? 6 : 3)
        if (!r.correction.ok && r.weak_point) update(s => { s.weak.push(r.weak_point); s.weak = s.weak.slice(-30); return s })
      }
      add.push({ kind: 'ai', text: r.reply, fr: r.reply_fr })
      setItems(it => [...it, ...add])
      setHist(h => [...h, { who: 'ai', t: r.reply }])
      setHint(r.hint || '')
      const p = Math.min(100, +r.progress || 0)
      if (p >= 100 && progress < 100) { update(s => { s.scenesDone++; return s }); addXP(20, '🎯 Objectif atteint ! +20 XP') }
      setProgress(p)
    } catch (e) { setItems(it => [...it, { kind: 'error', text: e.message }]) }
    setBusy(false)
  }

  function start(sc) {
    setScene(sc); setItems([]); setHist([]); setHint(''); setProgress(0)
    turn(sc, [], null)
  }

  function send() {
    const t = input.trim(); if (!t || busy) return
    setInput('')
    const h = [...hist, { who: 'me', t }]
    setItems(it => [...it, { kind: 'me', text: t }]); setHist(h)
    turn(scene, h, t)
  }

  function mic() {
    if (rec) { stop.current?.(); return }
    setRec(true)
    stop.current = dictate(lang, { onText: setInput, onEnd: () => setRec(false) })
  }

  if (!scene) return (
    <section className="view">
      <h1>Vis la langue, pour de <em>vrai</em>.</h1>
      <p className="sub">Pas de « le chat boit du lait ». Tu entres dans une situation réelle, tu parles à un personnage, il te corrige en douceur après chaque réponse.</p>
      <div className="langbar"><span className="mut b">Langue de la scène :</span><LangSelect value={lang} onChange={setLang} /></div>
      <div className="scenes">
        {SCENES.map(s => (
          <button key={s.t} className="scene" onClick={() => start(s)}>
            <div className="em">{s.em}</div><h3>{s.t}</h3><p>{s.d}</p>
          </button>
        ))}
      </div>
    </section>
  )

  return (
    <section className="view chat">
      <div className="chat-head">
        <button className="ic" onClick={() => setScene(null)} title="Retour"><Icon name="back" /></button>
        <div style={{ flex: 1, minWidth: 0 }}><b>{scene.em} {scene.t} · {langName(lang)}</b><div className="mut small">🎯 {scene.goal}</div></div>
      </div>
      <div className="row nowrap" style={{ marginBottom: 8 }}><span className="mut small">Objectif</span><div className="goalbar"><div style={{ width: progress + '%' }} /></div><span className="small b">{progress}%</span></div>
      <div className="msgs" ref={box}>
        {items.map((m, i) => m.kind === 'ai' ? <AiMsg key={i} m={m} lang={lang} />
          : m.kind === 'me' ? <div key={i} className="msg me">{m.text}</div>
          : m.kind === 'fix' ? <div key={i} className={'fix ' + (m.ok ? 'ok' : 'no')}>
              {m.ok ? <>✓ Bien dit ! {m.explain}</> : <>✏️ Plus naturel : <b>{m.corrected}</b><br />{m.explain}</>}
            </div>
          : <div key={i} className="err">{m.text}</div>)}
        {busy && <div className="msg ai"><div className="dots"><span /><span /><span /></div></div>}
      </div>
      <div className="hint">{hint && '💡 ' + hint}</div>
      <div className="composer">
        {canDictate && <button className={'ic' + (rec ? ' rec' : '')} onClick={mic} title="Parler"><Icon name="mic" size={18} /></button>}
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Réponds dans la langue… (ou en français si tu bloques)" />
        <button className="btn sq" onClick={send} disabled={busy}><Icon name="send" size={18} /></button>
      </div>
    </section>
  )
}

function AiMsg({ m, lang }) {
  const [fr, setFr] = useState(false)
  return (
    <div className="msg ai">
      {m.text}
      {fr && <div className="fr">{m.fr}</div>}
      <div className="tools">
        <button onClick={() => setFr(!fr)}>{fr ? 'Masquer' : 'Voir en français'}</button>
        <button onClick={() => speak(m.text, lang)}>🔊 Écouter</button>
      </div>
    </div>
  )
}
