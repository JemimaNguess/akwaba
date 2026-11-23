export const LANGS = [
  ['fr', 'Français', 'fr-FR'], ['en', 'Anglais', 'en-US'], ['es', 'Espagnol', 'es-ES'], ['de', 'Allemand', 'de-DE'],
  ['pt', 'Portugais', 'pt-PT'], ['ar', 'Arabe', 'ar-SA'], ['zh', 'Chinois', 'zh-CN'],
  ['bci', 'Baoulé', ''], ['dyu', 'Dioula', ''], ['wo', 'Wolof', ''], ['fon', 'Fon', ''], ['bm', 'Bambara', ''],
  ['yo', 'Yoruba', ''], ['ln', 'Lingala', ''], ['sw', 'Swahili', 'sw-KE']
]
export const LOCAL = ['bci', 'dyu', 'wo', 'fon', 'bm', 'yo', 'ln']
export const langName = c => LANGS.find(l => l[0] === c)?.[1] || c
export const bcp47 = c => LANGS.find(l => l[0] === c)?.[2] || ''

export const SCENES = [
  { em: '🥭', t: "Marché d'Adjamé", d: 'Acheter des mangues et négocier le prix', char: 'Tantie Akissi, vendeuse chaleureuse mais qui négocie dur', goal: 'Acheter 5 mangues à un bon prix' },
  { em: '🚕', t: 'Woro-woro', d: 'Donner ta destination et fixer le tarif', char: 'Moussa, chauffeur de woro-woro bavard', goal: 'Arriver à Cocody au juste prix' },
  { em: '✈️', t: 'Aéroport', d: 'Enregistrement, bagage en trop, porte', char: "Agent d'enregistrement pressé mais poli", goal: "Obtenir ta carte d'embarquement" },
  { em: '💼', t: "Entretien d'embauche", d: 'Te présenter comme développeuse', char: "Recruteuse d'une startup tech", goal: 'Convaincre avec ton parcours et tes projets' },
  { em: '💊', t: 'Pharmacie', d: 'Expliquer un symptôme simple', char: 'Pharmacien attentionné', goal: 'Obtenir un conseil et payer' },
  { em: '🎉', t: 'Rencontre en soirée', d: 'Faire connaissance, parler de toi', char: "Quelqu'un de sympathique rencontré à un anniversaire", goal: 'Échanger vos contacts' }
]

export const INTERVALS = [0, 1, 3, 7, 16, 35]
export const today = () => new Date().toISOString().slice(0, 10)
export const EMPTY = { xp: 0, days: {}, streak: 0, last: null, words: [], weak: [], scenesDone: 0, translations: 0 }
