import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_PROVIDERS, ResearchProvider } from './research'
import { useMotiaBloc } from './bloc'

export function ResearchPanel({ providers = DEFAULT_PROVIDERS }: { providers?: ResearchProvider[] }) {
  const [query, setQuery] = useState('Motia + tldraw drag drop')
  const [providerId, setProviderId] = useState<ResearchProvider['id']>('tavily')
  const { state, dispatch } = useMotiaBloc()

  const provider = useMemo(() => providers.find(p => p.id === providerId) ?? providers[0], [providers, providerId])
  const [results, setResults] = useState<{ title: string; url?: string; snippet?: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run() {
    setLoading(true)
    setError(null)
    try {
      const r = await provider.search(query)
      setResults(r)
      dispatch({ type: 'RESEARCH_RUN', providerId, query })
    } catch (e: any) {
      setError(e?.message ?? 'Błąd wyszukiwania')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="motia-research">
      <div className="motia-research__header">Badania: Tavily / Exa / Firecrawl / Grep</div>
      <div className="motia-research__controls">
        <select aria-label="Dostawca" value={providerId} onChange={(e) => setProviderId(e.target.value as any)}>
          {providers.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input aria-label="Zapytanie" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button onClick={run} disabled={loading}>{loading ? 'Szukam…' : 'Szukaj'}</button>
      </div>
      {error && <div className="motia-research__error" style={{color:'#b91c1c'}}>{error}</div>}
      <div className="motia-research__results">
        {results.map((r, i) => (
          <div key={i} className="motia-research__result">
            <div className="motia-research__title">{r.url ? <a href={r.url} target="_blank" rel="noreferrer">{r.title}</a> : r.title}</div>
            {r.snippet && <div className="motia-research__snippet">{r.snippet}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
