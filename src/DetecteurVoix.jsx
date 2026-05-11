import { useState } from "react"

const LOADING_MSGS = [
  "Scan des patterns IA…",
  "Détection des marqueurs humains…",
  "Analyse du hook et de la structure…",
  "Évaluation de la personnalité…",
  "Calcul du score d'authenticité…",
  "Génération des recommandations…",
]

// ── AI patterns ────────────────────────────────────────────────
const AI_RULES = [
  // Ouvertures génériques
  { r: /dans un monde o[uù]/gi, label: "Ouverture générique IA", sev: "high" },
  { r: /[àa] l[''']ère (du|de la|des)/gi, label: "Cliché d'époque", sev: "high" },
  // Structures révélation IA
  { r: /la cl[eé] de .{0,60}ce n[''']est pas/gi, label: "Révélation en contraste IA", sev: "high" },
  { r: /mais la vraie le[çc]on/gi, label: "Révélation IA (vraie leçon)", sev: "high" },
  { r: /la v[eé]rit[eé] que personne/gi, label: "Révélation IA (vérité cachée)", sev: "high" },
  { r: /voici le (syst[eè]me|framework|process|protocole|plan) (exact|complet|pr[eé]cis)/gi, label: "Framework 'exact' IA", sev: "high" },
  // Triple négation fragments
  { r: /sans [\w''éàèêùû]+\.\s+sans [\w''éàèêùû]+\.\s+sans [\w''éàèêùû]+\./gi, label: "Triple négation IA", sev: "high" },
  // Claims de masse
  { r: /l[''']erreur que \d+\s?%\s*(des?|de la)/gi, label: "Statistique d'erreur de masse", sev: "high" },
  { r: /\d+\s?%\s*(des?|de la)\s+(cr[eé]ateurs?|gens|personnes|entrepreneurs?|freelances?|marketeurs?|utilisateurs?|experts?)/gi, label: "Statistique de masse", sev: "medium" },
  { r: /ce que \d+\s?%\s*(des?|de la|des créateurs|des gens)/gi, label: "Statistique de masse", sev: "medium" },
  // Confession de durée IA
  { r: /j[''']ai (mis|pass[eé]) \d+ (ans?|mois|ann[eé]es?) [àa] (comprendre|apprendre|r[eé]aliser|d[eé]couvrir)/gi, label: "Confession de durée IA", sev: "medium" },
  // Conclusions pseudo-logiques
  { r: /c[''']est math[eé]matique\.?/gi, label: "Conclusion pseudo-logique IA", sev: "high" },
  { r: /fais le calcul\.?/gi, label: "Impératif condescendant IA", sev: "medium" },
  { r: /c[''']est tout\.\s*(\n|$)/gim, label: "Conclusion dramatique IA", sev: "medium" },
  { r: /c[''']est aussi simple que [çc]a\.?/gi, label: "Conclusion pseudo-simple IA", sev: "medium" },
  // Anti-liste IA
  { r: /tu n[''']as pas besoin de (plus de|davantage de|encore plus de)/gi, label: "Anti-liste IA", sev: "medium" },
  // Impératifs formels
  { r: /il est (essentiel|crucial|fondamental|primordial) de/gi, label: "Impératif formel", sev: "high" },
  { r: /il convient de (noter|mentionner|souligner)/gi, label: "Précaution académique", sev: "high" },
  { r: /ce qu[''']il faut retenir/gi, label: "Structure pédagogique IA", sev: "high" },
  // Conclusions explicites
  { r: /en conclusion[\s,]/gi, label: "Conclusion explicite IA", sev: "high" },
  { r: /pour conclure[\s,]/gi, label: "Conclusion IA", sev: "high" },
  { r: /en r[eé]sum[eé][\s,]/gi, label: "Résumé formel IA", sev: "high" },
  // Connecteurs formels
  { r: /par ailleurs[\s,]/gi, label: "Connecteur formel", sev: "medium" },
  { r: /en outre[\s,]/gi, label: "Connecteur formel", sev: "medium" },
  { r: /n[eé]anmoins[\s,]/gi, label: "Connecteur formel", sev: "medium" },
  { r: /en somme[\s,]/gi, label: "Résumé formel", sev: "medium" },
  { r: /toutefois[\s,]/gi, label: "Pivot formel", sev: "low" },
  { r: /en revanche[\s,]/gi, label: "Pivot formel", sev: "low" },
  { r: /cependant[\s,]/gi, label: "Pivot formel", sev: "low" },
  // Distance / politesse froide
  { r: /n[''']h[eé]sitez pas [àa]/gi, label: "Invitation froide", sev: "medium" },
  { r: /je vous invite [àa]/gi, label: "Formulation distante", sev: "medium" },
  // CTAs génériques
  { r: /qu[''']en pensez-vous\s*\?/gi, label: "CTA générique", sev: "medium" },
  { r: /dites-moi en commentaires/gi, label: "CTA de masse", sev: "medium" },
  { r: /partagez (cet article|cette publication|ce post)/gi, label: "Partage générique", sev: "medium" },
  // Promesses génériques
  { r: /passer au niveau sup[eé]rieur/gi, label: "Cliché ascendant", sev: "medium" },
  { r: /transformer (votre|ton|sa) (vie|carri[eè]re|business)/gi, label: "Promesse générique", sev: "medium" },
  { r: /optimiser (votre|ton)/gi, label: "Verbe générique", sev: "low" },
  { r: /maximiser (votre|ton|le)/gi, label: "Verbe générique", sev: "low" },
  // Accroches IA
  { r: /voici (comment|pourquoi|les \d+|ce que)/gi, label: "Accroche IA courante", sev: "low" },
  { r: /les \d+ (raisons|erreurs|cl[eé]s|conseils|[eé]tapes) (pour|de|que)/gi, label: "Titre listicle IA", sev: "high" },
  // Double négation rhétorique IA ("Pas X. Pas Y.")
  { r: /[Pp]as [^.!?\n]{2,50}\.\s*[Pp]as [^.!?\n]{2,50}\./g, label: "Double négation IA", sev: "high" },
  // "ou pas du tout" — fin dramatique IA
  { r: /ou pas du tout[.!\s]/gi, label: "Conclusion dramatique IA", sev: "medium" },
  // Transition méthode IA
  { r: /ce que j[''']applique (maintenant|désormais|aujourd'hui|sur chaque)/gi, label: "Transition méthode IA", sev: "medium" },
  // Formules psychologiques génériques IA
  { r: /son premier réflexe/gi, label: "Formule psychologique IA", sev: "medium" },
  { r: /investir (son|leur) attention/gi, label: "Formule psychologique IA", sev: "medium" },
  { r: /[Ll]e visiteur (froid|est déjà|ne lit|ne lis)/gi, label: "Généralisation 'visiteur' IA", sev: "medium" },
  // "La confiance / la preuve sociale" — généralisation abstraite IA
  { r: /[Ll]a confiance (ne |se (construit|pose|crée|gagne))/gi, label: "Maxime abstraite IA", sev: "medium" },
  { r: /[Ll]a preuve sociale (se |est )/gi, label: "Généralisation abstraite IA", sev: "medium" },
]

// ── Human markers ──────────────────────────────────────────────
const HUMAN_RULES = [
  // Chiffres précis — format français (3 000, 1 000 000) + évite le faux positif "000"
  { r: /(?<!\d )\b\d+(?:\s\d{3})*\s?[€$]/g, label: "Chiffre financier précis", qual: "high" },
  { r: /(?<!\d )\b\d+(?:\s\d{3})*\s?k[€$]/g, label: "Chiffre financier précis", qual: "high" },
  { r: /(?<!\d )\b\d+(?:\s\d{3})*\s?(calls?|dms?|messages?|connexions?|abonn[eé]s?|followers?|contacts?|prospects?|clients?|leads?|posts?|likes?|commentaires?|vues?|impressions?|personnes?|candidats?|collaborateurs?|missions?|projets?|heures?|jours?|semaines?|mois|fois|minutes?|ans?)/gi, label: "Chiffre terrain précis", qual: "high" },
  // Pourcentages personnels (résultats propres, pas statistiques de masse)
  { r: /\b\d+\s?%\s*(de |d[''']|en |moins|plus|du|des impressions|des vues|du trafic)/gi, label: "Pourcentage personnel précis", qual: "high" },
  // Ratios multiplicatifs
  { r: /\b\d+x\s+(plus|moins|leur)/gi, label: "Ratio multiplicatif", qual: "high" },
  { r: /\b(2|3|4|5|6|7|8|9|10)x\s+\w/gi, label: "Ratio multiplicatif", qual: "high" },
  // Ancrage temporel
  { r: /l[''']autre jour/gi, label: "Anecdote récente", qual: "medium" },
  { r: /ce matin/gi, label: "Ancrage temporel", qual: "medium" },
  { r: /\bhier\b/gi, label: "Ancrage temporel", qual: "medium" },
  { r: /la semaine derni[eè]re/gi, label: "Ancrage temporel", qual: "medium" },
  { r: /en (janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre) \d{4}/gi, label: "Date précise", qual: "high" },
  { r: /il y a \d+ (jours?|semaines?|mois|ans?)/gi, label: "Repère temporel précis", qual: "high" },
  { r: /de (novembre|d[eé]cembre|janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre) [àa] (novembre|d[eé]cembre|janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre)/gi, label: "Période personnelle précise", qual: "high" },
  // Registre oral direct
  { r: /\bmec\b/gi, label: "Adresse informelle", qual: "high", expand: true },
  { r: /\bnan\b/gi, label: "Négation orale", qual: "high", expand: true },
  { r: /\bouais\b/gi, label: "Registre oral", qual: "medium", expand: true },
  { r: /\bmdrr+\b/gi, label: "Registre oral (rire écrit)", qual: "medium", expand: true },
  { r: /\bwsh\b|\bc[''']est chaud\b/gi, label: "Argot générationnel", qual: "high", expand: true },
  { r: /\bteas[eé]\b|\bteaste\b/gi, label: "Registre informel", qual: "medium" },
  { r: /\bà 100%\b|\bà fond\b/gi, label: "Intensificateur oral", qual: "medium" },
  { r: /\bbalanc[eé]r?\b/gi, label: "Verbe oral (argot)", qual: "medium" },
  { r: /t[''']inquiète/gi, label: "Registre oral familier", qual: "medium", expand: true },
  { r: /y[''']a des/gi, label: "Tournure orale (y'a)", qual: "medium" },
  // Aveux et prise de position
  { r: /franchement/gi, label: "Ton direct assumé", qual: "high", expand: true },
  { r: /honn[eê]tement/gi, label: "Aveu sincère", qual: "high", expand: true },
  { r: /bizarrement/gi, label: "Observation personnelle", qual: "high", expand: true },
  { r: /j[''']assume/gi, label: "Prise de position", qual: "high", expand: true },
  { r: /j[''']avais tort/gi, label: "Revirement sincère", qual: "high", expand: true },
  { r: /\bmême moi\b/gi, label: "Aveu personnel", qual: "high", expand: true },
  { r: /j[''']y suis all[eé] (un peu|trop) fort/gi, label: "Autocorrection orale", qual: "high", expand: true },
  { r: /je t[''']assure|j[''']te l[''']assure|j[''']te jure/gi, label: "Engagement direct", qual: "high", expand: true },
  { r: /et tu me connais/gi, label: "Formule personnelle", qual: "high", expand: true },
  { r: /j[''']ai (commis|fait) (une? )?(erreur|faute|connerie)/gi, label: "Aveu d'erreur", qual: "high", expand: true },
  { r: /j[''']ai chang[eé] d[''']avis/gi, label: "Évolution d'opinion", qual: "high", expand: true },
  // Jugement cru / provocateur
  { r: /comme un (lâche|idiot|con|nul|d[eé]bile|cr[eé]tin)/gi, label: "Jugement cru", qual: "high", expand: true },
  { r: /putain|merde|\bde merde\b/gi, label: "Registre non-filtré", qual: "high", expand: true },
  { r: /à cause de toi/gi, label: "Accusation directe", qual: "high", expand: true },
  // Preuves terrain
  { r: /la preuve en est\s*:/gi, label: "Preuve terrain", qual: "medium" },
  { r: /cf\.?\s*screen/gi, label: "Référence visuelle (screen)", qual: "medium" },
  { r: /j[''']ai (analys[eé]|compté|vériif[eé]|scruté|relu|testé) \d+/gi, label: "Analyse terrain citée", qual: "high" },
  { r: /\d+\s*(fois sur \d+|fois sur dix)/gi, label: "Ratio terrain précis", qual: "high" },
  // Ponctuation et rythme oral
  { r: /\.\.\.|…/g, label: "Silence écrit (rythme)", qual: "low" },
  { r: /\s—\s/g, label: "Rupture de ton (tiret)", qual: "low" },
  { r: /\bbon\.\s/gi, label: "Transition orale", qual: "medium" },
  { r: /\bbref[,.]/gi, label: "Raccourci oral", qual: "medium" },
  { r: /du coup[,\s]/gi, label: "Registre parlé", qual: "medium" },
  { r: /\ben fait[,\s]/gi, label: "Nuance conversationnelle", qual: "low" },
  { r: /\(ou presque\)/gi, label: "Parenthèse qualificative orale", qual: "medium" },
  { r: /\bpss?\s*:/gi, label: "Post-scriptum informel", qual: "medium" },
  // Élisions orales
  { r: /j[''']peux|t[''']as |j[''']suis pas|c[''']est pas vrai/gi, label: "Élision (registre oral)", qual: "medium" },
  // Outils spécifiques
  { r: /(notion|canva|slack|figma|loom|calendly|zapier|airtable|miro|typeform|linkub)/gi, label: "Outil précis nommé", qual: "medium" },
  // Durée personnelle
  { r: /j[''']ai mis \d+/gi, label: "Durée personnelle", qual: "high" },
  // Prise de risque / refus assumé
  { r: /j[''']ai refus[eé]/gi, label: "Prise de risque assumée", qual: "high", expand: true },
  { r: /j[''']ai dit non/gi, label: "Prise de risque assumée", qual: "high", expand: true },
  { r: /j[''']ai quitt[eé]/gi, label: "Rupture assumée", qual: "high", expand: true },
  { r: /j[''']ai arr[eê]t[eé] de/gi, label: "Rupture assumée", qual: "high", expand: true },
  // Révélation narrative (temps + résultat)
  { r: /(une?|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|\d+)\s+(semaines?|jours?|mois|ans?)\s+plus tard/gi, label: "Révélation narrative (temps + résultat)", qual: "high" },
  { r: /le lendemain[,\s]/gi, label: "Révélation narrative (temps + résultat)", qual: "high" },
  // Réflexion ouverte / doute assumé
  { r: /co[iï]ncidence\s*\?/gi, label: "Réflexion ouverte (doute assumé)", qual: "high", expand: true },
  { r: /peut-être\s*\./gi, label: "Incertitude assumée", qual: "medium", expand: true },
  { r: /je ne pense pas\./gi, label: "Opinion tranchée", qual: "high", expand: true },
  // Libération / espace mental (marqueur de vécu personnel)
  { r: /j[''']ai lib[eé]r[eé]/gi, label: "Vécu personnel (libération)", qual: "medium", expand: true },
]

const PEN = { high: 12, medium: 7, low: 4 }
const BON = { high: 10, medium: 6, low: 2 }

const REWRITES = {
  "Connecteur formel": "→ Remplace par : 'Et du coup', 'Bref.', 'Du coup', '—'",
  "Pivot formel": "→ Simplifie : 'mais', 'sauf que', 'pourtant'",
  "Conclusion explicite IA": "→ Supprime : finis directement sur ta dernière idée forte.",
  "Conclusion IA": "→ Supprime : finis directement sur ta dernière idée forte.",
  "Résumé formel IA": "→ Remplace par 'En clair :' + une phrase percutante.",
  "Résumé formel": "→ Remplace par 'Bref.' — plus humain.",
  "Invitation froide": "→ Direct : 'Tu veux en parler ? DM ouvert.'",
  "Formulation distante": "→ Tutoie : 'Je t'invite à' ou supprime.",
  "Impératif formel": "→ Dit-le : 'Tu dois' ou 'C'est non-négociable :'",
  "Précaution académique": "→ Supprime et dis-le franchement.",
  "Structure pédagogique IA": "→ Supprime — laisse le lecteur synthétiser.",
  "CTA générique": "→ Question précise : 'Tu t'es déjà retrouvé là ?'",
  "CTA de masse": "→ 'Balance ta réponse en dessous.'",
  "Titre listicle IA": "→ Reformule avec une tension réelle.",
  "Cliché ascendant": "→ Précise le résultat concret pour ta cible.",
  "Promesse générique": "→ Un résultat ultra-précis et chiffré.",
  "Verbe générique": "→ Précise ce que tu optimises/maximises réellement.",
  "Accroche IA courante": "→ Commence directement par l'info ou la tension.",
  "Partage générique": "→ Supprime ou donne une vraie raison de partager.",
  "Ouverture générique IA": "→ Commence in media res — dans le vif du sujet.",
  "Cliché d'époque": "→ Commence par le problème concret de ta cible.",
  "Structure très balisée": "→ Fusionne des bullets en paragraphes courts.",
  "Aucun chiffre précis": "→ Ajoute : une date, un montant, un nombre, une durée.",
  "Ton trop lisse — personnalité absente": "→ Ajoute un aveu, une opinion tranchée, ou une apostrophe directe.",
  "Aucun démarrage oral": "→ Commence une phrase par 'Mais', 'Et', 'Du coup', 'Bref.'",
  "Bullets répétitifs": "→ Varie les débuts : noms, verbes, chiffres, questions.",
  "Révélation en contraste IA": "→ Reformule en donnant directement le résultat concret.",
  "Framework 'exact' IA": "→ Remplace par ce que tu fais vraiment, avec les détails qui prouvent que c'est toi.",
  "Triple négation IA": "→ Fusionne en une phrase : 'Sans aucun outil payant'.",
  "Statistique d'erreur de masse": "→ Donne un exemple terrain précis à la place.",
  "Confession de durée IA": "→ Remplace par ce que tu as concrètement fait pendant ce temps.",
  "Conclusion pseudo-logique IA": "→ Supprime. Laisse les chiffres parler d'eux-mêmes.",
  "Impératif condescendant IA": "→ Supprime. Le lecteur sait calculer.",
  "Conclusion dramatique IA": "→ Supprime ou remplace par une dernière image forte.",
  "Révélation IA (vraie leçon)": "→ Donne directement la leçon sans l'annoncer.",
  "Anti-liste IA": "→ Dis ce qu'il faut faire, pas ce qu'il ne faut pas avoir.",
  "Statistique de masse": "→ Remplace par un cas concret que tu as observé.",
}

// ── Negated context ────────────────────────────────────────────
function isNegated(text, matchStart) {
  const lineStart = text.lastIndexOf('\n', matchStart - 1) + 1
  const lineEnd = text.indexOf('\n', matchStart)
  const line = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd).trim()
  return /^[×✗❌✖✕]/.test(line)
}

// ── Phrase expansion ───────────────────────────────────────────
function expandToSentence(text, start, end) {
  const SE = /[.!?\n]/
  let s = start
  let e = end
  while (s > 0 && !SE.test(text[s - 1])) s--
  while (s < start && /\s/.test(text[s])) s++
  while (e < text.length && !SE.test(text[e])) e++
  if (e < text.length) e++
  if (e - s > 130) return { s: start, e: end }
  return { s, e }
}

// ── Analysis engine ────────────────────────────────────────────
function findAllMatches(text, rules, type) {
  const results = []
  rules.forEach(rule => {
    const re = new RegExp(rule.r.source, rule.r.flags)
    let m
    while ((m = re.exec(text)) !== null) {
      if (isNegated(text, m.index)) continue
      let start = m.index
      let end = m.index + m[0].length
      if (rule.expand) {
        const ex = expandToSentence(text, start, end)
        start = ex.s; end = ex.e
      }
      results.push({ start, end, matched: text.slice(start, end), label: rule.label, type, sev: rule.sev, qual: rule.qual })
    }
  })
  return results
}

function buildSegments(text, all) {
  const sorted = [...all].sort((a, b) => a.start - b.start)
  const clean = []
  let last = 0
  for (const m of sorted) { if (m.start >= last) { clean.push(m); last = m.end } }
  const segs = []
  let pos = 0
  for (const m of clean) {
    if (m.start > pos) segs.push({ text: text.slice(pos, m.start), type: 'n' })
    segs.push({ text: text.slice(m.start, m.end), ...m })
    pos = m.end
  }
  if (pos < text.length) segs.push({ text: text.slice(pos), type: 'n' })
  return segs
}

function compareVoice(postText, refText) {
  if (!refText || refText.trim().length < 50) return null
  const refHu = new Set(), postHu = new Set()
  HUMAN_RULES.forEach(rule => {
    const re1 = new RegExp(rule.r.source, rule.r.flags)
    const re2 = new RegExp(rule.r.source, rule.r.flags)
    if (re1.test(refText)) refHu.add(rule.label)
    if (re2.test(postText)) postHu.add(rule.label)
  })
  const missing = [...refHu].filter(l => !postHu.has(l))
  const stop = new Set(['dans','avec','pour','mais','pas','tout','bien','plus','cette','votre','leurs','très','même','donc','dont','quand','comme','aussi','encore','toujours','jamais','souvent'])
  const refWords = refText.toLowerCase().match(/\b[a-zàâäéèêëîïôùûü]{5,}\b/g) || []
  const freq = {}
  refWords.forEach(w => { if (!stop.has(w)) freq[w] = (freq[w] || 0) + 1 })
  const top = Object.entries(freq).filter(([,c]) => c >= 2).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([w])=>w)
  const postSet = new Set(postText.toLowerCase().match(/\b\w+\b/g) || [])
  const gone = top.filter(w => !postSet.has(w))
  const insights = []
  if (missing.length > 0) insights.push(`Marqueurs présents dans tes autres posts, absents ici : ${missing.slice(0,3).join(' · ')}`)
  if (gone.length > 2) insights.push(`Mots caractéristiques de ta voix absents : "${gone.slice(0,4).join('", "')}"`)
  const rS = refText.split(/[.!?\n]+/).filter(s=>s.trim().length>5)
  const pS = postText.split(/[.!?\n]+/).filter(s=>s.trim().length>5)
  if (rS.length > 2 && pS.length > 2) {
    const rA = Math.round(rS.reduce((s,x)=>s+x.trim().split(/\s+/).length,0)/rS.length)
    const pA = Math.round(pS.reduce((s,x)=>s+x.trim().split(/\s+/).length,0)/pS.length)
    if (Math.abs(rA - pA) > 5) insights.push(`Tes phrases habituelles font ~${rA} mots. Ce post : ~${pA} mots — ${pA > rA ? "plus longues" : "plus courtes"} que d'habitude.`)
  }
  return insights.length > 0 ? insights : ["Bonne cohérence de ton avec tes autres posts."]
}

// ── Hook analysis — templates basés sur tes vrais posts ────────
function analyzeHook(postText) {
  const lines = postText.trim().split('\n').map(l => l.trim()).filter(Boolean)
  const hook = lines[0] || ''
  const hookClean = hook.replace(/[↓→↑↗]/g, '').trim()
  // Le hook = les 2 premières lignes non-vides (setup + révélation)
  const hookBlock = lines.slice(0, 2).join(' ')

  const hasNumber = /\d/.test(hookBlock)
  const hasQuestion = /\?/.test(hookClean)
  const hasTension = /\b(sauf que|pourtant|jamais|personne n|erreur|piège|mythe|faux|arrête|stop|à l'envers|pendant que|galèrent?)\b/i.test(hookClean)
  const hasNarrativeArrow = /→/.test(hook)
  const hasCaps = /[A-ZÀÉÈÊ]{3,}/.test(hookBlock)
  // Prise de risque : refus, quit, échec → toujours un signal fort
  const hasRiskAction = /^j[''']ai (refus[eé]|dit non|quitt[eé]|arr[eê]t[eé]|perdu|[eé]chou[eé]|l[aâ]ch[eé]|abandonn[eé]|rat[eé])/i.test(hookClean)
  // Révélation temporelle dans les 2 lignes (ex: "Deux semaines plus tard, j'en signais…")
  const hasTimeReveal = /(une?|deux|trois|quelques|\d+)\s+(semaines?|jours?|mois|ans?)\s+plus tard|le lendemain/i.test(hookBlock)
  // Chiffre financier dans le bloc hook = résultat révélé
  const hasMoneyResult = /\d[\d\s]*[€$k]/.test(hookBlock)

  const hookIsStrong = hasRiskAction || hasTimeReveal || hasMoneyResult || hasNarrativeArrow || hasCaps
  const isSelfStart = /^(j['''](?!assume|ai tort|ai chang|viens|me suis|refus|quitt|arr|lach|perdu|raté|écho)|je suis|nous (avons|sommes)|voici |aujourd)/i.test(hookClean)
  const hookWords = hookClean.split(/\s+/).filter(Boolean).length

  const issues = []
  if (isSelfStart && !hasNumber && !hasTension && !hookIsStrong) issues.push("Commence sur toi plutôt que sur le lecteur")
  if (!hasNumber && !hasQuestion && !hasTension && !hookIsStrong) issues.push("Pas de tension, question, chiffre ni accroche narrative")
  if (hookWords > 18 && !hookIsStrong) issues.push(`Trop long (${hookWords} mots) — vise < 15`)

  if (issues.length === 0) return null

  // Signals dans le post pour adapter les templates
  const hasDataCall = /\b(analys[eé]|compt[eé]|scrut[eé]|v[eé]rifi[eé])\b.{0,30}\b\d+\b/i.test(postText)
  const hasContraResult = /(\d+%?\s*(de |d'|en )\w+.{0,30}(moins|plus|baiss|augment))|(\d+x\s+(plus|moins))/i.test(postText)
  const hasMainstreamAdvice = /(on te dit|on vous dit|tout le monde|la plupart|poster plus|être r[eé]gulier)/i.test(postText)
  const hasFrustration = /(galère|frustrant|abandon|[eé]chec|pas de (client|r[eé]sultat)|300 impressions|0 eur|sans client)/i.test(postText)
  const hasParadox = /pendant que.{0,60}(moins bon|même profil|ca|chiffre d)/i.test(postText)

  const nums = postText.match(/\b\d+\b/g) || []
  const bigNum = nums.find(n => parseInt(n) > 10 && parseInt(n) < 10000) || ''

  const pool = []

  if (hasDataCall && bigNum) pool.push({
    type: "🔢 Donnée terrain + contre-intuitif",
    text: `"Je viens d'analyser ${bigNum} [X] et [Y] fois sur 10, le problème n'est pas [ce qu'on croit] ↓"`,
    why: "Un chiffre terrain issu de TON activité + un ratio crée une preuve immédiate. Le lecteur se dit : 'il a vraiment vérifié.'"
  })

  if (hasContraResult) pool.push({
    type: "⚡ Chiffre paradoxal",
    text: `"[Résultat A négatif] → [Résultat B positif inattendu]. En même temps. Voilà ce que j'ai découvert."`,
    why: "La contradiction chiffrée arrête le scroll. Ton post 'acheteurs silencieux' en est le parfait exemple."
  })

  if (hasMainstreamAdvice) pool.push({
    type: "🔄 Le conseil mainstream retourné",
    text: `"On te dit de [conseil commun]… Mais [X]% des freelances font ça à l'envers. Résultat : [frustration précise] ↓"`,
    why: "Valide la croyance du lecteur puis la retourne. Il se reconnaît dans le problème avant même d'avoir la solution."
  })

  if (hasFrustration) pool.push({
    type: "😤 Le scénario de frustration précis",
    text: `"Tu viens de passer [durée exacte] à [action concrète]…\nTu l'as relu [X] fois, il était parfait, pourtant : [résultat décevant chiffré]"`,
    why: "Le lecteur vit la scène. Si c'est exactement sa situation, il ne peut pas s'arrêter."
  })

  if (hasParadox) pool.push({
    type: "⚖️ L'inégalité paradoxale",
    text: `"Y'a des freelances qui galèrent à trouver 3 clients pendant que des mecs moins bons qu'eux font [Nx] leur CA — et la différence n'est pas l'expertise"`,
    why: "Crée une injustice qui cherche une explication. Le lecteur veut savoir quelle est la vraie différence."
  })

  // Fallbacks — toujours pertinents
  const fallbacks = [
    {
      type: "❓ La question-miroir",
      text: `"Combien de fois [situation précise que ta cible a vécue] ?"`,
      why: "La question-miroir projette le lecteur dans sa propre expérience avant qu'il ait le temps de scroller."
    },
    {
      type: "🎯 L'accusation directe (twist)",
      text: `"[Observation forte sur un comportement commun]. Et en grande partie à cause de toi."`,
      why: "Le twist final qui remet la responsabilité au lecteur. Légèrement provocateur — il veut se disculper."
    },
    {
      type: "📌 Chiffre + conséquence cachée",
      text: `"[X] choses sur [ton sujet] qui font (vraiment) fuir tes prospects sans que tu t'en rendes compte ↓"`,
      why: "Le '(vraiment)' et le 'sans que tu t'en rendes compte' créent ensemble un gap cognitif puissant."
    },
  ]

  let fi = 0
  while (pool.length < 3) pool.push(fallbacks[fi++ % fallbacks.length])

  return { hook: hookClean, issues, rewrites: pool.slice(0, 3) }
}

// ── Recommendations — cartes avec niveau de sévérité ──────────
// Chaque rec = { text, sev: 'critical'|'warning'|'tip' }
function getRecs(ai, hu, postText, hookAnalysis) {
  const wc = postText.trim().split(/\s+/).length
  const maxRecs = wc < 100 ? 3 : wc < 200 ? 4 : wc < 350 ? 5 : 6
  const recs = []
  const aiLabels = ai.map(a => a.label)
  const huLabels = hu.map(h => h.label)

  // ── HOOK (si faible) — intégré dans les recs ──────────────
  if (hookAnalysis && hookAnalysis.issues.length > 0) {
    recs.push({
      sev: 'warning',
      text: `Hook — «${hookAnalysis.hook.slice(0,85)}${hookAnalysis.hook.length>85?"…":""}» · ${hookAnalysis.issues.join(', ')}. Sans tension dès la 1ère ligne, le scroll continue sans s'arrêter.`
    })
  }

  // ── CRITICAL (🔴) ──────────────────────────────────────────
  if (aiLabels.includes("Ton trop lisse — personnalité absente")) {
    recs.push({ sev: 'critical', text: "Ce post est bien rédigé mais sans personnalité détectable. Un lecteur ne pourrait pas savoir qui l'a écrit. Il faut : une opinion tranchée, un adverbe oral ('franchement', 'bizarrement'), ou un aveu avec un détail précis et personnel. Sans ça, le post est oubliable." })
  }
  if (aiLabels.some(l => l.includes("Triple négation") || l.includes("Framework 'exact'") || l.includes("Révélation en contraste"))) {
    recs.push({ sev: 'critical', text: "Ce post suit un template IA identifiable. Ce qui trahit ça : une structure de 'révélation' générique. Pour y remédier : ajoute un détail ultra-spécifique qui prouve que c'est toi — un nom, un montant précis, une date, une réaction d'un vrai client." })
  }
  if (!huLabels.some(l => l.includes("Chiffre") || l.includes("terrain") || l.includes("Date") || l.includes("Repère") || l.includes("Pourcentage") || l.includes("Ratio") || l.includes("Prise de risque") || l.includes("narrative"))) {
    recs.push({ sev: 'critical', text: "Pas d'ancrage réel dans ce post. Aucun résultat chiffré, aucune date, aucune preuve terrain. '3 semaines d'essai' est 10× plus crédible que 'quelques semaines'. '47 DMs reçus' l'est 10× plus que 'beaucoup de messages'." })
  }
  if (!huLabels.some(l => ["Ton direct","Aveu","non-filtré","Prise de position","Revirement","Négation orale","informelle","Aveu personnel","Intensificateur","oral","Argot","Engagement direct","personnelle","Autocorrection","cru","Accusation","Réflexion","Incertitude","doute","Rupture"].some(x => l.toLowerCase().includes(x.toLowerCase())))) {
    recs.push({ sev: 'critical', text: "Aucune marque de personnalité détectée. Les posts qui ressemblent à leur auteur contiennent au minimum : un mot de registre oral, une prise de position, ou un moment de vulnérabilité. Sans ça, le post pourrait avoir été écrit par n'importe qui." })
  }

  // ── WARNING (🟡) ───────────────────────────────────────────
  if (aiLabels.some(l => l.includes("Connecteur") || l.includes("Pivot"))) {
    const ex = ai.find(a => a.label.includes("Connecteur") || a.label.includes("Pivot"))
    recs.push({ sev: 'warning', text: `"${ex?.found[0]?.slice(0,50) || "Ce connecteur"}" sonne formel. Remplace par une transition orale : 'Et du coup', 'Bref.', 'Sauf que'. Un seul connecteur formel peut suffire à faire douter le lecteur.` })
  }
  if (aiLabels.some(l => l.includes("Conclusion") || l.includes("Résumé"))) {
    const ex = ai.find(a => a.label.includes("Conclusion") || a.label.includes("Résumé"))
    recs.push({ sev: 'warning', text: `Supprime "${ex?.found[0]?.slice(0,50) || "la conclusion explicite"}". Tes lecteurs n'ont pas besoin qu'on leur signale la fin — termine directement sur l'idée la plus forte.` })
  }
  if (aiLabels.some(l => l.includes("CTA"))) {
    const ex = ai.find(a => a.label.includes("CTA"))
    recs.push({ sev: 'warning', text: `"${ex?.found[0]?.slice(0,50) || "Ce CTA"}" est générique. Une vraie question sur la douleur de ta cible est plus efficace : 'Tu t'es déjà retrouvé là ?' ou 'Ça t'arrive aussi ?'` })
  }
  if (aiLabels.includes("Structure très balisée")) {
    const bCount = ai.find(a => a.label === "Structure très balisée")?.found[0] || "Plusieurs lignes"
    recs.push({ sev: 'warning', text: `${bCount} à puce — c'est trop pour un post LinkedIn. Fusionne 2-3 lignes en un paragraphe court. L'algo favorise le texte fluide, et ça sonne plus naturel.` })
  }
  if (aiLabels.includes("Bullets répétitifs")) {
    recs.push({ sev: 'warning', text: "Tes bullets commencent tous de la même façon ('Des insights', 'Des cas'...). Varie les entrées : un chiffre, un verbe d'action, une question — la répétition structurelle est un signal IA fort." })
  }
  if (aiLabels.includes("Rythme haché")) {
    recs.push({ sev: 'warning', text: "Plusieurs phrases très courtes à la suite créent un rythme haché. Essaie de fusionner 2-3 idées courtes en une phrase plus dense : 'Quand tu acceptes une mission sous-évaluée tu as l'impression d'être productif.' au lieu de les couper en 2." })
  }
  if (aiLabels.some(l => l.includes("pseudo-logique") || l.includes("condescendant") || l.includes("dramatique IA"))) {
    recs.push({ sev: 'warning', text: "La conclusion sonne IA ('C'est mathématique', 'C'est tout', 'Fais le calcul'). Remplace par une dernière image forte ou une vraie question à ton lecteur." })
  }

  // ── TIP (💡) ───────────────────────────────────────────────
  if (aiLabels.includes("Aucun démarrage oral")) {
    recs.push({ sev: 'tip', text: "Aucune phrase ne commence par 'Mais', 'Et', 'Du coup', 'Bref.'... Ajoute-en une dans le corps du post — ça casse le rythme académique et rend le texte vivant." })
  }
  if (aiLabels.some(l => l.includes("Impératif") || l.includes("académique") || l.includes("distante"))) {
    const ex = ai.find(a => a.label.includes("Impératif") || a.label.includes("académique") || a.label.includes("distante"))
    recs.push({ sev: 'tip', text: `"${ex?.found[0]?.slice(0,50) || "Cette formulation"}" sonne protocolaire. Remplace par : 'Tu dois', 'C'est non-négociable :', ou dis-le directement.` })
  }
  if (aiLabels.some(l => l.includes("Promesse générique") || l.includes("Cliché ascendant"))) {
    recs.push({ sev: 'tip', text: "'Transformer', 'niveau supérieur' — ces mots ne veulent plus rien dire. Remplace par le résultat concret et mesurable que tu promets vraiment." })
  }

  // Pad to min
  const generics = [
    { sev: 'tip', text: "Relis à voix haute. Là où tu trébuches, le lecteur trébuche aussi — simplifie ces phrases." },
    { sev: 'tip', text: "Regarde ta phrase de fin. Est-ce l'idée la plus forte ? Si non, remonte-la — c'est ce que le lecteur gardera." },
  ]
  let gi = 0
  while (recs.length < 3) recs.push(generics[gi++ % generics.length])
  return recs.slice(0, maxRecs)
}

// ── Plaisir d'écriture ─────────────────────────────────────────
function detectPlaisir(huArr, aiArr) {
  const huLabels = huArr.map(h => h.label)
  const aiLabels = aiArr.map(a => a.label)
  const hasStory = huLabels.some(l => ['Chiffre terrain','Date précise','Repère temporel','Période personnelle','Durée personnelle','Prise de risque','Rupture assumée','narrative','Réflexion','Incertitude'].some(x => l.includes(x)))
  const hasVoice = huLabels.some(l => ['informelle','oral','non-filtré','Prise de position','Aveu','Autocorrection','cru','Accusation','Intensificateur','argot','doute','opinion','Engagement','personnelle'].some(x => l.toLowerCase().includes(x)))
  const hasCriticalAI = aiLabels.some(l => ['Triple négation','Framework','Révélation en contraste','pseudo-logique','Confession de durée'].some(x => l.includes(x)))
  const pts = (hasStory ? 2 : 0) + (hasVoice ? 2 : 0) - (hasCriticalAI ? 3 : 0) - (aiArr.length > 5 ? 1 : 0)
  if (pts >= 3) return { emoji:"✨", desc:"Plaisir d'écriture détecté", tc:"#15803d", bg:"#f0fdf4", border:"#86efac" }
  if (pts >= 0) return { emoji:"😐", desc:"Écriture neutre — peu de personnalité", tc:"#92400e", bg:"#fef9c3", border:"#fcd34d" }
  return { emoji:"🤖", desc:"Écriture mécanique — ressemble à de l'IA", tc:"#991b1b", bg:"#fee2e2", border:"#fca5a5" }
}

// ── Main analysis ──────────────────────────────────────────────
function analyze(text, refText) {
  if (!text || text.trim().split(/\s+/).length < 15) return null
  const wc = text.trim().split(/\s+/).length

  const aiRaw = findAllMatches(text, AI_RULES, 'ai')
  const huRaw = findAllMatches(text, HUMAN_RULES, 'hu')
  let score = 50
  const aiMap = {}, huMap = {}

  aiRaw.forEach(m => {
    score -= PEN[m.sev]
    if (!aiMap[m.label]) aiMap[m.label] = { label: m.label, found: [], sev: m.sev, fix: REWRITES[m.label] }
    const short = m.matched.trim().slice(0, 60)
    if (aiMap[m.label].found.length < 2 && !aiMap[m.label].found.includes(short))
      aiMap[m.label].found.push(short)
  })
  huRaw.forEach(m => {
    score += BON[m.qual]
    if (!huMap[m.label]) huMap[m.label] = { label: m.label, found: [], qual: m.qual }
    const short = m.matched.trim().slice(0, 60)
    if (huMap[m.label].found.length < 2 && !huMap[m.label].found.includes(short))
      huMap[m.label].found.push(short)
  })

  // Structural heuristics
  const bulletLines = (text.match(/^[\s]*(⦿|→|•|\+|-\s|✅|❌|🚀|💡|⚡|◆|●|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣)/gm) || [])
  if (bulletLines.length > 6) {
    aiMap['_lists'] = { label: "Structure très balisée", found: [`${bulletLines.length} lignes à puce`], sev: "medium", fix: REWRITES["Structure très balisée"] }
    score -= 8
  }
  // Emojis numérotés = signal IA fort
  if ((text.match(/[1-9]️⃣/g) || []).length >= 3) {
    aiMap['_numemoji'] = { label: "Listes emoji numérotées (1️⃣ 2️⃣ 3️⃣)", found: [], sev: "high", fix: "→ Remplace par du texte normal ou des bullets simples." }
    score -= 10
  }

  const desBullets = (text.match(/^[\s]*(⦿|→|•|\+|●|◆)\s*(Des?|Les?|Un[e]?) /gm) || [])
  if (desBullets.length >= 3 && bulletLines.length > 0 && desBullets.length / bulletLines.length > 0.5) {
    aiMap['_repbullets'] = { label: "Bullets répétitifs", found: [`${desBullets.length} bullets commencent de la même façon`], sev: "low", fix: REWRITES["Bullets répétitifs"] }
    score -= 4
  }

  const fp = (text.match(/\b(j[''']ai|je |j[''']|mon |ma |mes |moi[,\s])\b/gi) || []).length
  if (fp > 4) { huMap['_fp'] = { label: `1ère personne (${fp}×)`, found: [], qual: "medium" }; score += 8 }

  if (!/\d/.test(text)) {
    aiMap['_nochiffre'] = { label: "Aucun chiffre précis", found: [], sev: "low", fix: REWRITES["Aucun chiffre précis"] }
    score -= 6
  }

  if (wc > 80) {
    const oralStarters = (text.match(/\n(Et |Mais |Sauf que|Du coup|Bref[.,]|Alors[,.]|Donc[,.])/g) || []).length
    if (oralStarters === 0) {
      aiMap['_nooral'] = { label: "Aucun démarrage oral", found: [], sev: "low", fix: REWRITES["Aucun démarrage oral"] }
      score -= 4
    }
  }

  // Rythme haché : 4+ phrases consécutives très courtes (≤ 6 mots, hors bullets)
  const nonBulletLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3 && !/^(⦿|→|•|\+|●|◆|[0-9]|[1-9]️⃣)/.test(l))
  let maxRun = 0, curRun = 0
  for (const l of nonBulletLines) {
    if (l.split(/\s+/).length <= 6) { curRun++; maxRun = Math.max(maxRun, curRun) } else { curRun = 0 }
  }
  if (maxRun >= 4) {
    aiMap['_choppy'] = { label: "Rythme haché", found: [], sev: "low", fix: "→ Fusionne 2-3 phrases courtes en une phrase plus dense." }
    score -= 4
  }

  // Trop lisse
  const informalLabels = ['Adresse informelle','Négation orale','Registre oral','non-filtré','Prise de position','Revirement','Élision','Intensificateur','argot','Engagement direct','Formule personnelle','Aveu sincère','Ton direct','Observation personnelle','Autocorrection','Jugement cru','Accusation directe']
  const hasInformal = huRaw.some(m => informalLabels.some(x => m.label.toLowerCase().includes(x.toLowerCase())))
  const hasDirectAddress = /\btu\b|\bvous\b/i.test(text)
  const hasQuestion = /\?/.test(text)
  const hasVulnerability = huRaw.some(m => m.label.includes('Aveu') || m.label.includes('Revirement') || m.label.includes('Autocorrection'))

  if (wc > 60 && !hasInformal && !hasDirectAddress && !hasQuestion && !hasVulnerability) {
    aiMap['_lisse'] = { label: "Ton trop lisse — personnalité absente", found: [], sev: "high", fix: REWRITES["Ton trop lisse — personnalité absente"] }
    score -= 15
  }

  const aiArr = Object.values(aiMap)
  const huArr = Object.values(huMap)
  const hookAnalysis = analyzeHook(text)
  const recs = getRecs(aiArr, huArr, text, hookAnalysis)
  const segs = buildSegments(text, [...aiRaw, ...huRaw])
  const plaisir = detectPlaisir(huArr, aiArr)

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    ai: aiArr, hu: huArr, segs, recs, plaisir,
    voice: compareVoice(text, refText),
  }
}

// ── Verdict / colors ───────────────────────────────────────────
function verdict(s) {
  if (s >= 80) return { label: "Post authentique", dot: "#22c55e", bg: "#dcfce7", tc: "#16a34a" }
  if (s >= 65) return { label: "Bonne présence humaine", dot: "#018EBB", bg: "#e0f2fe", tc: "#0369a1" }
  if (s >= 45) return { label: "Ton mitigé", dot: "#f59e0b", bg: "#fef9c3", tc: "#b45309" }
  if (s >= 25) return { label: "Probablement IA", dot: "#ef4444", bg: "#fee2e2", tc: "#dc2626" }
  return { label: "Clairement généré par IA", dot: "#dc2626", bg: "#fecaca", tc: "#991b1b" }
}
function scoreColor(s) { return s>=75?"#22c55e":s>=55?"#018EBB":s>=35?"#f59e0b":"#ef4444" }
function segStyle(s) {
  if (s.type==='hu') return { bg:'#dcfce7', border:'#22c55e', tc:'#14532d' }
  if (s.sev==='high') return { bg:'#fecaca', border:'#dc2626', tc:'#7f1d1d' }
  return { bg:'#fed7aa', border:'#f97316', tc:'#7c2d12' }  // medium + low = "Sûrement IA"
}

// ── CSS ────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Parkinsans:wght@400;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Parkinsans',system-ui,sans-serif;background:#FAF9F2}
.wrap{min-height:100vh;background:#FAF9F2;position:relative;overflow:hidden;display:flex;align-items:flex-start;justify-content:center;padding:2.5rem 1rem 4rem}
.blob{position:fixed;background:#018EBB;border-radius:50%;filter:blur(100px);opacity:.22;pointer-events:none;z-index:0}
.b1{width:480px;height:480px;top:-140px;left:-150px}
.b2{width:350px;height:350px;top:35%;right:-100px}
.b3{width:300px;height:300px;bottom:-80px;left:25%}
.grain{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1}
.cw{position:relative;z-index:2;width:100%;max-width:660px}
.outer{border-radius:24px;border:10px solid rgba(18,28,40,.10);background:#FAF9F2}
.inner{background:#FAF9F2;border-radius:16px;padding:2.5rem 2rem}
.badge{background:#018EBB;color:#fff;border-radius:20px;padding:4px 14px;font-size:11px;text-transform:uppercase;font-weight:700;letter-spacing:.08em;display:inline-block}
.ta{width:100%;background:#fff;border:1.5px solid rgba(18,28,40,.15);border-radius:12px;padding:16px;font-family:'Parkinsans',system-ui,sans-serif;font-size:.88rem;color:#121C28;line-height:1.6;resize:vertical;outline:none;transition:border-color .2s}
.ta:focus{border-color:#018EBB}
.ta::placeholder{color:#a0aec0}
.btn{width:100%;background:#121C28;color:#fff;border:none;border-radius:12px;padding:14px;font-weight:700;font-size:1rem;font-family:'Parkinsans',system-ui,sans-serif;cursor:pointer;transition:opacity .2s}
.btn:hover:not(:disabled){opacity:.85}
.btn:disabled{opacity:.4;cursor:not-allowed}
.tog{background:none;border:1.5px solid rgba(18,28,40,.15);border-radius:10px;padding:8px 14px;font-size:.8rem;font-weight:600;color:#018EBB;cursor:pointer;font-family:'Parkinsans',system-ui,sans-serif;margin-top:.75rem;width:100%;text-align:left;display:flex;justify-content:space-between;align-items:center}
.anno{white-space:pre-wrap;font-family:'Parkinsans',system-ui,sans-serif;font-size:.875rem;color:#121C28;line-height:1.85;background:#fff;border-radius:12px;padding:1.25rem 1.5rem;border:1.5px solid rgba(18,28,40,.08)}
.mk{border-radius:4px;padding:0 2px;cursor:help}
.ai-card{background:#fff;border-radius:10px;border:1.5px solid #dc2626;padding:.85rem 1rem;margin-bottom:.55rem}
.ai-card.med{border-color:#f97316}
.ai-card.low{border-color:#eab308}
.ld{display:inline-flex;align-items:center;gap:5px;font-size:.72rem;color:#4a5568}
.ldot{display:inline-block;width:10px;height:10px;border-radius:3px}
.hu-chips{display:flex;flex-wrap:wrap;gap:.38rem;margin-top:.4rem}
.hu-chip{display:inline-flex;align-items:center;gap:.28rem;background:#f0fdf4;border:1px solid #86efac;border-radius:6px;padding:3px 9px;font-size:.72rem;font-weight:600;color:#14532d}
.hu-chip-q{color:#4ade80;font-style:italic;font-weight:400;font-size:.69rem}
.loading-wrap{display:flex;flex-direction:column;align-items:center;gap:1.25rem;padding:3rem 0}
.spin{width:38px;height:38px;border:3px solid rgba(1,142,187,.2);border-top-color:#018EBB;border-radius:50%;animation:spin .75s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.rec-card{border-radius:12px;padding:1rem 1.15rem;border:1.5px solid #e5e7eb;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.05)}
.rec-card.critical{border-color:#dc2626;background:#fff8f8}
.rec-card.warning{border-color:#f59e0b;background:#fffbeb}
.rec-card.tip{border-color:#018EBB;background:#f0f9ff}
.rec-sev{display:inline-flex;align-items:center;gap:.3rem;font-size:.68rem;font-weight:800;margin-bottom:.38rem;text-transform:uppercase;letter-spacing:.05em}
.plaisir-card{border-radius:12px;padding:.9rem 1.1rem;border:1.5px solid;display:flex;align-items:center;gap:.8rem;margin-bottom:1.5rem}
.inp{width:100%;background:#fff;border:1.5px solid rgba(18,28,40,.15);border-radius:12px;padding:12px 16px;font-family:'Parkinsans',system-ui,sans-serif;font-size:.9rem;color:#121C28;outline:none;transition:border-color .2s}
.inp:focus{border-color:#018EBB}
.inp::placeholder{color:#a0aec0}
`

// ── Component ──────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("gate")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [gateLoading, setGateLoading] = useState(false)
  const [gateError, setGateError] = useState("")
  const [post, setPost] = useState("")
  const [ref, setRef] = useState("")
  const [showRef, setShowRef] = useState(false)
  const [res, setRes] = useState(null)
  const [anim, setAnim] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingIdx, setLoadingIdx] = useState(0)

  async function submitGate() {
    const url = linkedinUrl.trim()
    if (!url) { setGateError("Entre ton URL LinkedIn ou ton @pseudo."); return }
    setGateLoading(true)
    setGateError("")
    try {
      await fetch('/api/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl: url }),
      })
    } catch (_) {
      // Fail silently — l'utilisateur accède à l'outil dans tous les cas
    }
    setGateLoading(false)
    setScreen("in")
  }

  const wc = post.trim() ? post.trim().split(/\s+/).length : 0

  function go() {
    if (wc < 15) return
    setLoading(true)
    setLoadingIdx(0)
    let idx = 0
    const interval = setInterval(() => {
      idx++
      if (idx < LOADING_MSGS.length) setLoadingIdx(idx)
    }, 300)
    setTimeout(() => {
      clearInterval(interval)
      const r = analyze(post, ref)
      if (r) {
        setRes(r); setScreen("out"); setAnim(0)
        let cur = 0
        const step = r.score / 40
        const t = setInterval(() => {
          cur += step
          if (cur >= r.score) { cur = r.score; clearInterval(t) }
          setAnim(Math.round(cur))
        }, 25)
      }
      setLoading(false)
    }, LOADING_MSGS.length * 300 + 200)
  }

  const v = res ? verdict(res.score) : null
  const C = 2 * Math.PI * 60
  const dash = res ? C * (1 - anim / 100) : C

  return (
    <>
      <style>{CSS}</style>
      <div className="wrap">
        <div className="blob b1"/><div className="blob b2"/><div className="blob b3"/>
        <svg className="grain" xmlns="http://www.w3.org/2000/svg">
          <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
          <rect width="100%" height="100%" filter="url(#g)" opacity="0.15"/>
        </svg>
        <div className="cw"><div className="outer"><div className="inner">

          {screen === "gate" && (
            <div>
              <div style={{textAlign:"center",marginBottom:"2rem"}}>
                <span className="badge">Kalanis — Outil gratuit</span>
                <h1 style={{fontFamily:"'Parkinsans',sans-serif",fontSize:"clamp(1.5rem,4vw,2.1rem)",fontWeight:800,color:"#121C28",marginTop:"1rem",lineHeight:1.2}}>
                  Ton post LinkedIn est-il<br/>vraiment <span style={{color:"#018EBB"}}>toi</span> ?
                </h1>
                <p style={{color:"#4a5568",marginTop:".75rem",fontSize:".9rem",lineHeight:1.65}}>
                  Détecte en 10 secondes chaque signal IA<br/>et chaque marqueur humain dans ton texte.
                </p>
              </div>

              <div style={{background:"#fff",borderRadius:14,padding:"1.5rem",border:"1.5px solid rgba(18,28,40,.10)",marginBottom:"1.25rem"}}>
                <p style={{fontSize:".82rem",color:"#4a5568",lineHeight:1.6,marginBottom:"1.1rem"}}>
                  Entre ton profil LinkedIn pour accéder à l'outil. Thomas pourra te faire un retour personnalisé sur ta voix de contenu.
                </p>
                <label style={{fontSize:".8rem",fontWeight:700,color:"#121C28",display:"block",marginBottom:".4rem"}}>
                  Ton profil LinkedIn
                </label>
                <input
                  type="text"
                  className="inp"
                  value={linkedinUrl}
                  onChange={e=>{setLinkedinUrl(e.target.value);setGateError("")}}
                  onKeyDown={e=>e.key==='Enter'&&submitGate()}
                  placeholder="https://linkedin.com/in/ton-profil ou @pseudo"
                  autoFocus
                />
                {gateError && <p style={{color:"#dc2626",fontSize:".78rem",marginTop:".38rem"}}>{gateError}</p>}
              </div>

              {gateLoading ? (
                <div className="loading-wrap">
                  <div className="spin"/>
                  <p style={{color:"#018EBB",fontWeight:700,fontSize:".9rem"}}>Accès en cours…</p>
                </div>
              ) : (
                <button className="btn" onClick={submitGate} disabled={!linkedinUrl.trim()}>
                  Accéder à l'analyse →
                </button>
              )}

              <p style={{textAlign:"center",fontSize:".73rem",color:"#9ca3af",marginTop:".85rem"}}>
                Outil créé par <strong style={{color:"#121C28"}}>Thomas Fournier / Kalanis</strong> — accompagnement LinkedIn pour freelances B2B
              </p>
            </div>
          )}

          {screen === "in" && (
            <div>
              <div style={{textAlign:"center",marginBottom:"2rem"}}>
                <span className="badge">Kalanis — Outil gratuit</span>
                <h1 style={{fontFamily:"'Parkinsans',sans-serif",fontSize:"clamp(1.5rem,4vw,2.1rem)",fontWeight:800,color:"#121C28",marginTop:"1rem",lineHeight:1.2}}>
                  Ton post LinkedIn est-il<br/>vraiment <span style={{color:"#018EBB"}}>toi</span> ?
                </h1>
                <p style={{color:"#4a5568",marginTop:".75rem",fontSize:".9rem",lineHeight:1.65}}>
                  Colle ton post. Chaque signal IA et chaque marqueur humain<br/>sont surlignés directement dans le texte.
                </p>
              </div>
              <label style={{fontSize:".8rem",fontWeight:700,color:"#121C28",display:"block",marginBottom:".4rem"}}>Ton post LinkedIn</label>
              <textarea className="ta" value={post} onChange={e=>setPost(e.target.value)}
                placeholder="Colle ton post complet ici — avec les sauts de ligne..." rows={12}/>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:".4rem",marginBottom:".75rem"}}>
                <span style={{fontSize:".73rem",color:"#718096"}}>{wc>0?`${wc} mots${wc<20?" (min. 20)":""}`:""}</span>
                <span style={{fontSize:".73rem",color:"#718096"}}>🔒 Analyse locale</span>
              </div>
              <button className="tog" onClick={()=>setShowRef(!showRef)}>
                <span>+ Optionnel : colle 2-3 de tes meilleurs posts pour une analyse de voix personnalisée</span>
                <span style={{marginLeft:".5rem"}}>{showRef?"▲":"▼"}</span>
              </button>
              {showRef && (
                <div style={{marginTop:".6rem"}}>
                  <p style={{fontSize:".75rem",color:"#718096",marginBottom:".35rem"}}>L'outil détectera ce qui est habituel dans ta voix mais absent de ce post.</p>
                  <textarea className="ta" value={ref} onChange={e=>setRef(e.target.value)}
                    placeholder="Colle 2-3 de tes posts de référence ici..." rows={6}/>
                </div>
              )}
              {loading ? (
                <div className="loading-wrap">
                  <div className="spin"/>
                  <p style={{color:"#018EBB",fontWeight:700,fontSize:".9rem",textAlign:"center"}}>{LOADING_MSGS[loadingIdx]}</p>
                  <p style={{color:"#9ca3af",fontSize:".75rem"}}>{loadingIdx + 1} / {LOADING_MSGS.length}</p>
                </div>
              ) : (
                <button className="btn" style={{marginTop:"1.25rem"}} onClick={go} disabled={wc<15}>
                  Analyser mon post →
                </button>
              )}
              <p style={{textAlign:"center",fontSize:".73rem",color:"#9ca3af",marginTop:".85rem"}}>
                Outil créé par <strong style={{color:"#121C28"}}>Thomas Fournier / Kalanis</strong> — accompagnement LinkedIn pour freelances B2B
              </p>
            </div>
          )}

          {screen === "out" && res && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
                <button onClick={()=>{setScreen("in");setRes(null);setLoading(false)}} style={{background:"none",border:"none",color:"#018EBB",cursor:"pointer",fontSize:".88rem",fontWeight:700,fontFamily:"'Parkinsans',sans-serif",padding:0}}>← Refaire</button>
                <span className="badge">Analyse complète</span>
              </div>

              <div style={{textAlign:"center",marginBottom:"1.75rem"}}>
                <svg width="150" height="150" viewBox="0 0 150 150" style={{display:"block",margin:"0 auto"}}>
                  <circle cx="75" cy="75" r="60" fill="none" stroke="rgba(18,28,40,.08)" strokeWidth="11"/>
                  <circle cx="75" cy="75" r="60" fill="none" stroke={scoreColor(res.score)} strokeWidth="11"
                    strokeLinecap="round" strokeDasharray={C} strokeDashoffset={dash}
                    transform="rotate(-90 75 75)" style={{transition:"stroke-dashoffset .04s linear"}}/>
                  <text x="75" y="71" textAnchor="middle" fill="#121C28" fontSize="32" fontWeight="800" fontFamily="'Parkinsans',sans-serif">{anim}</text>
                  <text x="75" y="94" textAnchor="middle" fill="#718096" fontSize="11" fontFamily="'Parkinsans',sans-serif">Score Humanité</text>
                </svg>
                <div style={{display:"inline-flex",alignItems:"center",gap:".4rem",background:v.bg,border:`1.5px solid ${v.dot}`,borderRadius:"20px",padding:"6px 16px",marginTop:".6rem"}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:v.dot,flexShrink:0,display:"inline-block"}}/>
                  <span style={{color:v.tc,fontWeight:700,fontSize:".9rem"}}>{v.label}</span>
                </div>
              </div>

              {res.plaisir && (
                <div className="plaisir-card" style={{background:res.plaisir.bg,borderColor:res.plaisir.border}}>
                  <span style={{fontSize:"1.9rem",lineHeight:1,flexShrink:0}}>{res.plaisir.emoji}</span>
                  <div>
                    <div style={{fontSize:".65rem",fontWeight:800,color:res.plaisir.tc,textTransform:"uppercase",letterSpacing:".07em",marginBottom:".18rem"}}>Ressenti d'écriture</div>
                    <div style={{fontWeight:700,color:res.plaisir.tc,fontSize:".9rem"}}>{res.plaisir.desc}</div>
                  </div>
                </div>
              )}

              <div style={{marginBottom:"1.5rem"}}>
                <div style={{fontWeight:700,color:"#121C28",fontSize:".92rem",marginBottom:".5rem"}}>Ton post annoté</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:".55rem",marginBottom:".6rem"}}>
                  {[{bg:"#fecaca",b:"#dc2626",l:"100% IA"},{bg:"#fed7aa",b:"#f97316",l:"Sûrement IA"},{bg:"#dcfce7",b:"#22c55e",l:"Marqueur humain"}].map((x,i)=>(
                    <span key={i} className="ld"><span className="ldot" style={{background:x.bg,border:`1.5px solid ${x.b}`}}/>{x.l}</span>
                  ))}
                </div>
                <div className="anno">
                  {res.segs.map((s,i)=>{
                    if (s.type==='n') return <span key={i}>{s.text}</span>
                    const c = segStyle(s)
                    return <span key={i} className="mk" title={s.label} style={{background:c.bg,color:c.tc,borderBottom:`2px solid ${c.border}`}}>{s.text}</span>
                  })}
                </div>
                {res.segs.every(s=>s.type==='n') && (
                  <p style={{fontSize:".78rem",color:"#718096",marginTop:".5rem",fontStyle:"italic"}}>Aucun pattern détecté — score basé sur l'analyse structurelle.</p>
                )}
              </div>

              {res.ai.length > 0 && (
                <div style={{marginBottom:"1.5rem"}}>
                  <div style={{fontWeight:700,color:"#dc2626",fontSize:".9rem",marginBottom:".6rem"}}>Ce qui pèche — et comment corriger</div>
                  {res.ai.map((a,i)=>(
                    <div key={i} className={`ai-card ${a.sev==="medium"?"med":a.sev==="low"?"low":""}`}>
                      <div style={{fontWeight:700,fontSize:".83rem",color:"#121C28",marginBottom:a.found.length>0||a.fix?".3rem":"0"}}>{a.label}</div>
                      {a.found.length>0 && (
                        <div style={{fontSize:".74rem",color:"#6b7280",marginBottom:a.fix?".3rem":"0"}}>
                          Trouvé : {a.found.map((f,j)=><span key={j} style={{fontStyle:"italic"}}>«{f}»{j<a.found.length-1?", ":""}</span>)}
                        </div>
                      )}
                      {a.fix && <div style={{fontSize:".79rem",color:"#018EBB",fontWeight:600}}>{a.fix}</div>}
                    </div>
                  ))}
                </div>
              )}

              {res.hu.length > 0 && (
                <div style={{marginBottom:"1.5rem"}}>
                  <div style={{fontWeight:700,color:"#16a34a",fontSize:".9rem",marginBottom:".35rem"}}>Ce qui fonctionne — garde ça</div>
                  <div className="hu-chips">
                    {res.hu.map((h,i)=>(
                      <span key={i} className="hu-chip">
                        <span style={{color:"#16a34a",fontWeight:800,fontSize:".75rem"}}>✓</span>
                        {h.label}
                        {h.found[0] && <span className="hu-chip-q">«{h.found[0].slice(0,40)}{h.found[0].length>40?"…":""}»</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {res.voice && (
                <div style={{background:"rgba(1,142,187,.07)",border:"1.5px solid #018EBB",borderRadius:12,padding:"1rem 1.25rem",marginBottom:"1.5rem"}}>
                  <div style={{fontWeight:700,color:"#018EBB",fontSize:".88rem",marginBottom:".5rem"}}>Comparaison de voix</div>
                  {res.voice.map((vv,i)=>(
                    <p key={i} style={{color:"#374151",fontSize:".84rem",lineHeight:1.65,marginBottom:i<res.voice.length-1?".35rem":0}}>{vv}</p>
                  ))}
                </div>
              )}

              <div style={{marginBottom:"1.75rem"}}>
                <div style={{fontWeight:700,color:"#121C28",fontSize:".92rem",marginBottom:".75rem"}}>Ce qu'il faut corriger</div>
                <div style={{display:"flex",flexDirection:"column",gap:".65rem"}}>
                  {res.recs.map((r,i)=>{
                    const sevConf = {
                      critical: { icon:"🔴", label:"Erreur critique", color:"#dc2626" },
                      warning:  { icon:"🟡", label:"À corriger",      color:"#b45309" },
                      tip:      { icon:"💡", label:"À peaufiner",     color:"#0369a1" },
                    }
                    const s = sevConf[r.sev] || sevConf.tip
                    return (
                      <div key={i} className={`rec-card ${r.sev}`}>
                        <div className="rec-sev" style={{color:s.color}}>{s.icon} {s.label}</div>
                        <p style={{color:"#374151",fontSize:".86rem",lineHeight:1.65,margin:0}}>{r.text}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{background:"#121C28",borderRadius:14,padding:"1.5rem",textAlign:"center"}}>
                <p style={{color:"#fff",fontWeight:700,fontSize:"1rem",marginBottom:".35rem",lineHeight:1.35}}>
                  Tu veux un profil LinkedIn qui sonne vraiment comme toi ?
                </p>
                <p style={{color:"#94a3b8",fontSize:".82rem",marginBottom:"1.1rem",lineHeight:1.5}}>
                  30 min de call gratuit. Diagnostic profil + stratégie de contenu. Sans engagement.
                </p>
                <a href="https://calendly.com/thomas-frn/audit-gratuit" target="_blank" rel="noopener noreferrer"
                  style={{display:"inline-block",background:"#018EBB",color:"#fff",borderRadius:12,padding:"12px 28px",fontWeight:700,textDecoration:"none",fontSize:".95rem",fontFamily:"'Parkinsans',sans-serif"}}>
                  Réserver mon appel gratuit →
                </a>
              </div>
            </div>
          )}

        </div></div></div>
      </div>
    </>
  )
}
