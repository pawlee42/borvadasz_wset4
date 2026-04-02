'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { DotStripData } from '@/lib/utils/chart-data'
import { CONCLUSIONS } from '@/lib/constants/sat-options'

const COLORS = ['#d6ccc2', '#c2a98e', '#a68a6b', '#8b6f4e', '#6b4f2e', '#4a3520']

interface CategoryPieChartProps {
  data: DotStripData
  height?: number
  myValue?: number
}

function bucketValues(data: DotStripData): { name: string; count: number }[] {
  if (data.domain) {
    // Quality: bucket by qualityRanges
    const buckets = CONCLUSIONS.qualityRanges.map((r) => ({ name: r.label, count: 0 }))
    for (const v of data.values) {
      const idx = CONCLUSIONS.qualityRanges.findIndex((r) => v >= r.min && v <= r.max)
      if (idx >= 0) buckets[idx].count++
    }
    return buckets.filter((b) => b.count > 0)
  }

  // Regular: each integer value maps to a label
  const buckets = data.labels.map((label) => ({ name: label, count: 0 }))
  for (const v of data.values) {
    if (v >= 0 && v < buckets.length) buckets[v].count++
  }
  return buckets.filter((b) => b.count > 0)
}

export default function CategoryPieChart({ data, height = 160, myValue }: CategoryPieChartProps) {
  const segments = bucketValues(data)
  const total = data.values.length

  // Resolve own label
  const myLabel = myValue !== undefined && myValue >= 0 && myValue < data.labels.length
    ? data.labels[myValue]
    : undefined

  return (
    <div data-chart-id={`pie-${data.label}`}>
      <p className="mb-1 text-xs font-medium text-foreground/70">{data.label}</p>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={segments}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={55}
            innerRadius={25}
            paddingAngle={2}
            label={({ name, count }) => `${name} (${count})`}
          >
            {segments.map((entry, i) => (
              <Cell
                key={entry.name}
                fill={COLORS[i % COLORS.length]}
                stroke={entry.name === myLabel ? '#dc2626' : undefined}
                strokeWidth={entry.name === myLabel ? 3 : undefined}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value}/${total}`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      {myLabel && (
        <p className="text-center text-[10px] font-medium text-red-600 -mt-2">Saját: {myLabel}</p>
      )}
    </div>
  )
}
