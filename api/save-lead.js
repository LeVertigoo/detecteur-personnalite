// Vercel serverless function — enregistre un lead dans Notion
// Env vars nécessaires dans Vercel Dashboard > Settings > Environment Variables :
//   NOTION_TOKEN  = ton token d'intégration Notion (Internal Integration Secret)
//   NOTION_DB_ID  = (optionnel) ID de la DB, défaut = eba2f9899c9a4e2ab6580f3da96aa3fb

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { linkedinUrl } = req.body || {}

  if (!linkedinUrl || !linkedinUrl.trim()) {
    return res.status(400).json({ error: 'LinkedIn URL required' })
  }

  const NOTION_TOKEN = process.env.NOTION_TOKEN
  const NOTION_DB_ID = process.env.NOTION_DB_ID || 'eba2f9899c9a4e2ab6580f3da96aa3fb'

  // Si le token n'est pas configuré, on laisse passer silencieusement
  if (!NOTION_TOKEN) {
    console.warn('[save-lead] NOTION_TOKEN not set — lead not saved')
    return res.status(200).json({ ok: true, note: 'token_missing' })
  }

  const url = linkedinUrl.trim()
  // Normalise l'URL
  const fullUrl = url.startsWith('http')
    ? url
    : url.startsWith('@')
    ? `https://www.linkedin.com/in/${url.slice(1)}`
    : `https://www.linkedin.com/in/${url}`

  try {
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DB_ID },
        properties: {
          Nom: { title: [{ text: { content: url } }] },
          'LinkedIn URL': { url: fullUrl },
          Source: { rich_text: [{ text: { content: 'Détecteur de Voix' } }] },
        },
      }),
    })

    if (!notionRes.ok) {
      const err = await notionRes.text()
      console.error('[save-lead] Notion API error:', err)
      // On laisse quand même passer l'utilisateur
      return res.status(200).json({ ok: true, note: 'notion_error' })
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('[save-lead] Fetch error:', error)
    return res.status(200).json({ ok: true, note: 'fetch_error' })
  }
}
