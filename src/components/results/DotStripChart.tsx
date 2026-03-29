'use client'

import {
  ResponsiveContainer,
  ScatterChart,
  XAxis,
  YAxis,
  Scatter,
  Cell,
} from 'recharts'
import type { DotStripData } from '@/lib/utils/chart-data'

interface DotStripChartProps {
  data: DotStripData
  height?: number
}

export default function DotStripChart({ data, height = 80 }: DotStripChartProps) {
  const jitter = () => 0.3 + Math.random() * 0.4

  const points = data.values.map((v, i) => ({
    x: v,
    y: jitter(),
    key: `dot-${i}`,
  }))

  const medianPoint = [{ x: data.median, y: 0.5 }]

  return (
    <div data-chart-id={`dotstrip-${data.label}`}>
      <p className="mb-1 text-xs font-medium text-stone-600">{data.label}</p>
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 5, right: data.domain ? 40 : 10, bottom: 20, left: data.domain ? 40 : 10 }}>
          <YAxis type="number" dataKey="y" domain={[0, 1]} hide />
          <XAxis
            type="number"
            dataKey="x"
            domain={data.domain ?? [0, data.labels.length - 1]}
            ticks={data.domain
              ? data.labels.map((_, i) => data.domain![0] + (i * (data.domain![1] - data.domain![0])) / (data.labels.length - 1))
              : data.labels.map((_, i) => i)
            }
            tickFormatter={data.domain
              ? (_: number, i: number) => data.labels[i] ?? ''
              : (i: number) => data.labels[i] ?? ''
            }
            tick={{ fontSize: 10, fill: '#78716c' }}
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
