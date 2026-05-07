import { useState } from "react"

const AI_RULES = [
  { r: /dans un monde o[uù]/gi, label: "Ouverture générique IA", sev: "high" },
  { r: /[àa] l[''']ère (du|de la|des)/gi, label: "Cliché d'époque", sev: "high" },
  { r: /il est (essentiel|crucial|fondamental|primordial) de/gi, label: "Impératif formel", sev: "high" },
  { r: /n[''']h[eé]sitez pas [àa]/gi, label: "Invitation froide", sev: "medium" },
  { r: /je vous invite [àa]/gi, label: "Formulation distante", sev: "medium" },
  { r: /par ailleurs/gi, label: "Connecteur formel", sev: "medium" },
  { r: /en outre/gi, label: "Connecteur formel", sev: "medium" },
  { r: /n[eé]anmoins/gi, label: "Connecteur formel", sev: "medium" },
  { r: /toutefois/gi, label: "Pivot formel", sev: "low" },
  { r: /en revanche/gi, label: "Pivot formel", sev: "low" },
  { r: /cependant/gi, label: "Pivot formel", sev: "low" },
  { r: /en conclusion/gi, label: "Conclusion explicite IA", sev: "high" },
  { r: /pour conclure/gi, label: "Conclusion explicite IA", sev: "high" },
  { r: /en r[eé]sum[eé]/gi, label: "Résumé formel IA", sev: "high" },
  { r: /en somme/gi, label: "Résumé formel", sev: "medium" },
  { r: /il convient de (noter|mentionner|souligner)/gi, label: "Précaution académique", sev: "high" },
  { r: /qu[''']en pensez-vous\s*\?/gi, label: "CTA générique", sev: "medium" },
  { r: /dites-moi en commentaires/gi, label: "CTA de masse", sev: "medium" },
  { r: /les \d+ (raisons|erreurs|cl[eé]s|conseils|[eé]tapes) (pour|de|que)/gi, label: "Titre listicle IA", sev: "high" },
  { r: /ce qu[''']il faut retenir/gi, label: "Structure IA", sev: "high" },
  { r: /passer au niveau sup[eé]rieur/gi, label: "Cliché ascendant", sev: "medium" },
  { r: /transformer (votre|ton|sa) (vie|carri[eè]re|business)/gi, label: "Promesse générique", sev: "medium" },
  { r: /optimiser (votre|ton)/gi, label: "Verbe générique", sev: "low" },
  { r: /maximiser (votre|ton|le)/gi, label: "Verbe générique", sev: "low" },
  { r: /voici (comment|pourquoi|les \d+|ce que)/gi, label: "Accroche IA courante", sev: "low" },
  { r: /partagez (cet article|cette publication|ce post)/gi, label: "Partage générique", sev: "medium" },
]

const HUMAN_RULES = [
  { r: /\b\d+\s?[€$]|\b\d+\s?k[€$]|\b\d+\s?000\s?[€$]/gi, label: "Chiffre financier précis", qual: "high" },
  { r: /\b\d{2,}\s?(clients?|prospects?|personnes?|abonn[eé]s?|impressions?|vues?|leads?)/gi, label: "Chiffre terrain précis", qual: "high" },
  { r: /l[''']autre jour/gi, label: "Anecdote récente", qual: "medium" },
  { r: /ce matin/gi, label: "Ancrage temporel", qual: "medium" },
  { r: /\bhier\b/gi, label: "Ancrage temporel", qual: "medium" },
  { r: /la semaine derni[eè]re/gi, label: "Ancrage temporel", qual: "medium" },
  { r: /franchement/gi, label: "Ton direct assumé", qual: "high" },
  { r: /honn[eê]tement/gi, label: "Aveu sincère", qual: "high" },
  { r: /bizarrement/gi, label: "Observation personnelle", qual: "high" },
  { r: /j[''']assume/gi, label: "Prise de position", qual: "high" },
  { r: /j[''']avais tort/gi, label: "Revirement sincère", qual: "high" },
  { r: /j[''']ai chang[eé] d[''']avis/gi, label: "Évolution d'opinion", qual: "high" },
  { r: /\.\.\./g, label: "Silence écrit (rythme)", qual: "low" },
  { r: /\s—\s/g, label: "Rupture de ton (tiret)", qual: "low" },
  { r: /putain|merde|\bde merde\b/gi, label: "Registre non-filtré", qual: "high" },
  { r: /\bbon\./gi, label: "Transition orale", qual: "medium" },
  { r: /\bbref[,.]/gi, label: "Raccourci oral", qual: "medium" },
  { r: /du coup[,\s]/gi, label: "Registre parlé", qual: "medium" },
  { r: /(notion|canva|slack|figma|loom|calendly|zapier|airtable|miro|typeform)/gi, label: "Outil précis nommé", qual: "medium" },
  { r: /en (janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre) \d{4}/gi, label: "Date précise", qual: "high" },
  { r: /il y a \d+ (jours?|semaines?|mois|ans?)/gi, label: "Repère temporel précis", qual: "high" },
  { r: /j[''']ai (commis|fait) (une? )?(erreur|faute|connerie)/gi, label: "Aveu d'erreur", qual: "high" },
  { r: /clairement[,\s!]/gi, label: "Affirmation tranchée", qual: "low" },
  { r: /\ben fait[,\s]/gi, label: "Nuance conversationnelle", qual: "low" },
  { r: /j[''']ai (mis|pass[eé]|pris) \d+/gi, label: "Durée personnelle", qual: "high" },
]

const PEN = { high: 13, medium: 7, low: 4 }
const BON = { high: 13, medium: 8, low: 3 }

const REWRITES = {
  "Connecteur formel": "→ Remplace par : 'Et du coup', 'Bref.', 'Du coup', '—'",
  "Pivot formel": "→ Simplifie : 'mais', 'sauf que', 'pourtant', 'à l'inverse'",
  "Conclusion explicite IA": "→ Supprime : finis directement sur ta dernière idée forte.",
  "Résumé formel IA": "→ Remplace par 'En clair :' + une seule phrase percutante.",
  "Résumé formel": "→ Remplace par 'Bref.' — c'est plus humain.",
  "Invitation froide": "→ Rends-le direct : 'Tu veux en parler ? DM ouvert.'",
  "Formulation distante": "→ Tutoie : 'Je t'invite à' ou supprime.",
  "Impératif formel": "→ Dit-le : 'Tu dois' ou 'C'est non-négociable :'",
  "Précaution académique": "→ Supprime et dis-le franchement.",
  "CTA générique": "→ Question précise sur la douleur : 'Tu t'es déjà retrouvé là ?'",
  "CTA de masse": "→ 'Balance ta réponse en dessous.'",
  "Titre listicle IA": "→ Reformule avec une tension réelle, pas un titre de blog.",
  "Structure IA": "→ Supprime — laisse le lecteur synthétiser.",
  "Cliché ascendant": "→ Précise ce que ça signifie concrètement pour ta cible.",
  "Promesse générique": "→ Une promesse ultra-précise, pas 'transformer' — un vrai résultat.",
  "Verbe générique": "→ Précise ce que tu optimises/maximises réellement.",
  "Accroche IA courante": "→ Commence directement par l'info ou la tension.",
  "Partage générique": "→ Supprime ou donne une vraie raison de partager.",
  "Ouverture générique IA": "→ Commence in media res — dans le vif du sujet.",
  "Cliché d'époque": "→ Commence par le problème concret de ta cible.",
  "Structure très balisée (listes)": "→ Fusionne des bullets en paragraphes courts — plus de flow.",
  "Aucun chiffre précis": "→ Ajoute : une date, un montant, un nombre de clients, une durée.",
}

function findAllMatches(text, rules, type) {
  const results = []
  rules.forEach(rule => {
    const re = new RegExp(rule.r.source, rule.r.flags)
    let m
    while ((m = re.exec(text)) !== null) {
      results.push({ start: m.index, end: m.index + m[0].length, matched: m[0], label: rule.label, type, sev: rule.sev, qual: rule.qual })
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
  HUMAN_RULES.forEach(r => {
    if (refText.match(r.r)) refHu.add(r.label)
    if (postText.match(r.r)) postHu.add(r.label)
  })
  const missing = [...refHu].filter(l => !postHu.has(l))
  const stop = new Set(['dans','avec','pour','mais','pas','tout','bien','plus','cette','votre','leurs','très','même','donc','dont','quand','comme','aussi','encore','toujours','jamais','souvent','avoir','être','faire','aller'])
  const refWords = refText.toLowerCase().match(/\b[a-zàâäéèêëîïôùûü]{5,}\b/g) || []
  const freq = {}
  refWords.forEach(w => { if (!stop.has(w)) freq[w] = (freq[w] || 0) + 1 })
  const top = Object.entries(freq).filter(([,c]) => c >= 2).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([w])=>w)
  const postSet = new Set(postText.toLowerCase().match(/\b\w+\b/g) || [])
  const gone = top.filter(w => !postSet.has(w))
  const insights = []
  if (missing.length > 0) insights.push(`Marqueurs présents dans tes autres posts, absents ici : ${missing.slice(0,3).join(' · ')}`)
  if (gone.length > 2) insights.push(`Mots caractéristiques de ta voix introuvables dans ce post : "${gone.slice(0,4).join('", "')}"`)
  const refSents = refText.split(/[.!?]+/).filter(s=>s.trim().length>5)
  const postSents = postText.split(/[.!?]+/).filter(s=>s.trim().length>5)
  if (refSents.length > 2 && postSents.length > 2) {
    const refAvg = Math.round(refSents.reduce((s,x)=>s+x.trim().split(/\s+/).length,0)/refSents.length)
    const postAvg = Math.round(postSents.reduce((s,x)=>s+x.trim().split(/\s+/).length,0)/postSents.length)
    if (Math.abs(refAvg - postAvg) > 5) {
      insights.push(`Tes phrases habituelles font ~${refAvg} mots. Ici : ~${postAvg} mots — ${postAvg > refAvg ? "phrases plus longues" : "phrases plus courtes"} que d'habitude.`)
    }
  }
  return insights.length > 0 ? insights : ["Bonne cohérence de ton avec tes autres posts."]
}

function analyze(text, refText) {
  if (!text || text.trim().split(/\s+/).length < 15) return null
  const aiRaw = findAllMatches(text, AI_RULES, 'ai')
  const huRaw = findAllMatches(text, HUMAN_RULES, 'hu')
  let score = 50
  const aiMap = {}, huMap = {}
  aiRaw.forEach(m => {
    score -= PEN[m.sev]
    if (!aiMap[m.label]) aiMap[m.label] = { label: m.label, found: [], sev: m.sev, fix: REWRITES[m.label] }
    if (!aiMap[m.label].found.includes(m.matched.trim())) aiMap[m.label].found.push(m.matched.trim())
  })
  huRaw.forEach(m => {
    score += BON[m.qual]
    if (!huMap[m.label]) huMap[m.label] = { label: m.label, found: [], qual: m.qual }
    if (!huMap[m.label].found.includes(m.matched.trim())) huMap[m.label].found.push(m.matched.trim())
  })
  const bullets = (text.match(/^[\s]*(→|•|-\s|✅|❌|🚀|💡)/gm)||[]).length
  if (bullets > 5) { aiMap['_lists'] = { label: "Structure très balisée (listes)", found: [`${bullets} lignes à puce`], sev: "medium", fix: REWRITES["Structure très balisée (listes)"] }; score -= 8 }
  const fp = (text.match(/\b(j[''']ai|je |j[''']|mon |ma |mes )\b/gi)||[]).length
  if (fp > 5) { huMap['_fp'] = { label: `1ère personne (${fp}×)`, found: [], qual: "medium" }; score += 8 }
  if (!/\d/.test(text)) { aiMap['_nochiffre'] = { label: "Aucun chiffre précis", found: [], sev: "low", fix: REWRITES["Aucun chiffre précis"] }; score -= 6 }
  const segs = buildSegments(text, [...aiRaw, ...huRaw])
  const voice = compareVoice(text, refText)
  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    ai: Object.values(aiMap),
    hu: Object.values(huMap),
    segs, voice,
  }
}

function verdict(s) {
  if (s >= 80) return { label: "Post authentique", dot: "#22c55e", bg: "#dcfce7", tc: "#16a34a" }
  if (s >= 65) return { label: "Bonne présence humaine", dot: "#018EBB", bg: "#e0f2fe", tc: "#0369a1" }
  if (s >= 45) return { label: "Ton mitigé", dot: "#f59e0b", bg: "#fef9c3", tc: "#b45309" }
  if (s >= 25) return { label: "Probablement IA", dot: "#ef4444", bg: "#fee2e2", tc: "#dc2626" }
  return { label: "Clairement généré par IA", dot: "#dc2626", bg: "#fecaca", tc: "#991b1b" }
}
function sc(s) { return s>=75?"#22c55e":s>=55?"#018EBB":s>=35?"#f59e0b":"#ef4444" }

function getRecs(score, ai, hu) {
  const recs = []
  const aiLabels = ai.map(a=>a.label)
  const huLabels = hu.map(h=>h.label)
  const get = (l) => ai.find(a=>a.label===l)
  if (aiLabels.some(l=>l.includes("Connecteur")||l.includes("Pivot"))) {
    const ex = ai.find(a=>a.label.includes("Connecteur")||a.label.includes("Pivot"))
    recs.push(`Remplace "${ex?.found[0]||"ce connecteur"}" par une transition orale : 'Et du coup', 'Bref.', 'Sauf que'. Ça brise le ton scolaire.`)
  }
  if (!huLabels.some(l=>l.includes("Chiffre")||l.includes("Repère")||l.includes("Date")||l.includes("Ancrage"))) {
    recs.push("Ajoute un chiffre précis : une date, un montant, un nombre de clients, une durée. '3 semaines' est 10× plus fort que 'quelques semaines'.")
  }
  if (aiLabels.some(l=>l.includes("listicle")||l.includes("balisée"))) {
    recs.push("Trop de bullets. Fusionne 2-3 lignes à puce en un paragraphe court — plus de flow, plus humain, algo plus favorable.")
  }
  if (aiLabels.some(l=>l.includes("CTA"))) {
    const ex = ai.find(a=>a.label.includes("CTA"))
    recs.push(`Remplace "${ex?.found[0]||"le CTA générique"}" par une question précise sur la douleur : 'Tu t'es déjà retrouvé là ?' est 5× plus engageant.`)
  }
  if (!huLabels.some(l=>["Ton direct","Aveu","Registre","Prise de position","Revirement"].some(x=>l.includes(x)))) {
    recs.push("Intègre une prise de position tranchée : 'Franchement', 'J'assume', 'Honnêtement'. Une opinion assumée est mémorable. Un constat neutre, non.")
  }
  if (aiLabels.some(l=>l.includes("Conclusion"))) {
    const ex = get("Conclusion explicite IA")
    recs.push(`Supprime "${ex?.found[0]||"la conclusion"}". Tes lecteurs n'ont pas besoin qu'on leur signale la fin. Termine directement sur l'idée forte.`)
  }
  if (recs.length === 0) {
    recs.push("Ton post est déjà fort. Vérifie que le hook accroche une douleur réelle de ta cible dès les 2 premières lignes.")
    recs.push("Même un bon post peut être allégé de 20% sans rien perdre du fond. Chaque phrase doit mériter sa place.")
    recs.push("Assure-toi que ta section Sélection LinkedIn pointe vers une action claire pour les lecteurs prêts à bouger.")
  }
  return recs.slice(0,3)
}

function segBg(s) {
  if (s.type==='hu') return { bg:'#dcfce7', border:'#22c55e', tc:'#14532d' }
  if (s.sev==='high') return { bg:'#fecaca', border:'#dc2626', tc:'#7f1d1d' }
  if (s.sev==='medium') return { bg:'#fed7aa', border:'#f97316', tc:'#7c2d12' }
  return { bg:'#fef08a', border:'#eab308', tc:'#713f12' }
}

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
.card-wrap{position:relative;z-index:2;width:100%;max-width:660px}
.outer{border-radius:24px;border:10px solid rgba(18,28,40,.10);background:#FAF9F2}
.inner{background:#FAF9F2;border-radius:16px;padding:2.5rem 2rem}
.badge{background:#018EBB;color:#fff;border-radius:20px;padding:4px 14px;font-size:11px;text-transform:uppercase;font-weight:700;letter-spacing:.08em;display:inline-block}
.textarea{width:100%;background:#fff;border:1.5px solid rgba(18,28,40,.15);border-radius:12px;padding:16px;font-family:'Parkinsans',system-ui,sans-serif;font-size:.88rem;color:#121C28;line-height:1.6;resize:vertical;outline:none;transition:border-color .2s}
.textarea:focus{border-color:#018EBB}
.textarea::placeholder{color:#a0aec0}
.btn{width:100%;background:#121C28;color:#fff;border:none;border-radius:12px;padding:14px;font-weight:700;font-size:1rem;font-family:'Parkinsans',system-ui,sans-serif;cursor:pointer;transition:opacity .2s}
.btn:hover:not(:disabled){opacity:.85}
.btn:disabled{opacity:.4;cursor:not-allowed}
.toggler{background:none;border:1.5px solid rgba(18,28,40,.15);border-radius:10px;padding:8px 14px;font-size:.82rem;font-weight:600;color:#018EBB;cursor:pointer;font-family:'Parkinsans',system-ui,sans-serif;margin-top:.75rem;width:100%;text-align:left;display:flex;justify-content:space-between;align-items:center}
.anno{white-space:pre-wrap;font-family:'Parkinsans',system-ui,sans-serif;font-size:.88rem;color:#121C28;line-height:1.8;background:#fff;border-radius:12px;padding:1.25rem;border:1.5px solid rgba(18,28,40,.08)}
.mark{border-radius:4px;padding:1px 3px;cursor:help;position:relative}
.ai-item{background:#fff;border-radius:10px;border:1.5px solid rgba(18,28,40,.08);padding:.9rem 1rem;margin-bottom:.6rem}
.hu-item{background:#f0fdf4;border-radius:10px;border:1.5px solid rgba(34,197,94,.2);padding:.75rem 1rem;margin-bottom:.5rem}
.rec-n{background:#018EBB;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:800;flex-shrink:0;margin-top:1px}
.legend-dot{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px}
`

export default function App() {
  const [screen, setScreen] = useState("in")
  const [post, setPost] = useState("")
  const [ref, setRef] = useState("")
  const [showRef, setShowRef] = useState(false)
  const [res, setRes] = useState(null)
  const [anim, setAnim] = useState(0)

  const wc = post.trim() ? post.trim().split(/\s+/).length : 0

  function go() {
    const r = analyze(post, ref)
    if (!r) return
    setRes(r); setAnim(0); setScreen("out")
    let cur = 0; const step = r.score / 40
    const t = setInterval(() => { cur += step; if (cur >= r.score){cur=r.score;clearInterval(t)} setAnim(Math.round(cur)) }, 25)
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
        <div className="card-wrap">
          <div className="outer"><div className="inner">

            {screen === "in" && (
              <div>
                <div style={{textAlign:"center",marginBottom:"2rem"}}>
                  <span className="badge">Kalanis — Outil gratuit</span>
                  <h1 style={{fontFamily:"'Parkinsans',sans-serif",fontSize:"clamp(1.5rem,4vw,2.1rem)",fontWeight:800,color:"#121C28",marginTop:"1rem",lineHeight:1.2}}>
                    Ton post LinkedIn est-il<br/>vraiment <span style={{color:"#018EBB"}}>toi</span> ?
                  </h1>
                  <p style={{color:"#4a5568",marginTop:".75rem",fontSize:".9rem",lineHeight:1.65}}>
                    Colle ton post. L'outil surligne chaque signal IA et chaque marqueur humain<br/>directement dans le texte — et te dit exactement comment corriger.
                  </p>
                </div>

                <label style={{fontSize:".8rem",fontWeight:700,color:"#121C28",display:"block",marginBottom:".4rem"}}>Ton post LinkedIn</label>
                <textarea className="textarea" value={post} onChange={e=>setPost(e.target.value)}
                  placeholder="Colle ton post complet ici — avec les sauts de ligne..." rows={11}/>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:".4rem",marginBottom:"1rem"}}>
                  <span style={{fontSize:".75rem",color:"#718096"}}>{wc>0?`${wc} mots${wc<20?" — minimum 20 mots":""}`:""}</span>
                  <span style={{fontSize:".75rem",color:"#718096"}}>🔒 Analyse locale</span>
                </div>

                <button className="toggler" onClick={()=>setShowRef(!showRef)}>
                  <span>+ Optionnel : colle 2-3 de tes meilleurs posts pour une analyse de voix personnalisée</span>
                  <span>{showRef?"▲":"▼"}</span>
                </button>
                {showRef && (
                  <div style={{marginTop:".75rem"}}>
                    <p style={{fontSize:".78rem",color:"#718096",marginBottom:".4rem"}}>L'outil détectera ce qui est habituellement présent dans ta voix mais absent de ce post.</p>
                    <textarea className="textarea" value={ref} onChange={e=>setRef(e.target.value)}
                      placeholder="Colle 2-3 de tes posts de référence ici..." rows={7}/>
                  </div>
                )}

                <button className="btn" style={{marginTop:"1.25rem"}} onClick={go} disabled={wc<15}>
                  Analyser mon post →
                </button>
                <p style={{textAlign:"center",fontSize:".75rem",color:"#9ca3af",marginTop:".85rem"}}>
                  Outil créé par <strong style={{color:"#121C28"}}>Thomas Fournier / Kalanis</strong> — accompagnement LinkedIn pour freelances B2B
                </p>
              </div>
            )}

            {screen === "out" && res && (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
                  <button onClick={()=>{setScreen("in");setRes(null)}} style={{background:"none",border:"none",color:"#018EBB",cursor:"pointer",fontSize:".88rem",fontWeight:700,fontFamily:"'Parkinsans',sans-serif",padding:0}}>← Refaire</button>
                  <span className="badge">Analyse complète</span>
                </div>

                {/* Score */}
                <div style={{textAlign:"center",marginBottom:"1.75rem"}}>
                  <svg width="150" height="150" viewBox="0 0 150 150" style={{display:"block",margin:"0 auto"}}>
                    <circle cx="75" cy="75" r="60" fill="none" stroke="rgba(18,28,40,.08)" strokeWidth="11"/>
                    <circle cx="75" cy="75" r="60" fill="none" stroke={sc(res.score)} strokeWidth="11"
                      strokeLinecap="round" strokeDasharray={C} strokeDashoffset={dash}
                      transform="rotate(-90 75 75)" style={{transition:"stroke-dashoffset .04s linear"}}/>
                    <text x="75" y="71" textAnchor="middle" fill="#121C28" fontSize="32" fontWeight="800" fontFamily="'Parkinsans',sans-serif">{anim}</text>
                    <text x="75" y="94" textAnchor="middle" fill="#718096" fontSize="11" fontFamily="'Parkinsans',sans-serif">Score Humanité</text>
                  </svg>
                  <div style={{display:"inline-flex",alignItems:"center",gap:".4rem",background:v.bg,border:`1.5px solid ${v.dot}`,borderRadius:"20px",padding:"6px 16px",marginTop:".6rem"}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:v.dot,display:"inline-block",flexShrink:0}}/>
                    <span style={{color:v.tc,fontWeight:700,fontSize:".9rem"}}>{v.label}</span>
                  </div>
                </div>

                {/* Annotated post */}
                <div style={{marginBottom:"1.5rem"}}>
                  <div style={{fontWeight:700,color:"#121C28",fontSize:".92rem",marginBottom:".5rem"}}>Ton post annoté</div>
                  <div style={{display:"flex",gap:".75rem",flexWrap:"wrap",marginBottom:".6rem"}}>
                    {[
                      {bg:"#fecaca",border:"#dc2626",label:"IA sévère"},
                      {bg:"#fed7aa",border:"#f97316",label:"IA modéré"},
                      {bg:"#fef08a",border:"#eab308",label:"IA léger"},
                      {bg:"#dcfce7",border:"#22c55e",label:"Marqueur humain"},
                    ].map((l,i)=>(
                      <span key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:".72rem",color:"#4a5568"}}>
                        <span className="legend-dot" style={{background:l.bg,border:`1.5px solid ${l.border}`}}/>
                        {l.label}
                      </span>
                    ))}
                  </div>
                  <div className="anno">
                    {res.segs.map((s,i)=>{
                      if(s.type==='n') return <span key={i}>{s.text}</span>
                      const c = segBg(s)
                      return (
                        <span key={i} className="mark" title={s.label}
                          style={{background:c.bg,borderBottom:`2px solid ${c.border}`,color:c.tc,borderRadius:"3px",padding:"1px 2px"}}>
                          {s.text}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* AI issues with rewrites */}
                {res.ai.length > 0 && (
                  <div style={{marginBottom:"1.5rem"}}>
                    <div style={{fontWeight:700,color:"#dc2626",fontSize:".92rem",marginBottom:".6rem"}}>Ce qui pèche — et comment corriger</div>
                    {res.ai.map((a,i)=>(
                      <div key={i} className="ai-item">
                        <div style={{display:"flex",alignItems:"center",gap:".5rem",marginBottom:a.fix?".4rem":"0"}}>
                          <span style={{width:8,height:8,borderRadius:"50%",background:a.sev==="high"?"#dc2626":a.sev==="medium"?"#f97316":"#eab308",flexShrink:0}}/>
                          <span style={{fontWeight:700,fontSize:".84rem",color:"#121C28"}}>{a.label}</span>
                        </div>
                        {a.found.length>0 && (
                          <div style={{fontSize:".75rem",color:"#6b7280",marginBottom:".35rem",marginLeft:"1.1rem"}}>
                            Trouvé : {a.found.slice(0,2).map((f,j)=>(<span key={j} style={{fontStyle:"italic"}}>«{f}»{j<a.found.slice(0,2).length-1?", ":""}</span>))}
                          </div>
                        )}
                        {a.fix && <div style={{fontSize:".8rem",color:"#018EBB",fontWeight:600,marginLeft:"1.1rem"}}>{a.fix}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Human markers */}
                {res.hu.length > 0 && (
                  <div style={{marginBottom:"1.5rem"}}>
                    <div style={{fontWeight:700,color:"#16a34a",fontSize:".92rem",marginBottom:".6rem"}}>Ce qui fonctionne — garde ça</div>
                    {res.hu.map((h,i)=>(
                      <div key={i} className="hu-item" style={{display:"flex",alignItems:"flex-start",gap:".5rem"}}>
                        <span style={{color:"#16a34a",fontWeight:800,fontSize:".9rem",lineHeight:1.5}}>✓</span>
                        <div>
                          <span style={{fontWeight:700,fontSize:".84rem",color:"#14532d"}}>{h.label}</span>
                          {h.found.length>0 && <span style={{fontSize:".75rem",color:"#4ade80",marginLeft:".4rem"}}>— «{h.found[0]}»</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Voice comparison */}
                {res.voice && (
                  <div style={{background:"rgba(1,142,187,.07)",borderLeft:"3px solid #018EBB",borderRadius:"0 12px 12px 0",padding:"1rem 1.25rem",marginBottom:"1.5rem"}}>
                    <div style={{fontWeight:700,color:"#018EBB",fontSize:".88rem",marginBottom:".5rem"}}>Comparaison de voix</div>
                    {res.voice.map((v,i)=>(
                      <p key={i} style={{color:"#374151",fontSize:".85rem",lineHeight:1.6,marginBottom:i<res.voice.length-1?".4rem":0}}>{v}</p>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                <div style={{marginBottom:"1.75rem"}}>
                  <div style={{fontWeight:700,color:"#121C28",fontSize:".92rem",marginBottom:".75rem"}}>Tes 3 actions concrètes</div>
                  <div style={{display:"flex",flexDirection:"column",gap:".85rem"}}>
                    {getRecs(res.score,res.ai,res.hu).map((r,i)=>(
                      <div key={i} style={{display:"flex",gap:".75rem"}}>
                        <span className="rec-n">{i+1}</span>
                        <p style={{color:"#374151",fontSize:".87rem",lineHeight:1.65,margin:0}}>{r}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div style={{background:"#121C28",borderRadius:14,padding:"1.5rem",textAlign:"center"}}>
                  <p style={{color:"#fff",fontWeight:700,fontSize:"1rem",marginBottom:".35rem",lineHeight:1.35}}>
                    Tu veux un profil LinkedIn qui sonne vraiment comme toi ?
                  </p>
                  <p style={{color:"#94a3b8",fontSize:".83rem",marginBottom:"1.1rem",lineHeight:1.5}}>
                    30 min de call gratuit. Diagnostic profil + stratégie de contenu. Sans engagement.
                  </p>
                  <a href="https://calendly.com/thomas-frn/audit-gratuit" target="_blank" rel="noopener noreferrer"
                    style={{display:"inline-block",background:"#018EBB",color:"#fff",borderRadius:12,padding:"12px 28px",fontWeight:700,textDecoration:"none",fontSize:".95rem",fontFamily:"'Parkinsans',sans-serif"}}>
                    Réserver mon appel gratuit →
                  </a>
                </div>
              </div>
            )}

          </div></div>
        </div>
      </div>
    </>
  )
}
