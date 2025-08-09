import { useAtom, useValue } from 'tldraw'

export const PHASES = [
  'Formalize',
  'Model',
  'Analyze',
  'Predict',
  'Debate',
  'Decide',
  'Act',
  'Observe',
  'Refine',
] as const
export type MotiaPhase = typeof PHASES[number]

export type RegistryItem = {
  id: string
  label: string
  emoji?: string
  shapeType: string
  shapeProps?: Record<string, unknown>
}

export function makePhase(label: string): RegistryItem {
  return {
    id: `phase-${label.toLowerCase()}`,
    label,
    emoji: '🧭',
    shapeType: 'geo',
    shapeProps: { geo: 'rectangle', text: `Faza: ${label}` },
  }
}

const INITIAL: RegistryItem[] = [
  ...PHASES.map(makePhase),
  { id: 'note', label: 'Notatka', emoji: '📝', shapeType: 'note', shapeProps: { text: 'Notatka' } },
  { id: 'ui-button', label: 'Przycisk (shadcn-like)', emoji: '🔘', shapeType: 'motia-ui-button', shapeProps: { text: 'Szukaj' } },
  { id: 'chart', label: 'Wykres', emoji: '📊', shapeType: 'motia-chart', shapeProps: { title: 'Wykres', series: [2,4,6,3,8] } },
  { id: 'form', label: 'Formularz', emoji: '📋', shapeType: 'motia-form', shapeProps: { title: 'Formularz', submitLabel: 'Zapisz' } },
]

export function useRegistry() {
  const atom = useAtom<RegistryItem[]>('motiaRegistry', () => INITIAL)
  const items = useValue('motiaRegistry.value', () => atom.get(), [atom])
  const setItems = (updater: (prev: RegistryItem[]) => RegistryItem[]) => atom.set(updater(atom.get()))
  const addItem = (item: RegistryItem) => atom.set([...atom.get(), item])
  const removeItem = (id: string) => atom.set(atom.get().filter((i) => i.id !== id))
  return { items, addItem, removeItem, setItems }
}
