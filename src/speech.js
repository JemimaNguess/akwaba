import { bcp47, LOCAL } from './data.js'

export function speak(text, lang) {
  try {
    const u = new SpeechSynthesisUtterance(text)
    const b = bcp47(lang)
    if (b && !LOCAL.includes(lang)) u.lang = b
    speechSynthesis.cancel()
    speechSynthesis.speak(u)
  } catch { /* navigateur sans synthèse vocale */ }
}

const Rec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
export const canDictate = !!Rec

// Démarre la dictée ; renvoie une fonction pour l'arrêter
export function dictate(lang, { onText, onEnd }) {
  if (!Rec) return () => {}
  const r = new Rec()
  r.lang = bcp47(lang) || 'fr-FR'
  r.interimResults = true
  r.onresult = e => onText([...e.results].map(x => x[0].transcript).join(''))
  r.onend = onEnd
  r.onerror = onEnd
  r.start()
  return () => r.stop()
}
