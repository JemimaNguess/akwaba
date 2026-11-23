import { clip, gemini, langName } from './_lib/ai.js'
import { handle, onlyMethods, requireUser, send } from './_lib/http.js'

export default handle(async (req, res) => {
  if (!onlyMethods(req, res, ['POST'])) return
  if (!requireUser(req, res)) return
  const words = (req.body?.words || []).slice(0, 15).map(x => `${clip(x.w, 60)} (${langName(x.l)}) = ${clip(x.m, 80)}`).join('; ')
  const weak = (req.body?.weak || []).slice(-6).map(w => clip(w, 80)).join('; ')
  if (!words) return send(res, 400, { error: 'Aucun mot.' })
  const prompt = `Crée un quiz de 5 questions pour un apprenant francophone à partir de SES mots : ${words}.
Ses erreurs récentes : ${weak || 'aucune'}.
3 questions "qcm" et 2 questions "ordre" (remettre une phrase courte dans l'ordre, dans la langue apprise, avec ses mots).
JSON uniquement : {"questions":[{"type":"qcm","question":"…","options":["a","b","c","d"],"answer":0,"explain":"…"},{"type":"ordre","question":"Traduis : …","tokens":["mot1","mot2"],"explain":"…"}]}
Pour "ordre", tokens est dans le BON ordre. Explications courtes, en français.`
  send(res, 200, await gemini(prompt))
})
