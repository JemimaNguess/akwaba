import React, { useRef, useState } from 'react'
import { api } from '../api.js'
import { LANGS, LOCAL, langName, today } from '../data.js'
import { canDictate, dictate, speak } from '../speech.js'
import { Icon } from '../components/Icon.jsx'
import { Loader } from '../components/Loader.jsx'

export const LangSelect = ({ value, onChange }) => (
  <select value={value} onChange={e => onChange(e.target.value)}>
    {LANGS.map(([c, n]) => <option key={c} value={c}>{n}{LOCAL.includes(c) ? ' 🌍' : ''}</option>)}
  </select>
)

export default function Translate({ S, update, addXP, notify }) {
  const [from, setFrom] = useState('fr')
  const [to, setTo] = useState('en')
  const [text, setText] = useState('')
  const [res, setRes] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [rec, setRec] = useState(false)
  const stop = useRef(null)

  const saved = (w, l) => S.words.some(x => x.w.toLowerCase() === String(w).toLowerCase() && x.l === l)

  async function go() {
    if (!text.trim()) return notify('Écris une phrase d’abord')
    if (from === to) return notify('Choisis deux langues différentes')
    setBusy(true); setErr(''); setRes(null)
    try {
      const r = await api('translate', { method: 'POST', body: { text, from, to } })
      setRes({ ...r, to })
      update(s => { s.translations++; return s }); addXP(5)
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  function save(w) {
    if (saved(w.word, res.to)) return notify('Déjà dans ton carnet')
    update(s => { s.words.unshift({ id: Date.now() + Math.random(), w: w.word, m: w.meaning, l: res.to, ctx: res.translation, box: 0, due: today() }); return s })
    addXP(2, 'Ajouté au carnet 📒 +2 XP')
  }

  function mic() {
    if (rec) { stop.current?.(); return }
    const base = text ? text + ' ' : ''
    setRec(true)
    stop.current = dictate(from, { onText: t => setText(base + t), onEnd: () => setRec(false) })
  }

  const rel = { haute: 'h', moyenne: 'm', faible: 'f' }[res?.reliability] || 'm'

  return (
    <section className="view">
      <h1>Traduis, et repars en sachant <em>pourquoi</em>.</h1>
      <p className="sub">Chaque traduction devient une mini-leçon : mot à mot, prononciation, registre, culture. Touche un mot pour l’ajouter à ton carnet.</p>
      <div className="card">
        <div className="langbar">
          <LangSelect value={from} onChange={setFrom} />
          <button className="swap" onClick={() => { setFrom(to); setTo(from) }} aria-label="Inverser"><Icon name="swap" size={18} /></button>
          <LangSelect value={to} onChange={setTo} />
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} maxLength={600}
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) go() }}
          placeholder="Écris ou dicte une phrase… ex : « Bonjour, combien coûtent les mangues ? »" />
        <div className="row between" style={{ marginTop: 12 }}>
          <div className="row">
            {canDictate && <button className={'ic' + (rec ? ' rec' : '')} onClick={mic} title="Dicter"><Icon name="mic" size={18} /></button>}
            <button className="ghost" onClick={() => setText('Bonne arrivée ! Tu as bien dormi ?')}>Accueil</button>
            <button className="ghost" onClick={() => setText("Combien ça coûte ? C'est trop cher, diminue un peu.")}>Marché</button>
          </div>
          <button className="btn" onClick={go} disabled={busy}>Traduire & apprendre →</button>
        </div>
        {busy && <Loader text="Analyse de la phrase…" />}
        {err && <div className="err">{err}</div>}
      </div>

      {res && <div className="result">
        <div className="card">
          <div className="row between top nowrap">
            <div style={{ minWidth: 0 }}>
              <div className="big">{res.translation}</div>
              {res.pronunciation && <div className="pron">🗣 {res.pronunciation}</div>}
            </div>
            <div className="row nowrap">
              <button className="ic" onClick={() => speak(res.translation, res.to)} title="Écouter"><Icon name="sound" size={18} /></button>
              <button className="ic" title="Copier" onClick={() => navigator.clipboard.writeText(res.translation).then(() => notify('Copié'), () => notify('Copie impossible'))}><Icon name="copy" size={18} /></button>
            </div>
          </div>
          <div className="badges">
            <span className="badge">{langName(from)} → {langName(res.to)}</span>
            <span className="badge">Registre : {res.register}</span>
            <span className={'badge ' + rel}>Fiabilité : {res.reliability}</span>
            <span className="badge">Moteur : {res.source === 'google' ? 'Google Traduction + IA' : 'IA Gemini'}</span>
            {LOCAL.includes(res.to) && <span className="badge">🌍 Fais valider par un locuteur natif</span>}
          </div>
          <div className="sec-t">Mot à mot — touche pour enregistrer</div>
          <div className="words">
            {(res.breakdown || []).map((w, i) => (
              <button key={i} className={'word' + (saved(w.word, res.to) ? ' saved' : '')} onClick={() => save(w)}>
                <b>{w.word}</b><span>{w.meaning}{w.note ? ' · ' + w.note : ''}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid2">
          <div className="card"><div className="sec-t">Autres façons de le dire</div>
            {(res.alternatives || []).map((a, i) => <div className="alt" key={i}>{a.text}<i>{a.when}</i></div>)}
          </div>
          <div className="card"><div className="sec-t">Contexte & culture</div><p className="note">{res.culture}</p>
            {res.example && <><div className="sec-t" style={{ marginTop: 16 }}>Exemple</div>
              <p className="note"><b>{res.example.target}</b><br /><span className="mut">{res.example.fr}</span></p></>}
          </div>
        </div>
      </div>}
    </section>
  )
}
