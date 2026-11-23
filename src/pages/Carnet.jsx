import React, { useMemo, useState } from 'react'
import { api } from '../api.js'
import { INTERVALS, langName, today } from '../data.js'
import { speak } from '../speech.js'
import { Icon } from '../components/Icon.jsx'
import { Loader } from '../components/Loader.jsx'

export default function Carnet({ S, update, addXP, go }) {
  const [tab, setTab] = useState('liste')
  const [filter, setFilter] = useState('all')
  const due = S.words.filter(x => x.due <= today())
  const langs = [...new Set(S.words.map(w => w.l))]

  const Empty = ({ children }) => (
    <div className="card empty"><span className="em">📒</span>{children}<br /><br /><button className="btn" onClick={() => go('traduire')}>Aller traduire</button></div>
  )

  return (
    <section className="view">
      <h1>Ton carnet <em>vivant</em></h1>
      <p className="sub">Les mots que tu as choisis, révisés au bon moment grâce à la répétition espacée.</p>
      <div className="tabs">
        <button className={'tab' + (tab === 'liste' ? ' on' : '')} onClick={() => setTab('liste')}>Mes mots ({S.words.length})</button>
        <button className={'tab' + (tab === 'reviser' ? ' on' : '')} onClick={() => setTab('reviser')}>Réviser {due.length > 0 && <span className="pill">{due.length}</span>}</button>
        <button className={'tab' + (tab === 'quiz' ? ' on' : '')} onClick={() => setTab('quiz')}>Quiz IA sur mes mots</button>
      </div>

      {tab === 'liste' && (!S.words.length
        ? <Empty>Ton carnet est vide. Traduis une phrase et touche les mots qui t’intéressent.</Empty>
        : <>
          {langs.length > 1 && <div className="tabs">
            <button className={'tab sm' + (filter === 'all' ? ' on' : '')} onClick={() => setFilter('all')}>Toutes</button>
            {langs.map(l => <button key={l} className={'tab sm' + (filter === l ? ' on' : '')} onClick={() => setFilter(l)}>{langName(l)}</button>)}
          </div>}
          <div className="list">
            {S.words.filter(x => filter === 'all' || x.l === filter).map(x => (
              <div className="item" key={x.id}>
                <div className="w"><b>{x.w}</b><span>{x.m} · {langName(x.l)}</span></div>
                <div className="lvl" title={`Niveau ${x.box}/5`}>{[1, 2, 3, 4, 5].map(i => <i key={i} className={x.box >= i ? 'f' : ''} />)}</div>
                <button className="ic" onClick={() => speak(x.w, x.l)} title="Écouter"><Icon name="sound" size={18} /></button>
                <button className="ic" onClick={() => update(s => { s.words = s.words.filter(y => y.id !== x.id); return s })} title="Supprimer"><Icon name="trash" size={18} /></button>
              </div>
            ))}
          </div>
        </>)}

      {tab === 'reviser' && (!S.words.length ? <Empty>Rien à réviser pour l’instant.</Empty>
        : !due.length ? <div className="card empty"><span className="em">🌙</span>Tout est à jour ! Tes mots reviendront juste avant que tu les oublies.</div>
        : <Flash key={due[0].id} x={due[0]} left={due.length} update={update} addXP={addXP} />)}

      {tab === 'quiz' && (S.words.length < 3
        ? <Empty>Il faut au moins 3 mots dans ton carnet pour un quiz personnalisé.</Empty>
        : <Quiz S={S} update={update} addXP={addXP} />)}
    </section>
  )
}

function Flash({ x, left, update, addXP }) {
  const [flip, setFlip] = useState(false)
  function answer(ok) {
    update(s => {
      const w = s.words.find(y => y.id === x.id); if (!w) return s
      w.box = ok ? Math.min(w.box + 1, 5) : 0
      w.due = ok ? new Date(Date.now() + INTERVALS[w.box] * 864e5).toISOString().slice(0, 10) : today()
      if (!ok) { s.words = s.words.filter(y => y !== w); s.words.push(w) }
      return s
    })
    addXP(ok ? 3 : 1)
  }
  return (
    <div className="flash">
      <p className="mut center" style={{ marginBottom: 14 }}>{left} carte(s) à revoir</p>
      <div className={'fc' + (flip ? ' flip' : '')} onClick={() => setFlip(!flip)}>
        <div className="front"><div className="bigw">{x.w}</div><small>{langName(x.l)} · touche pour retourner</small></div>
        <div className="back"><div className="bigw sm">{x.m}</div><small>{x.ctx}</small></div>
      </div>
      <div className="row center" style={{ marginTop: 18 }}>
        <button className="ghost" onClick={() => answer(false)}>😅 Pas encore</button>
        <button className="ic" onClick={() => speak(x.w, x.l)}><Icon name="sound" size={18} /></button>
        <button className="btn" onClick={() => answer(true)}>Je savais ✓</button>
      </div>
    </div>
  )
}

function Quiz({ S, update, addXP }) {
  const [Q, setQ] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function gen() {
    setBusy(true); setErr('')
    try {
      const r = await api('quiz', { method: 'POST', body: { words: S.words.slice(0, 15), weak: S.weak } })
      setQ({ qs: r.questions || [], i: 0, score: 0 })
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  if (!Q) return (
    <div className="card empty"><span className="em">🧠</span>Un quiz unique, fabriqué à partir de <b>tes</b> mots et de <b>tes</b> erreurs.<br /><br />
      <button className="btn" onClick={gen} disabled={busy}>Générer mon quiz</button>
      {busy && <Loader text="Préparation…" />}{err && <div className="err">{err}</div>}
    </div>
  )
  if (Q.i >= Q.qs.length) return (
    <div className="card empty"><span className="em">{Q.score >= 4 ? '🏆' : '💪'}</span>
      <h2 className="serif">{Q.score}/{Q.qs.length}</h2>
      <p>{Q.score >= 4 ? 'Excellent, ces mots t’appartiennent.' : 'Tes erreurs sont notées : elles reviendront au prochain quiz.'}</p><br />
      <button className="btn" onClick={() => setQ(null)}>Nouveau quiz</button>
    </div>
  )
  const next = ok => {
    if (!ok) update(s => { s.weak.push(Q.qs[Q.i].question.slice(0, 60)); s.weak = s.weak.slice(-30); return s })
    else addXP(4)
    return () => setQ(q => ({ ...q, i: q.i + 1, score: q.score + (ok ? 1 : 0) }))
  }
  return (
    <>
      <div className="progress"><div style={{ width: (Q.i / Q.qs.length * 100) + '%' }} /></div>
      <Question key={Q.i} q={Q.qs[Q.i]} n={Q.i + 1} total={Q.qs.length} onDone={next} />
    </>
  )
}

function Question({ q, n, total, onDone }) {
  const [picked, setPicked] = useState(null)
  const [ans, setAns] = useState([])
  const [result, setResult] = useState(null) // {ok, cont}
  const pool = useMemo(() => (q.tokens || []).map((t, i) => ({ t, i })).sort(() => Math.random() - 0.5), [q])

  const finish = ok => setResult({ ok, cont: onDone(ok) })

  return (
    <div className="card">
      <div className="sec-t">Question {n}/{total}</div>
      <p className="big q">{q.question}</p>
      {q.type === 'ordre' ? <>
        <div className={'answer' + (result ? (result.ok ? ' good' : ' bad') : '')}>
          {ans.map(o => <button key={o.i} className="tok" disabled={!!result} onClick={() => setAns(a => a.filter(x => x !== o))}>{o.t}</button>)}
        </div>
        <div className="pool">
          {pool.filter(o => !ans.includes(o)).map(o => <button key={o.i} className="tok" disabled={!!result} onClick={() => setAns(a => [...a, o])}>{o.t}</button>)}
        </div>
        {!result && <button className="btn" style={{ marginTop: 12 }} onClick={() => finish(ans.map(o => o.t).join(' ') === q.tokens.join(' '))}>Vérifier</button>}
        {result && !result.ok && <p className="note">Réponse : <b>{q.tokens.join(' ')}</b></p>}
      </> : (q.options || []).map((o, i) => (
        <button key={i} disabled={picked !== null}
          className={'q-opt' + (picked !== null && i === q.answer ? ' good' : '') + (picked === i && i !== q.answer ? ' bad' : '')}
          onClick={() => { setPicked(i); finish(i === q.answer) }}>{o}</button>
      ))}
      {result && <div className="note" style={{ marginTop: 12 }}>
        <b className={result.ok ? 'okc' : 'koc'}>{result.ok ? 'Bravo !' : 'Presque…'}</b> {q.explain}<br /><br />
        <button className="btn" onClick={result.cont}>Continuer →</button>
      </div>}
    </div>
  )
}
