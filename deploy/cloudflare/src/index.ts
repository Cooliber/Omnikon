import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  CACHE: KVNamespace
  DB: D1Database
  FILES: R2Bucket
  WORKFLOW_STATE: DurableObjectNamespace
  
  // Secrets (set via wrangler secret put)
  TAVILY_API_KEY: string
  EXA_API_KEY: string
  FIRECRAWL_API_KEY: string
  RAYNET_API_KEY: string
  RAYNET_API_URL: string
  RAYNET_INSTANCE: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', logger())
app.use('/api/*', cors({
  origin: ['https://your-domain.com', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Research API proxy
app.post('/api/research/tavily', async (c) => {
  const { query } = await c.req.json()
  const apiKey = c.env.TAVILY_API_KEY
  
  if (!apiKey) {
    return c.json({ error: 'Missing TAVILY_API_KEY' }, 500)
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        api_key: apiKey, 
        query, 
        include_raw_content: false 
      }),
    })
    
    const data = await response.json()
    return c.json(data)
  } catch (error) {
    return c.json({ error: 'Tavily API error' }, 500)
  }
})

app.post('/api/research/exa', async (c) => {
  const { query, numResults = 5 } = await c.req.json()
  const apiKey = c.env.EXA_API_KEY
  
  if (!apiKey) {
    return c.json({ error: 'Missing EXA_API_KEY' }, 500)
  }

  try {
    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ query, numResults }),
    })
    
    const data = await response.json()
    return c.json(data)
  } catch (error) {
    return c.json({ error: 'Exa API error' }, 500)
  }
})

app.post('/api/research/firecrawl', async (c) => {
  const { query, limit = 5 } = await c.req.json()
  const apiKey = c.env.FIRECRAWL_API_KEY
  
  if (!apiKey) {
    return c.json({ error: 'Missing FIRECRAWL_API_KEY' }, 500)
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ query, limit }),
    })
    
    const data = await response.json()
    return c.json(data)
  } catch (error) {
    return c.json({ error: 'Firecrawl API error' }, 500)
  }
})

// Raynet CRM integration
app.post('/api/raynet/search', async (c) => {
  const { q } = await c.req.json()
  const apiKey = c.env.RAYNET_API_KEY
  const apiUrl = c.env.RAYNET_API_URL
  
  if (!apiKey || !apiUrl) {
    return c.json({ error: 'Missing Raynet configuration' }, 500)
  }

  try {
    // Implement actual Raynet API calls here
    return c.json({ items: [], query: q })
  } catch (error) {
    return c.json({ error: 'Raynet API error' }, 500)
  }
})

// Convex-like persistence (using D1)
app.post('/api/convex/forms/submit', async (c) => {
  const payload = await c.req.json()
  
  try {
    const result = await c.env.DB.prepare(
      'INSERT INTO form_submissions (data, created_at) VALUES (?, ?)'
    ).bind(JSON.stringify(payload), new Date().toISOString()).run()
    
    return c.json({ ok: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ error: 'Database error' }, 500)
  }
})

app.post('/api/convex/shapes/save', async (c) => {
  const payload = await c.req.json()
  
  try {
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO shapes (data, updated_at) VALUES (?, ?)'
    ).bind(JSON.stringify(payload), new Date().toISOString()).run()
    
    return c.json({ ok: true, saved: true })
  } catch (error) {
    return c.json({ error: 'Database error' }, 500)
  }
})

// Serve static frontend files
app.get('*', serveStatic({ root: './dist' }))
app.get('*', serveStatic({ path: './dist/index.html' })) // SPA fallback

export default app

// Durable Object for workflow state
export class WorkflowState {
  constructor(private state: DurableObjectState, private env: Bindings) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    
    if (url.pathname === '/workflow/state') {
      const state = await this.state.storage.get('workflow') || {}
      return new Response(JSON.stringify(state), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    if (url.pathname === '/workflow/update' && request.method === 'POST') {
      const update = await request.json()
      await this.state.storage.put('workflow', update)
      return new Response(JSON.stringify({ ok: true }))
    }
    
    return new Response('Not found', { status: 404 })
  }
}
