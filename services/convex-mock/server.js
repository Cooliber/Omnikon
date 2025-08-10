import express from 'express'

const app = express()
app.use(express.json())
const PORT = process.env.PORT || 3001

app.get('/healthz', (_req, res) => res.send('ok'))

// Demo endpoints expected by motia convexAdapter.ts
app.post('/api/forms/submit', (req, res) => {
  // Accept payload and echo back an id
  res.json({ ok: true, id: `form_${Date.now()}`, received: req.body })
})

app.post('/api/shapes/save', (req, res) => {
  res.json({ ok: true, saved: true })
})

app.listen(PORT, () => console.log(`[convex-mock] listening on ${PORT}`))

