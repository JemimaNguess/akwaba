import React from 'react'

export default function Progress({ S, pseudo }) {
  const mastered = S.words.filter(x => x.box >= 4).length
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 864e5)
    return { k: d.toISOString().slice(0, 10), l: 'DLMMJVS'[d.getDay()] }
  })
  const max = Math.max(10, ...days.map(d => S.days[d.k] || 0))
  const weak = [...new Set(S.weak)].slice(-6).reverse()
  const kpis = [['🔥', S.streak, 'jours de suite', 'sal'], ['✨', S.xp, 'XP au total', 'anis'], ['📒', S.words.length, 'mots dans ton carnet', 'tur'],
    ['🏅', mastered, 'mots maîtrisés', 'anis'], ['🎭', S.scenesDone, 'scènes réussies', 'sal'], ['🔁', S.translations, 'traductions-leçons', 'tur']]
  return (
    <section className="view">
      <h1>Ta progression, <em>{pseudo}</em></h1>
      <p className="sub">Des chiffres qui mesurent ce que tu sais faire, pas juste le temps passé.</p>
      <div className="kpis">{kpis.map(k => <div key={k[2]} className={'card kpi ' + k[3]}>{k[0]}<b>{k[1]}</b><span>{k[2]}</span></div>)}</div>
      <div className="grid2">
        <div className="card"><div className="sec-t">XP des 7 derniers jours</div>
          <div className="week">{days.map(d => <div key={d.k}><i style={{ height: ((S.days[d.k] || 0) / max * 90) + '%' }} />{d.l}</div>)}</div>
        </div>
        <div className="card"><div className="sec-t">Tes points faibles</div>
          <div className="note">{weak.length ? weak.map((w, i) => <div key={i}>• {w}</div>) : 'Aucun pour l’instant. Lance une scène : chaque erreur repérée apparaîtra ici et nourrira tes quiz.'}</div>
        </div>
      </div>
    </section>
  )
}
