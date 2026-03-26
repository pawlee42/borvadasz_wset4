'use client'

import {
  ResponsiveContainer,
  ScatterChart,
  XAxis,
  YAxis,
  Scatter,
  Cell,
  ReferenceArea,
} from 'recharts'
import type { FinishData } from '@/lib/utils/chart-data'
import { PALATE } from '@/lib/constants/sat-options'

const ZONE_COLORS = [
  'rgba(220, 140, 100, 0.15)',
  'rgba(200, 150, 110, 0.12)',
  'rgba(180, 160, 120, 0.10)',
  'rgba(160, 140, 100, 0.12)',
  'rgba(139, 94, 60, 0.15)',
]

interface FinishChartProps {
  data: FinishData
}

export default function FinishChart({ data }: FinishChartProps) {
  const jitter = () => 0.3 + Math.random() * 0.4
  const points = data.values.map((v, i) => ({ x: v, y: jitter(), key: `f-${i}` }))
  const medianPoint = [{ x: data.median, y: 0.5 }]

  return (
    <div data-chart-id="finish">
      <div className="mb-2 text-center">
        <span className="text-2xl font-bold text-stone-800">
          {data.mean.toFixed(1)} mp
        </span>
        <span className="ml-2 text-sm text-stone-500">
          {data.categoryLabel}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <ScatterChart margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
          {PALATE.finishLabels.map((zone, i) => (
            <ReferenceArea
              key={i}
              x1={zone.min}
              x2={zone.max}
              fill={ZONE_COLORS[i]}
              fillOpacity={1}
              strokeOpacity={0}
            />
          ))}
          <YAxis type="number" dataKey="y" domain={[0, 1]} hide />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 15]}
            ticks={[...PALATE.finishLabels.map((z) => z.min as number), 15]}
            tickFormatter={(v: number) => {
              const label = PALATE.finishLabels.find((z) => z.min === v)
              return label?.label ?? ''
            }}
            tick={{ fontSize: 9, fill: '#78716c' }}
            axisLine={{ stroke: '#d6d3d1' }}
            tickLine={false}
          />
          <Scatter data={points} shape="circle">
            {points.map((_, i) => (
              <Cell key={i} fill="#8b5e3c" r={5} opacity={0.7} />
            ))}
          </Scatter>
          <Scatter data={medianPoint} shape="diamond">
            <Cell fill="#c2703e" r={7} />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
