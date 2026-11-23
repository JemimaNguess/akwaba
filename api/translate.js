import { clip, gemini, googleTranslate, isLang, langName } from './_lib/ai.js'
import { handle, onlyMethods, requireUser, send } from './_lib/http.js'

export default handle(async (req, res) => {
  if (!onlyMethods(req, res, ['POST'])) return
  if (!requireUser(req, res)) return
  const text = clip(req.body?.text, 600).trim()
  const { from, to } = req.body || {}
  if (!text) return send(res, 400, { error: 'Texte vide.' })
  if (!isLang(from) || !isLang(to) || from === to) return send(res, 400, { error: 'Langues invalides.' })

  const google = await googleTranslate(text, from, to)
  const prompt = `Tu es un professeur de langues expert des langues africaines et internationales, en particulier de Côte d'Ivoire.
${google
  ? `Google Traduction a traduit ce texte du ${langName(from)} vers le ${langName(to)} par : """${google}""". Garde cette traduction dans "translation" sauf erreur manifeste (dans ce cas corrige-la et dis-le dans "culture").`
  : `Traduis le texte du ${langName(from)} vers le ${langName(to)}.`}
Transforme la traduction en mini-leçon pour un apprenant francophone.
Sois honnête : pour les langues peu dotées (baoulé, dioula, fon, wolof…), mets une fiabilité "moyenne" ou "faible" si tu n'es pas sûr, et signale les variantes régionales.
Texte : """${text}"""
Réponds UNIQUEMENT en JSON :
{"translation":"…","pronunciation":"prononciation simplifiée pour un francophone (vide si la cible est le français)",
"register":"familier|courant|soutenu","reliability":"haute|moyenne|faible",
"breakdown":[{"word":"mot ou groupe de la traduction","meaning":"sens en français","note":"rôle ou astuce courte"}],
"alternatives":[{"text":"autre formulation dans la langue cible","when":"quand l'utiliser"}],
"culture":"2-3 phrases en français sur l'usage réel, la politesse, les pièges",
"example":{"target":"phrase d'exemple réutilisant un mot clé","fr":"sa traduction"}}
breakdown : 3 à 8 éléments. alternatives : 2 éléments.`
  const lesson = await gemini(prompt)
  send(res, 200, { ...lesson, source: google ? 'google' : 'gemini' })
})
