'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import type { DistributionData } from '@/lib/utils/chart-data'

const COLORS = ['#8b5e3c', '#a0714d', '#b5845e', '#c99870', '#ddab82']

interface DistributionBarProps {
  data: DistributionData
  myLabel?: string
}

export default function DistributionBar({ data, myLabel }: DistributionBarProps) {
  return (
    <div data-chart-id={`dist-${data.label}`} className="w-full overflow-hidden">
      <p className="mb-1 text-xs font-medium text-foreground/70">{data.label}</p>
      <ResponsiveContainer width="100%" height={Math.max(data.counts.length * 32, 60)}>
        <BarChart
          data={data.counts}
          layout="vertical"
          margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
        >
          <YAxis
            type="category"
            dataKey="name"
            tick={({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => (
              <text
                x={x}
                y={y}
                dy={4}
                textAnchor="end"
                fontSize={11}
                fill={myLabel && payload.value === myLabel ? '#dc2626' : '#57534e'}
                fontWeight={myLabel && payload.value === myLabel ? 700 : 400}
              >
                {payload.value}
              </text>
            )}
            axisLine={false}
            tickLine={false}
            width={75}
          />
          <XAxis
            type="number"
            hide
            domain={[0, 'dataMax']}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18} label={{ position: 'right', fontSize: 11, fill: '#78716c' }}>
            {data.counts.map((_, i) => (
              <Cell
                key={i}
                fill={COLORS[i % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
