import { HTMLContainer, RecordProps, Rectangle2d, ShapeUtil, T, TLBaseShape, TLResizeInfo, resizeBox } from 'tldraw'

export type UIBtnShape = TLBaseShape<
  'motia-ui-button',
  {
    w: number
    h: number
    text: string
  }
>

export class MotiaUIButtonShapeUtil extends ShapeUtil<UIBtnShape> {
  static override type = 'motia-ui-button' as const
  static override props: RecordProps<UIBtnShape> = {
    w: T.number,
    h: T.number,
    text: T.string,
  }

  getDefaultProps(): UIBtnShape['props'] {
    return { w: 160, h: 48, text: 'Przycisk' }
  }

  override canEdit() {
    return false
  }
  override canResize() {
    return true
  }
  override isAspectRatioLocked() {
    return false
  }

  getGeometry(shape: UIBtnShape) {
    return new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true })
  }

  override onResize(shape: any, info: TLResizeInfo<any>) {
    return resizeBox(shape, info)
  }

  component(shape: UIBtnShape) {
    const { text, w, h } = shape.props
    return (
      <HTMLContainer style={{ display: 'flex', width: w, height: h, alignItems: 'center', justifyContent: 'center' }}>
        <button
          style={{
            all: 'unset',
            background: '#0ea5e9',
            color: 'white',
            padding: '8px 14px',
            borderRadius: 8,
            boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            fontSize: 14,
            cursor: 'pointer',
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            // In real app, wire to actions (e.g., trigger research or open dialog)
            // eslint-disable-next-line no-alert
            alert(`Kliknięto: ${text}`)
          }}
        >
          {text}
        </button>
      </HTMLContainer>
    )
  }

  indicator(shape: UIBtnShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={8} ry={8} />
  }
}
