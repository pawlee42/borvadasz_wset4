'use client'

import type { DotStripData } from '@/lib/utils/chart-data'

const COLORS = ['#e8ddd4', '#d6ccc2', '#c2a98e', '#a68a6b', '#8b6f4e', '#6b4f2e']

interface StackedBarChartProps {
  data: DotStripData
  myValue?: number
}

function bucketValues(data: DotStripData): { name: string; count: number }[] {
  const buckets = data.labels.map((label) => ({ name: label, count: 0 }))
  for (const v of data.values) {
    if (v >= 0 && v < buckets.length) buckets[v].count++
  }
  return buckets
}

export default function StackedBarChart({ data, myValue }: StackedBarChartProps) {
  const segments = bucketValues(data)
  const total = data.values.length

  // Calculate cumulative positions for placing the marker
  const positions: { left: number; width: number }[] = []
  let cumLeft = 0
  for (const seg of segments) {
    const w = (seg.count / total) * 100
    positions.push({ left: cumLeft, width: w })
    cumLeft += w
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-foreground/70">{data.label}</p>
      <div className="relative">
        <div className="flex h-10 w-full overflow-hidden rounded-lg">
          {segments.map((seg, i) =>
            seg.count > 0 ? (
              <div
                key={seg.name}
                className="flex items-center justify-center text-[10px] font-semibold transition-all"
                style={{
                  width: `${(seg.count / total) * 100}%`,
                  backgroundColor: COLORS[i % COLORS.length],
                  color: i >= 3 ? '#fff' : '#5c4a3a',
                }}
                title={`${seg.name}: ${seg.count}`}
              >
                {seg.count >= 2 ? `${seg.name} (${seg.count})` : seg.count > 0 ? `${seg.count}` : ''}
              </div>
            ) : null
          )}
        </div>
        {myValue !== undefined && myValue >= 0 && myValue < segments.length && (
          <div
            className="absolute -bottom-3 text-[9px] font-bold text-red-600 text-center"
            style={{
              left: `${positions[myValue].left}%`,
              width: `${positions[myValue].width}%`,
            }}
          >
            ▲
          </div>
        )}
      </div>
    </div>
  )
}
