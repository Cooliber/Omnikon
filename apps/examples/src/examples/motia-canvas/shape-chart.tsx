import { HTMLContainer, RecordProps, Rectangle2d, ShapeUtil, T, TLBaseShape, TLResizeInfo, resizeBox } from 'tldraw'

export type ChartShape = TLBaseShape<
  'motia-chart',
  {
    w: number
    h: number
    title: string
    series: number[]
  }
>

export class MotiaChartShapeUtil extends ShapeUtil<ChartShape> {
  static override type = 'motia-chart' as const
  static override props: RecordProps<ChartShape> = {
    w: T.number,
    h: T.number,
    title: T.string,
    series: T.arrayOf(T.number),
  }

  getDefaultProps(): ChartShape['props'] {
    return { w: 300, h: 160, title: 'Wykres', series: [3, 6, 2, 8, 5] }
  }

  getGeometry(shape: ChartShape) {
    return new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true })
  }

  override onResize(shape: any, info: TLResizeInfo<any>) {
    return resizeBox(shape, info)
  }

  component(shape: ChartShape) {
    const { title, w, h, series } = shape.props
    const max = Math.max(1, ...series)
    return (
      <HTMLContainer style={{ width: w, height: h, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}>
        <div style={{ padding: 8, fontWeight: 600 }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'end', gap: 6, height: h - 40, padding: '0 8px 8px' }}>
          {series.map((v, i) => (
            <div key={i} style={{ background: '#0ea5e9', width: 18, height: Math.max(4, Math.round((v / max) * (h - 48))) }} />
          ))}
        </div>
      </HTMLContainer>
    )
  }

  indicator(shape: ChartShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={8} ry={8} />
  }
}
