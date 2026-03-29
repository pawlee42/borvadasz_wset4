'use client'

import type { DotStripData } from '@/lib/utils/chart-data'

const COLORS = ['#e8ddd4', '#d6ccc2', '#c2a98e', '#a68a6b', '#8b6f4e', '#6b4f2e']

interface VerticalBarChartProps {
  data: DotStripData
}

function bucketValues(data: DotStripData): { name: string; count: number }[] {
  const buckets = data.labels.map((label) => ({ name: label, count: 0 }))
  for (const v of data.values) {
    if (v >= 0 && v < buckets.length) buckets[v].count++
  }
  return buckets
}

export default function VerticalBarChart({ data }: VerticalBarChartProps) {
  const segments = bucketValues(data)
  const maxCount = Math.max(...segments.map((s) => s.count), 1)

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-stone-600">{data.label}</p>
      <div className="flex items-end justify-between gap-1" style={{ height: 100 }}>
        {segments.map((seg, i) => {
          const heightPct = (seg.count / maxCount) * 100
          return (
            <div key={seg.name} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-semibold text-stone-600">
                {seg.count > 0 ? seg.count : ''}
              </span>
              <div
                className="w-full rounded-t transition-all"
                style={{
                  height: `${Math.max(heightPct, seg.count > 0 ? 8 : 2)}%`,
                  backgroundColor: seg.count > 0 ? COLORS[i % COLORS.length] : '#f5f0eb',
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-stone-400">
        {data.labels.map((label) => (
          <span key={label} className="flex-1 text-center">{label}</span>
        ))}
      </div>
    </div>
  )
}
