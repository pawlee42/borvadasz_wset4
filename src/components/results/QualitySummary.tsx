'use client'

import type { DotStripData } from '@/lib/utils/chart-data'
import { CONCLUSIONS } from '@/lib/constants/sat-options'

interface QualitySummaryProps {
  data: DotStripData
  myValue?: number
}

function getQualityLabel(points: number): string {
  const range = CONCLUSIONS.qualityRanges.find(
    (r) => points >= r.min && points <= r.max
  )
  return range?.label ?? ''
}

function getQualityColor(points: number): string {
  if (points >= 96) return '#4a3520'
  if (points >= 90) return '#6b4f2e'
  if (points >= 80) return '#8b6f4e'
  if (points >= 70) return '#a68a6b'
  if (points >= 60) return '#c2a98e'
  return '#d6ccc2'
}

export default function QualitySummary({ data, myValue }: QualitySummaryProps) {
  const qualityLabel = getQualityLabel(Math.round(data.mean))
  const sorted = [...data.values].sort((a, b) => a - b)
  const min = 50
  const max = 100

  // Track which sorted index matches myValue (only first match)
  let myMatchUsed = false

  return (
    <div data-chart-id="quality" className="w-full overflow-hidden">
      <p className="mb-1 text-xs font-medium text-foreground/70">Minőség</p>

      <div className="space-y-1">
        {sorted.map((v, i) => {
          const pct = ((v - min) / (max - min)) * 100
          const isMine = myValue !== undefined && v === myValue && !myMatchUsed
          if (isMine) myMatchUsed = true
          return (
            <div key={i} className="flex items-center gap-2 h-5">
              <div className="flex-1 relative h-[2px] bg-surface-high rounded">
                <div
                  className="absolute left-0 top-0 h-full rounded"
                  style={{ width: `${pct}%`, backgroundColor: isMine ? '#dc2626' : getQualityColor(v) }}
                />
                <div
                  className="absolute top-1/2 w-2.5 h-2.5 rounded-full border-2 border-white"
                  style={{
                    left: `${pct}%`,
                    backgroundColor: isMine ? '#dc2626' : getQualityColor(v),
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              </div>
              <span className={`text-[11px] w-6 text-right tabular-nums ${isMine ? 'text-red-600 font-bold' : 'text-foreground/70'}`}>
                {v}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-border-visible/15-visible/15 flex items-center justify-between">
        <div>
          <span className="text-xl font-bold text-foreground">{data.mean.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground"> / 100</span>
          <span className="ml-2 text-sm font-medium text-foreground/70">{qualityLabel}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          medián: {data.median}
        </div>
      </div>

      <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
        {CONCLUSIONS.qualityRanges.map((r) => (
          <span key={r.label}>{r.label}</span>
        ))}
      </div>
    </div>
  )
}
