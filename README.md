# Akwaba 🌍 — apprendre une langue en la vivant

Appli web d'apprentissage des langues, pensée pour corriger les limites de Duolingo :

| Limite de Duolingo | Réponse d'Akwaba |
|---|---|
| Phrases absurdes hors contexte | Tu traduis **tes** phrases, et chaque traduction devient une leçon (mot à mot, prononciation, registre, culture) |
| Pas de vraie conversation | **Scènes** réelles (marché d'Adjamé, woro-woro, entretien…) avec un personnage IA qui te corrige à chaque réponse |
| Peu de langues africaines | Baoulé, dioula, wolof, fon, bambara, yoruba, lingala, swahili + langues internationales |
| Même parcours pour tout le monde | **Carnet** de tes mots, répétition espacée, **quiz générés** à partir de tes mots et de tes erreurs |
| Progrès = temps passé | Mots maîtrisés, scènes réussies, points faibles repérés |

Compte avec **pseudo + mot de passe** : ta progression est enregistrée en ligne et tu la retrouves sur n'importe quel appareil.

## Stack (100 % gratuite, sans PHP)
- **Front** : React 18 + Vite
- **Serveur** : fonctions serverless Node.js de Vercel (dossier `api/`)
- **Base de données** : Postgres Neon (offre gratuite, intégrée à Vercel)
- **Connexion** : mots de passe hachés avec bcrypt, session par jeton JWT (30 jours)
- **IA** : Gemini (clé gratuite) pour les leçons, scènes et quiz
- **Traduction** : Google Cloud Translation si tu ajoutes une clé, sinon Gemini traduit
- **Voix** : synthèse et dictée du navigateur (la dictée marche sur Chrome et Edge)

## Mise en ligne sur Vercel (≈ 15 min)

1. **Mets le projet sur GitHub**
   ```bash
   git init && git add . && git commit -m "Akwaba"
   # crée un dépôt vide "akwaba" sur github.com, puis :
   git remote add origin https://github.com/TON-COMPTE/akwaba.git
   git push -u origin main
   ```
2. Sur **vercel.com** → *Add New → Project* → importe le dépôt → *Deploy* (Vercel détecte Vite tout seul).
3. Dans ton projet Vercel → onglet **Storage** → *Create Database* → **Neon** (Postgres) → *Connect*.
   La variable `DATABASE_URL` est ajoutée automatiquement.
4. Onglet **Settings → Environment Variables**, ajoute :
   - `JWT_SECRET` : une longue phrase secrète (ex. 40 caractères au hasard)
   - `GEMINI_API_KEY` : ta clé gratuite sur https://aistudio.google.com/apikey
   - `GEMINI_MODEL` (optionnel) : par défaut `gemini-3.5-flash`
   - `GOOGLE_TRANSLATE_API_KEY` (optionnel, demande un compte de facturation Google Cloud)
5. Onglet **Deployments** → *Redeploy*. C'est en ligne ✅

Les tables se créent toutes seules à la première inscription (voir `schema.sql`).

## Lancer sur ton PC
Il faut **Node.js 18+** (https://nodejs.org).
```bash
npm install
npm i -g vercel
vercel link          # relie le dossier à ton projet Vercel
vercel env pull .env.local   # récupère les variables
vercel dev           # lance front + API sur http://localhost:3000
```
`npm run dev` lance seulement le front (sans API).

## Structure
```
api/
  _lib/db.js        connexion Neon + création des tables
  _lib/http.js      JWT, erreurs, méthodes
  _lib/ai.js        Gemini + Google Translate
  auth/register.js  inscription (pseudo + mot de passe)
  auth/login.js     connexion
  progress.js       lecture / sauvegarde de la progression
  translate.js      traduction + mini-leçon
  scene.js          conversation avec un personnage
  quiz.js           quiz personnalisé
src/
  App.jsx           navigation, session, synchro cloud
  pages/            Auth, Translate, Scenes, Carnet, Progress
  styles.css        thème clair turquoise / saumon / vert anis
```

## Idées pour la suite
- Mode hors ligne (PWA) et installation sur l'écran d'accueil
- Corrections de la communauté pour les langues locales (audio enregistré par des locuteurs)
- Classement entre amis, défis hebdomadaires
- Limitation du nombre d'essais de connexion (anti-force brute)
