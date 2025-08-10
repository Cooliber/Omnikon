import express from 'express'
import fetch from 'node-fetch'

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 8787

app.get('/healthz', (_req, res) => res.send('ok'))

// Helper with timeout
async function fetchWithTimeout(url, init = {}, timeoutMs = 10000) {
  const controller = new AbortController()
  const to = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    const text = await res.text()
    let json
    try { json = JSON.parse(text) } catch { json = undefined }
    return { ok: res.ok, status: res.status, json, text }
  } finally {
    clearTimeout(to)
  }
}

app.post('/api/research/tavily', async (req, res) => {
  const { query } = req.body || {}
  const key = process.env.TAVILY_API_KEY
  if (!key) return res.status(500).json({ error: 'Missing TAVILY_API_KEY' })
  const out = await fetchWithTimeout('https://api.tavily.com/search', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: key, query, include_raw_content: false })
  })
  res.status(out.status || 500).json(out.json ?? { error: out.text })
})

app.post('/api/research/exa', async (req, res) => {
  const { query, numResults = 5 } = req.body || {}
  const key = process.env.EXA_API_KEY
  if (!key) return res.status(500).json({ error: 'Missing EXA_API_KEY' })
  const out = await fetchWithTimeout('https://api.exa.ai/search', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ query, numResults })
  })
  res.status(out.status || 500).json(out.json ?? { error: out.text })
})

app.post('/api/research/firecrawl', async (req, res) => {
  const { query, limit = 5 } = req.body || {}
  const key = process.env.FIRECRAWL_API_KEY
  if (!key) return res.status(500).json({ error: 'Missing FIRECRAWL_API_KEY' })
  const out = await fetchWithTimeout('https://api.firecrawl.dev/v1/search', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ query, limit })
  })
  res.status(out.status || 500).json(out.json ?? { error: out.text })
})

app.post('/api/research/grep', async (_req, res) => {
  // Placeholder for local code search backends
  res.json({ results: [] })
})

app.listen(PORT, () => console.log(`[research-proxy] listening on ${PORT}`))

