import { useMemo } from 'react'
import { PHASES } from './registry'
import { useAtom, useValue } from 'tldraw'

export type WorkflowState = {
  done: Record<string, boolean>
}

export function useWorkflow() {
  const atom = useAtom<WorkflowState>('motiaWorkflow', () => ({ done: {} }))
  const state = useValue('motiaWorkflow.value', () => atom.get(), [atom])
  function toggle(label: string) {
    const s = atom.get()
    const prev = !!s.done[label]
    atom.set({ done: { ...s.done, [label]: !prev } })
  }
  function reset() {
    atom.set({ done: {} })
  }
  const progress = useMemo(() => {
    const total = PHASES.length
    const count = PHASES.filter((p) => state.done[p]).length
    return { count, total, pct: Math.round((count / total) * 100) }
  }, [state])
  return { state, toggle, reset, progress }
}

export function WorkflowPanel() {
  const { state, toggle, progress } = useWorkflow()
  return (
    <div className="motia-research" style={{right: 12, bottom: 12, top: 'auto'}}>
      <div className="motia-research__header">Postęp workflow: {progress.count}/{progress.total} ({progress.pct}%)</div>
      <div className="motia-research__results">
        {PHASES.map((p) => (
          <label key={p} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={!!state.done[p]} onChange={() => toggle(p)} />
            <span>Faza: {p}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
