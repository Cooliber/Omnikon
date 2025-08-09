import { HTMLContainer, RecordProps, Rectangle2d, ShapeUtil, T, TLBaseShape, TLResizeInfo, resizeBox } from 'tldraw'
import { saveFormData } from './convexAdapter'

export type FormShape = TLBaseShape<
  'motia-form',
  {
    w: number
    h: number
    title: string
    submitLabel: string
  }
>

export class MotiaFormShapeUtil extends ShapeUtil<FormShape> {
  static override type = 'motia-form' as const
  static override props: RecordProps<FormShape> = {
    w: T.number,
    h: T.number,
    title: T.string,
    submitLabel: T.string,
  }

  getDefaultProps(): FormShape['props'] {
    return { w: 320, h: 200, title: 'Formularz', submitLabel: 'Zapisz' }
  }

  getGeometry(shape: FormShape) {
    return new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true })
  }

  override onResize(shape: any, info: TLResizeInfo<any>) {
    return resizeBox(shape, info)
  }

  component(shape: FormShape) {
    const { title, w, h, submitLabel } = shape.props
    return (
      <HTMLContainer style={{ width: w, height: h, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}>
        <div style={{ padding: 8, fontWeight: 600 }}>{title}</div>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8 }}
          onPointerDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onSubmit={async (e) => { e.preventDefault(); await saveFormData({ ts: Date.now(), title, values: {} }); alert('Wysłano (Convex demo)') }}
        >
          <label>
            Imię i nazwisko
            <input style={{ width: '100%' }} />
          </label>
          <label>
            Email
            <input type="email" style={{ width: '100%' }} />
          </label>
          <button type="submit" style={{ alignSelf: 'start', padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: 6 }}>
            {submitLabel}
          </button>
        </form>
      </HTMLContainer>
    )
  }

  indicator(shape: FormShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={8} ry={8} />
  }
}
