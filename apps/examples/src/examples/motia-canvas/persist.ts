import { Editor } from 'tldraw'
import { saveShape } from './convexAdapter'

function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {
  let t: ReturnType<typeof setTimeout> | undefined
  return (...args: Parameters<T>) => {
    if (t !== undefined) {
      clearTimeout(t)
    }
    t = setTimeout(() => fn(...args), wait)
  }
}

export function attachPersistence(editor: Editor) {
  const persist = debounce(() => {
    try {
      const shapes = editor.getCurrentPageShapes()
      // fire-and-forget, but log failures
      saveShape({ ts: Date.now(), shapes: shapes.map(s => ({ id: s.id, type: s.type, props: s.props })) })
        .catch((err) => console.warn('Persist failure:', err))
    } catch (err) {
      console.warn('Persist error:', err)
    }
  }, 1200)
  const cleanup = editor.store.listen(() => persist(), { source: 'user', scope: 'all' })
  return () => {
    cleanup()
  }
}
