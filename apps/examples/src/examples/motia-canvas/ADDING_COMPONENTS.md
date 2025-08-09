# Dodawanie nowych komponentów (Motia)

- Otwórz `registry.ts` i użyj `useRegistry()` aby zarejestrować nowe elementy UI, np.:

```ts
import { useRegistry } from './registry'
const { addItem } = useRegistry()
addItem({ id: 'przycisk', label: 'Przycisk', emoji: '🔘', shapeType: 'geo', shapeProps: { geo: 'ellipse', text: 'Przycisk' } })
```

- Komponenty z `shapeType` mapują bezpośrednio na typy tldraw (`geo`, `note`, itd.) lub na własne custom shapes.
- Aby dodać węzły 9-fazowego cyklu, skorzystaj z `makePhase(label)` lub wstępnie zarejestrowanych wpisów w `INITIAL`.
- Integracja shadcn/ui: umieszczaj elementy jako `HTMLContainer` w custom shape util lub buduj palety (tray) i panele (`InFrontOfTheCanvas`).
- Integracje badawcze (Tavily/Exa/Firecrawl/Grep) są dostępne przez `research.ts` – podmień implementacje `search()` na prawdziwe wywołania API.


## Rejestr komponentów
- Znajdziesz w `registry.ts` wszystkie elementy początkowe (węzły 9 faz, notatka, przycisk, wykres, formularz).
- `useRegistry()` udostępnia `items`, `addItem`, `removeItem`.

## Kształty niestandardowe (shapes)
- Przykłady: `shape-ui-button.tsx`, `shape-chart.tsx`, `shape-form.tsx`.
- Zarejestruj util w `MotiaCanvasExample.tsx` przez `shapeUtils=[...]`.

## Integracja Convex
- Skonfiguruj env: `VITE_CONVEX_HTTP_URL`, opcjonalnie `VITE_CONVEX_FORM_ENDPOINT`, `VITE_CONVEX_SHAPES_ENDPOINT`.
- Użyj `convexAdapter.ts` do zapisu danych formularzy lub stanów kształtów.

## Integracje badawcze
- Skonfiguruj env: `VITE_TAVILY_API_KEY`, `VITE_EXA_API_KEY`, `VITE_FIRECRAWL_API_KEY`.
- `research.ts` zawiera gotowe wywołania `fetch`.
