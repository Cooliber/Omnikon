import { useMemo, useRef } from 'react'
import {
  Box,
  Editor,
  TLEditorComponents,
  TLUiOverrides,
  Tldraw,
  Vec,
  useAtom,
  useEditor,
  useQuickReactor,
  useValue,
} from 'tldraw'
import 'tldraw/tldraw.css'
import '../drag-and-drop-tray/drag-and-drop-tray.css'

import './motia.css'
import { ResearchPanel } from './ResearchPanel'
import { PHASES, useRegistry } from './registry'
import type { RegistryItem } from './registry'
import { MotiaUIButtonShapeUtil } from './shape-ui-button'

import { MotiaChartShapeUtil } from './shape-chart'
import { MotiaFormShapeUtil } from './shape-form'
import { attachPersistence } from './persist'

import { WorkflowPanel } from './workflow'

// 1) Węzły 9-fazowego cyklu Motia pochodzą z registry.ts (PHASES)
// 2) Rejestr komponentów pochodzi z registry.ts (useRegistry, RegistryItem)

// 3) Drag & drop tray based on examples/drag-and-drop-tray

type DragState =
  | { name: 'idle' }
  | { name: 'pointing_item'; item: RegistryItem; startPosition: Vec }
  | { name: 'dragging'; item: RegistryItem; currentPosition: Vec }

const MotiaTray = ({ registry }: { registry: RegistryItem[] }) => {
  const rTrayContainer = useRef<HTMLDivElement>(null)
  const rDraggingImage = useRef<HTMLDivElement>(null)
  const editor = useEditor()
  const dragState = useAtom<DragState>('motiaDragState', () => ({ name: 'idle' }))

  const { handlePointerUp, handlePointerDown } = useMemo(() => {
    let target: HTMLDivElement | null = null

    function handlePointerMove(e: PointerEvent) {
      const current = dragState.get()
      const screenPoint = new Vec(e.clientX, e.clientY)
      switch (current.name) {
        case 'idle':
          break
        case 'pointing_item': {
          const dist = Vec.Dist(screenPoint, current.startPosition)
          if (dist > 10) {
            dragState.set({ name: 'dragging', item: current.item, currentPosition: screenPoint })
          }
          break
        }
        case 'dragging': {
          dragState.set({ ...current, currentPosition: screenPoint })
          break
        }
      }
    }

    function handlePointerUp(e: React.PointerEvent) {
      const current = dragState.get()
      target = e.currentTarget as HTMLDivElement
      target.releasePointerCapture(e.pointerId)
      switch (current.name) {
        case 'idle':
          break
        case 'pointing_item': {
          dragState.set({ name: 'idle' })
          break
        }
        case 'dragging': {
          const screenPoint = new Vec(e.clientX, e.clientY)
          const pagePoint = editor.screenToPage(screenPoint)
          editor.markHistoryStoppingPoint('motia: create from tray')
          editor.createShape({
            type: current.item.shapeType,
            x: pagePoint.x - 50,
            y: pagePoint.y - 50,
            props: current.item.shapeProps,
          })
          dragState.set({ name: 'idle' })
          break
        }
      }
      removeEventListeners()
    }

    function handlePointerDown(e: React.PointerEvent) {
      e.preventDefault()
      target = e.currentTarget as HTMLDivElement
      target.setPointerCapture(e.pointerId)
      const itemIndex = target.dataset.drag_item_index!
      const item = registry[+itemIndex]
      if (!item) return
      const startPosition = new Vec(e.clientX, e.clientY)
      dragState.set({ name: 'pointing_item', item, startPosition })
      target.addEventListener('pointermove', handlePointerMove)
      document.addEventListener('keydown', handleKeyDown)
    }

    function handleKeyDown(e: KeyboardEvent) {
      const current = dragState.get()
      if (e.key === 'Escape' && current.name === 'dragging') removeEventListeners()
    }

    function removeEventListeners() {
      if (target) {
        target.removeEventListener('pointermove', handlePointerMove)
        document.removeEventListener('keydown', handleKeyDown)
      }
      dragState.set({ name: 'idle' })
    }

    return { handlePointerDown, handlePointerUp }
  }, [dragState, editor, registry])

  const state = useValue('motiaDragState', () => dragState.get(), [dragState])

  useQuickReactor(
    'motia-drag-image-style',
    () => {
      const current = dragState.get()
      const imageRef = rDraggingImage.current
      const trayContainerRef = rTrayContainer.current
      if (!imageRef || !trayContainerRef) return
      switch (current.name) {
        case 'idle':
        case 'pointing_item':
          imageRef.style.display = 'none'
          break
        case 'dragging': {
          const trayContainerRect = trayContainerRef.getBoundingClientRect()
          const box = new Box(
            trayContainerRect.x,
            trayContainerRect.y,
            trayContainerRect.width,
            trayContainerRect.height
          )
          const viewportScreenBounds = editor.getViewportScreenBounds()
          const isInside = Box.ContainsPoint(box, current.currentPosition)
          if (isInside) {
            imageRef.style.display = 'none'
          } else {
            imageRef.style.display = 'block'
            imageRef.style.position = 'absolute'
            imageRef.style.pointerEvents = 'none'
            imageRef.style.left = '0px'
            imageRef.style.top = '0px'
            imageRef.style.transform = `translate(${current.currentPosition.x - viewportScreenBounds.x - 25}px, ${current.currentPosition.y - viewportScreenBounds.y - 25}px)`
            imageRef.style.width = '50px'
            imageRef.style.height = '50px'
            imageRef.style.fontSize = '40px'
            imageRef.style.display = 'flex'
            imageRef.style.alignItems = 'center'
          }
        }
      }
    },
    [dragState]
  )

  return (
    <>
      <div className="drag-tray" ref={rTrayContainer}>
        <div className="drag-tray-items">
          {registry.map((item, index) => (
            <div
              key={item.id}
              className="drag-tray-item"
              title={item.label}
              data-drag_item_index={index}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            >
              {item.emoji ?? '🔹'}
            </div>
          ))}
        </div>
      </div>
      <div ref={rDraggingImage}>{state.name === 'dragging' && (state.item.emoji ?? '🔹')}</div>
    </>
  )
}

// 4) UI overrides: add simple toolbar group for Motia
const uiOverrides: TLUiOverrides = {
  toolbar(_editor, toolbar, { tools }) {
    toolbar.splice(0, 0, {
      id: 'motia-separator',
      type: 'spacer',
    })
    return toolbar
  },
}

const editorComponents: TLEditorComponents = {
  InFrontOfTheCanvas: () => {
    const { items } = useRegistry()
    return (
      <>
        <MotiaTray registry={items} />
        <ResearchPanel />
        <WorkflowPanel />
      </>
    )
  },
}


export default function MotiaCanvasExample() {
  const shapeUtils = [MotiaUIButtonShapeUtil, MotiaChartShapeUtil, MotiaFormShapeUtil]
  return (
    <div className="tldraw__editor">
      <Tldraw
        shapeUtils={shapeUtils}
        persistenceKey="motia-canvas"
        components={editorComponents}
        uiOverrides={uiOverrides}
        onMount={(editor: Editor) => {
          bootstrapMotiaWorkflow(editor)
          attachPersistence(editor)
        }}
      />
    </div>
  )
}

// 5) On mount: seed the 9-phase layout as demo
function bootstrapMotiaWorkflow(editor: Editor) {
  const start = editor.getViewportPageBounds().center
  const spacing = 280
  const rows = 3
  PHASES.forEach((phase, idx) => {
    const row = Math.floor(idx / rows)
    const col = idx % rows
    editor.createShape({
      type: 'geo',
      x: start.x + col * spacing,
      y: start.y + row * spacing,
      props: { geo: 'rounded-rectangle', text: `Faza: ${phase}` },
    })
  })
}
