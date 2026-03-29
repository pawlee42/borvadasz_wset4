'use client'

import type { DotStripData } from '@/lib/utils/chart-data'
import { CONCLUSIONS } from '@/lib/constants/sat-options'

interface QualitySummaryProps {
  data: DotStripData
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

export default function QualitySummary({ data }: QualitySummaryProps) {
  const qualityLabel = getQualityLabel(Math.round(data.mean))
  const sorted = [...data.values].sort((a, b) => a - b)
  const min = 50
  const max = 100

  return (
    <div data-chart-id="quality">
      <p className="mb-1 text-xs font-medium text-stone-600">Minőség</p>

      <div className="space-y-1">
        {sorted.map((v, i) => {
          const pct = ((v - min) / (max - min)) * 100
          return (
            <div key={i} className="flex items-center gap-2 h-5">
              <div className="flex-1 relative h-[2px] bg-stone-100 rounded">
                <div
                  className="absolute left-0 top-0 h-full rounded"
                  style={{ width: `${pct}%`, backgroundColor: getQualityColor(v) }}
                />
                <div
                  className="absolute top-1/2 w-2.5 h-2.5 rounded-full border-2 border-white"
                  style={{
                    left: `${pct}%`,
                    backgroundColor: getQualityColor(v),
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              </div>
              <span className="text-[11px] text-stone-600 w-6 text-right tabular-nums">
                {v}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-stone-200 flex items-center justify-between">
        <div>
          <span className="text-xl font-bold text-stone-800">{data.mean.toFixed(1)}</span>
          <span className="text-sm text-stone-500"> / 100</span>
          <span className="ml-2 text-sm font-medium text-stone-600">{qualityLabel}</span>
        </div>
        <div className="text-xs text-stone-400">
          medián: {data.median}
        </div>
      </div>

      <div className="flex justify-between mt-2 text-[10px] text-stone-400">
        {CONCLUSIONS.qualityRanges.map((r) => (
          <span key={r.label}>{r.label}</span>
        ))}
      </div>
    </div>
  )
}
