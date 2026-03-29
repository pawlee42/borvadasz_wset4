'use client'

import type { FinishData } from '@/lib/utils/chart-data'
import { PALATE } from '@/lib/constants/sat-options'

interface FinishChartProps {
  data: FinishData
}

function getZoneColor(seconds: number): string {
  if (seconds < 3) return '#d6ccc2'
  if (seconds < 5) return '#c2a98e'
  if (seconds < 8) return '#a68a6b'
  if (seconds < 10) return '#8b6f4e'
  return '#6b4f2e'
}

function getZoneLabel(seconds: number): string {
  const zone = PALATE.finishLabels.find((z) => seconds >= z.min && seconds < z.max)
  return zone?.label ?? 'Hosszú'
}

export default function FinishChart({ data }: FinishChartProps) {
  const sorted = [...data.values].sort((a, b) => a - b)
  const max = 15

  return (
    <div data-chart-id="finish">
      <p className="mb-1 text-xs font-medium text-stone-600">Utóíz (másodperc)</p>

      <div className="space-y-1">
        {sorted.map((v, i) => {
          const pct = (v / max) * 100
          return (
            <div key={i} className="flex items-center gap-2 h-5">
              <div className="flex-1 relative h-[2px] bg-stone-100 rounded">
                <div
                  className="absolute left-0 top-0 h-full rounded"
                  style={{ width: `${pct}%`, backgroundColor: getZoneColor(v) }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white"
                  style={{ left: `${pct}%`, backgroundColor: getZoneColor(v), transform: 'translate(-50%, -50%)' }}
                />
              </div>
              <span className="text-[11px] text-stone-600 w-8 text-right tabular-nums">
                {v.toFixed(1)}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-stone-200 flex items-center justify-between">
        <div>
          <span className="text-xl font-bold text-stone-800">{data.mean.toFixed(1)} mp</span>
          <span className="ml-2 text-sm text-stone-500">{data.categoryLabel}</span>
        </div>
        <div className="text-xs text-stone-400">
          medián: {data.median.toFixed(1)} mp
        </div>
      </div>

      <div className="flex justify-between mt-2 text-[10px] text-stone-400">
        {PALATE.finishLabels.map((z) => (
          <span key={z.label}>{z.label}</span>
        ))}
      </div>
    </div>
  )
}
