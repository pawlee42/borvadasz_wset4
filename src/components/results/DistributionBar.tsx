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
}

export default function DistributionBar({ data }: DistributionBarProps) {
  return (
    <div data-chart-id={`dist-${data.label}`}>
      <p className="mb-1 text-xs font-medium text-stone-600">{data.label}</p>
      <ResponsiveContainer width="100%" height={Math.max(data.counts.length * 32, 60)}>
        <BarChart
          data={data.counts}
          layout="vertical"
          margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
        >
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#57534e' }}
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
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
