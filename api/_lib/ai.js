const NAMES = {
  fr: 'français', en: 'anglais', es: 'espagnol', de: 'allemand', pt: 'portugais', ar: 'arabe', zh: 'chinois',
  bci: 'baoulé', dyu: 'dioula', wo: 'wolof', fon: 'fon', bm: 'bambara', yo: 'yoruba', ln: 'lingala', sw: 'swahili'
}
export const langName = c => NAMES[c] || c
export const isLang = c => Object.prototype.hasOwnProperty.call(NAMES, c)

const FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash']

// Appelle Gemini et renvoie un objet JSON
export async function gemini(prompt) {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw Object.assign(new Error(), { status: 500, publicMessage: 'GEMINI_API_KEY manquant côté serveur.' })
  const models = [process.env.GEMINI_MODEL, ...FALLBACK_MODELS].filter((m, i, a) => m && a.indexOf(m) === i)
  let lastErr
  for (const model of models) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
      })
    })
    if (r.status === 404) { lastErr = `Modèle ${model} introuvable`; continue }
    if (r.status === 429) throw Object.assign(new Error(), { status: 429, publicMessage: "Trop de demandes à l'IA, réessaie dans une minute." })
    if (!r.ok) { lastErr = `Gemini ${r.status}: ${(await r.text()).slice(0, 200)}`; continue }
    const data = await r.json()
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || ''
    try { return JSON.parse(text.replace(/^```json\s*|```$/g, '').trim()) }
    catch { lastErr = 'Réponse IA illisible'; continue }
  }
  throw Object.assign(new Error(lastErr), { status: 502, publicMessage: "L'IA n'a pas pu répondre. " + (lastErr || '') })
}

// Google Cloud Translation (optionnel)
export async function googleTranslate(text, from, to) {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!key) return null
  const r = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source: from, target: to, format: 'text' })
  })
  if (!r.ok) { console.warn('Google Translate', r.status, await r.text()); return null }
  const d = await r.json()
  return d?.data?.translations?.[0]?.translatedText || null
}

export const clip = (s, n) => String(s ?? '').slice(0, n)
