import express from 'express'

const app = express()
app.use(express.json())
const PORT = process.env.PORT || 3001

app.get('/healthz', (_req, res) => res.send('ok'))

// Production mode: proxy to real Convex deployment
if (process.env.NODE_ENV === 'production' && process.env.CONVEX_DEPLOYMENT_URL) {
  const CONVEX_URL = process.env.CONVEX_DEPLOYMENT_URL

  app.post('/api/forms/submit', async (req, res) => {
    try {
      const response = await fetch(`${CONVEX_URL}/forms/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      })
      const data = await response.json()
      res.json(data)
    } catch (error) {
      res.status(500).json({ error: 'Convex proxy error' })
    }
  })

  app.post('/api/shapes/save', async (req, res) => {
    try {
      const response = await fetch(`${CONVEX_URL}/shapes/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      })
      const data = await response.json()
      res.json(data)
    } catch (error) {
      res.status(500).json({ error: 'Convex proxy error' })
    }
  })
} else {
  // Development mode: mock endpoints
  app.post('/api/forms/submit', (req, res) => {
    res.json({ ok: true, id: `form_${Date.now()}`, received: req.body })
  })

  app.post('/api/shapes/save', (req, res) => {
    res.json({ ok: true, saved: true })
  })
}

app.listen(PORT, () => console.log(`[convex-mock] listening on ${PORT}`))

