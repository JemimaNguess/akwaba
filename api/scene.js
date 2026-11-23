import { clip, gemini, isLang, langName } from './_lib/ai.js'
import { handle, onlyMethods, requireUser, send } from './_lib/http.js'

export default handle(async (req, res) => {
  if (!onlyMethods(req, res, ['POST'])) return
  if (!requireUser(req, res)) return
  const { scene, lang, history = [], message } = req.body || {}
  if (!scene?.char || !isLang(lang)) return send(res, 400, { error: 'Scène invalide.' })
  const hist = (Array.isArray(history) ? history.slice(-16) : [])
    .map(h => `${h.who === 'me' ? 'APPRENANT' : 'PERSONNAGE'}: ${clip(h.t, 400)}`).join('\n')
  const prompt = `Tu joues un personnage dans une scène d'apprentissage de langue.
Personnage : ${clip(scene.char, 200)}. Lieu : ${clip(scene.t, 100)}. Objectif de l'apprenant : ${clip(scene.goal, 200)}.
Langue cible : ${langName(lang)}. L'apprenant est francophone (débutant à intermédiaire).
Règles : parle UNIQUEMENT en ${langName(lang)} dans "reply", phrases courtes et naturelles, ancrées dans la vraie vie (en Côte d'Ivoire si pertinent). Fais avancer l'histoire. Si l'apprenant écrit en français, réponds quand même dans la langue cible et montre-lui la phrase qu'il aurait pu dire.
Corrige sa DERNIÈRE réponse avec bienveillance (grammaire, orthographe, naturel).
Conversation :
${hist || "(début : c'est toi qui ouvres la scène ; correction.ok=true, corrected='')"}
${message ? `Dernière réponse de l'apprenant : """${clip(message, 400)}"""` : ''}
JSON uniquement : {"reply":"…","reply_fr":"traduction française de reply","correction":{"ok":true,"corrected":"…","explain":"explication courte en français"},"hint":"idée de réponse dans la langue cible (sens en français entre parenthèses)","progress":0,"weak_point":"notion à retravailler si erreur, sinon ''"}
progress = pourcentage (0-100) d'avancement vers l'objectif.`
  send(res, 200, await gemini(prompt))
})
