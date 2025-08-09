import { Editor } from 'tldraw'
import { saveShape } from './convexAdapter'

function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {
  let t: number | undefined
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t)
    // @ts-ignore browser env
    t = setTimeout(() => fn(...args), wait)
  }
}

export function attachPersistence(editor: Editor) {
  const persist = debounce(() => {
    try {
      const shapes = editor.getCurrentPageShapes()
      saveShape({ ts: Date.now(), shapes: shapes.map(s => ({ id: s.id, type: s.type, props: s.props })) })
    } catch {}
  }, 1200)
  const cleanup = editor.store.listen(() => persist(), { source: 'user', scope: 'all' })
  return () => {
    cleanup()
  }
}
