// Warstwa integracji badań: Tavily, Exa, Firecrawl oraz lokalny grep.
// Klucze API oczekiwane w Vite env: VITE_TAVILY_API_KEY, VITE_EXA_API_KEY, VITE_FIRECRAWL_API_KEY
// W przeglądarce lokalny grep nie jest dostępny — zwracamy informację dla użytkownika.

export type ResearchProvider = {
  id: 'grep' | 'tavily' | 'exa' | 'firecrawl'
  name: string
  search(query: string): Promise<{ title: string; url?: string; snippet?: string }[]>
}

const TAVILY_KEY = (import.meta as any).env?.VITE_TAVILY_API_KEY as string | undefined
const EXA_KEY = (import.meta as any).env?.VITE_EXA_API_KEY as string | undefined
const FIRECRAWL_KEY = (import.meta as any).env?.VITE_FIRECRAWL_API_KEY as string | undefined
const GREP_HTTP_URL = (import.meta as any).env?.VITE_GREP_HTTP_URL as string | undefined

async function safeJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch (e) {
    throw new Error(`Nieprawidłowa odpowiedź JSON: ${text.slice(0, 200)}`)
  }
}

async function fetchJsonWithRetry<T>(url: string, init: RequestInit, retries = 1): Promise<T> {
  let lastErr: any
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, init)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      return await safeJson<T>(res)
    } catch (e) {
      lastErr = e
      if (i < retries) await new Promise((r) => setTimeout(r, 400 * (i + 1)))
    }
  }
  throw lastErr
}

export const grepProvider: ResearchProvider = {
  id: 'grep',
  name: 'Grep (lokalnie)',
  async search(query: string) {
    if (!GREP_HTTP_URL) {
      return [
        {
          title: `Grep lokalny niedostępny w przykładzie`,
          snippet:
            `Nie można przeszukać lokalnego repozytorium z poziomu przeglądarki. Ustaw VITE_GREP_HTTP_URL lub uruchom backend/CLI (ripgrep). Zapytanie: ${query}`,
        },
      ]
    }
    const res = await fetch(GREP_HTTP_URL.replace(/\/$/, '') + '/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    if (!res.ok) throw new Error(`Grep HTTP ${res.status}`)
    const data = await safeJson<any>(res)
    const items = (data.results ?? data.data ?? []) as any[]
    return items.map((r) => ({ title: r.path ?? 'Plik', snippet: r.line, url: r.url }))
  },
}

export const tavilyProvider: ResearchProvider = {
  id: 'tavily',
  name: 'Tavily (www)',
  async search(query: string) {
    if (!TAVILY_KEY) {
      return [
        { title: 'Brak klucza Tavily', snippet: 'Ustaw VITE_TAVILY_API_KEY aby włączyć integrację.' },
      ]
    }
    const data = await fetchJsonWithRetry<any>('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: TAVILY_KEY, query, include_raw_content: false }),
    }, 1)
    const items = (data.results ?? data.data ?? []) as any[]
    return items.map((r) => ({ title: r.title ?? r.url ?? 'Wynik', url: r.url, snippet: r.content ?? r.snippet }))
  },
}

export const exaProvider: ResearchProvider = {
  id: 'exa',
  name: 'Exa (semantyczne)',
  async search(query: string) {
    if (!EXA_KEY) {
      return [
        { title: 'Brak klucza Exa', snippet: 'Ustaw VITE_EXA_API_KEY aby włączyć integrację.' },
      ]
    }
    const data = await fetchJsonWithRetry<any>('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${EXA_KEY}`,
      },
      body: JSON.stringify({ query, numResults: 5 }),
    }, 1)
    const items = (data.results ?? data.data ?? []) as any[]
    return items.map((r) => ({ title: r.title ?? r.url ?? 'Wynik', url: r.url, snippet: r.text ?? r.snippet }))
  },
}

export const firecrawlProvider: ResearchProvider = {
  id: 'firecrawl',
  name: 'Firecrawl (scraping)',
  async search(query: string) {
    if (!FIRECRAWL_KEY) {
      return [
        { title: 'Brak klucza Firecrawl', snippet: 'Ustaw VITE_FIRECRAWL_API_KEY aby włączyć integrację.' },
      ]
    }
    // Użyj endpointu /v1/search aby znaleźć URL-e, a następnie /v1/scrape dla treści
    const searchData = await fetchJsonWithRetry<any>('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_KEY}`,
      },
      body: JSON.stringify({ query, limit: 5 }),
    }, 1)
    const items = (searchData.results ?? searchData.data ?? []) as any[]
    return items.map((r) => ({ title: r.title ?? r.url ?? 'Wynik', url: r.url, snippet: r.snippet }))
  },
}

export const DEFAULT_PROVIDERS: ResearchProvider[] = [
  grepProvider,
  tavilyProvider,
  exaProvider,
  firecrawlProvider,
]
