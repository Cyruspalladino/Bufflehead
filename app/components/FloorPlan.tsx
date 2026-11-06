'use client'

import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Text, Group, Line } from 'react-konva'

const GRID = 20
const CANVAS_W = 800
const CANVAS_H = 500
const ITEM_W = 100
const ITEM_H = 60

export type FloorItem = {
  id: number
  name: string
  status: string
  x: number | null
  y: number | null
}

const COLORS: Record<string, { fill: string; stroke: string }> = {
  working: { fill: '#bbf7d0', stroke: '#16a34a' },
  broken: { fill: '#fecaca', stroke: '#dc2626' },
  maintenance: { fill: '#fef08a', stroke: '#ca8a04' },
}

const snap = (v: number, max: number) =>
  Math.min(Math.max(Math.round(v / GRID) * GRID, 0), max)

export default function FloorPlan({
  items,
  editable = false,
  selectedId,
  onSelect,
  onMove,
}: {
  items: FloorItem[]
  editable?: boolean
  selectedId?: number | null
  onSelect?: (id: number | null) => void
  onMove?: (id: number, x: number, y: number) => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(CANVAS_W)

  // Scale the 800x500 canvas to fit whatever width the page gives it
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const scale = width / CANVAS_W
  const placed = items.filter((i) => i.x !== null && i.y !== null)

  const gridLines = []
  for (let x = 0; x <= CANVAS_W; x += GRID) {
    gridLines.push(
      <Line key={`v${x}`} points={[x, 0, x, CANVAS_H]} stroke="#e5e7eb" strokeWidth={1} />
    )
  }
  for (let y = 0; y <= CANVAS_H; y += GRID) {
    gridLines.push(
      <Line key={`h${y}`} points={[0, y, CANVAS_W, y]} stroke="#e5e7eb" strokeWidth={1} />
    )
  }

  return (
    <div ref={wrapRef} className="w-full overflow-hidden rounded-lg border">
      <Stage
        width={width}
        height={CANVAS_H * scale}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) onSelect?.(null)
        }}
        onTouchStart={(e) => {
          if (e.target === e.target.getStage()) onSelect?.(null)
        }}
      >
        <Layer listening={false}>
          <Rect width={CANVAS_W} height={CANVAS_H} fill="#ffffff" />
          {gridLines}
        </Layer>

        <Layer>
          {placed.map((item) => {
            const c = COLORS[item.status] ?? { fill: '#e5e7eb', stroke: '#6b7280' }
            const selected = item.id === selectedId
            return (
              <Group
                key={item.id}
                x={item.x!}
                y={item.y!}
                draggable={editable}
                onClick={() => onSelect?.(item.id)}
                onTap={() => onSelect?.(item.id)}
                onDragMove={(e) => {
                  e.target.position({
                    x: snap(e.target.x(), CANVAS_W - ITEM_W),
                    y: snap(e.target.y(), CANVAS_H - ITEM_H),
                  })
                }}
                onDragEnd={(e) => onMove?.(item.id, e.target.x(), e.target.y())}
              >
                <Rect
                  width={ITEM_W}
                  height={ITEM_H}
                  fill={c.fill}
                  stroke={selected ? '#2563eb' : c.stroke}
                  strokeWidth={selected ? 3 : 1.5}
                  cornerRadius={6}
                />
                <Text
                  text={item.name}
                  width={ITEM_W}
                  height={ITEM_H}
                  align="center"
                  verticalAlign="middle"
                  fontSize={12}
                  fill="#111827"
                  padding={4}
                />
              </Group>
            )
          })}
        </Layer>
      </Stage>
    </div>
  )
}