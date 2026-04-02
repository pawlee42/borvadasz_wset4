'use client'

import type { DotStripData } from '@/lib/utils/chart-data'

const COLORS = ['#e8ddd4', '#d6ccc2', '#c2a98e', '#a68a6b', '#8b6f4e', '#6b4f2e']

interface BubbleScaleProps {
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

export default function BubbleScale({ data, myValue }: BubbleScaleProps) {
  const segments = bucketValues(data)
  const maxCount = Math.max(...segments.map((s) => s.count), 1)
  const minSize = 16
  const maxSize = 56

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-foreground/70">{data.label}</p>
      <div className="flex items-center justify-between" style={{ height: 80 }}>
        {segments.map((seg, i) => {
          const size = seg.count > 0
            ? minSize + ((seg.count / maxCount) * (maxSize - minSize))
            : 8
          return (
            <div key={seg.name} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="rounded-full flex items-center justify-center transition-all"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: seg.count > 0 ? COLORS[i % COLORS.length] : '#f5f0eb',
                  border: seg.count === 0 ? '1px dashed #d6d3d1' : 'none',
                  boxShadow: myValue === i ? '0 0 0 3px #dc2626' : 'none',
                }}
              >
                {seg.count > 0 && (
                  <span
                    className="font-bold"
                    style={{
                      fontSize: Math.max(size * 0.35, 10),
                      color: i >= 3 ? '#fff' : '#5c4a3a',
                    }}
                  >
                    {seg.count}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className="relative mt-1">
        <div className="h-[2px] bg-muted rounded w-full" />
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          {data.labels.map((label) => (
            <span key={label} className="flex-1 text-center">{label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
