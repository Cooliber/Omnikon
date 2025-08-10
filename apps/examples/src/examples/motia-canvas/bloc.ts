// Minimalny wzorzec BLoC (PocketFlow-like) do obsługi akcji Motia.
// Nie używamy zewnętrznej biblioteki — prosty event->state reactor oparty na atomach tldraw.
import { useAtom, useValue } from 'tldraw'

export type MotiaEvent =
  | { type: 'RESEARCH_RUN'; providerId: string; query: string }
  | { type: 'REGISTRY_ADD'; item: any }
  | { type: 'REGISTRY_REMOVE'; id: string }

export type MotiaState = {
  lastAction?: string
}

export function useMotiaBloc() {
  const stateAtom = useAtom<MotiaState>('motiaBloc.state', () => ({}))
  const state = useValue('motiaBloc.state.value', () => stateAtom.get(), [stateAtom])

  function dispatch(ev: MotiaEvent) {
    switch (ev.type) {
      case 'RESEARCH_RUN': {
        stateAtom.set({ lastAction: `Research ${ev.providerId}: ${ev.query}` })
        break
      }
      case 'REGISTRY_ADD': {
        stateAtom.set({ lastAction: 'Dodano komponent' })
        break
      }
      case 'REGISTRY_REMOVE': {
        stateAtom.set({ lastAction: 'Usunięto komponent' })
        break
      }
    }
  }

  return { state, dispatch }
}
