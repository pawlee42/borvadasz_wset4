'use client'

import type { DotStripData } from '@/lib/utils/chart-data'

interface GaugeChartProps {
  data: DotStripData
}

export default function GaugeChart({ data }: GaugeChartProps) {
  const maxIdx = data.labels.length - 1
  const mean = data.values.reduce((a, b) => a + b, 0) / data.values.length
  const angle = (mean / maxIdx) * 180
  const meanLabel = data.labels[Math.round(mean)] ?? ''

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-foreground/70">{data.label}</p>
      <div className="flex justify-center">
        <div className="relative" style={{ width: 160, height: 90 }}>
          {/* Arc background */}
          <svg viewBox="0 0 160 90" className="w-full h-full">
            {data.labels.map((_, i) => {
              const startAngle = (i / data.labels.length) * 180
              const endAngle = ((i + 1) / data.labels.length) * 180
              const colors = ['#e8ddd4', '#d6ccc2', '#c2a98e', '#a68a6b', '#8b6f4e', '#6b4f2e']
              const r = 70
              const cx = 80
              const cy = 85

              const x1 = cx + r * Math.cos(Math.PI - (startAngle * Math.PI) / 180)
              const y1 = cy - r * Math.sin(Math.PI - (startAngle * Math.PI) / 180)
              const x2 = cx + r * Math.cos(Math.PI - (endAngle * Math.PI) / 180)
              const y2 = cy - r * Math.sin(Math.PI - (endAngle * Math.PI) / 180)

              const ri = r - 20
              const x3 = cx + ri * Math.cos(Math.PI - (endAngle * Math.PI) / 180)
              const y3 = cy - ri * Math.sin(Math.PI - (endAngle * Math.PI) / 180)
              const x4 = cx + ri * Math.cos(Math.PI - (startAngle * Math.PI) / 180)
              const y4 = cy - ri * Math.sin(Math.PI - (startAngle * Math.PI) / 180)

              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} A ${r} ${r} 0 0 0 ${x2} ${y2} L ${x3} ${y3} A ${ri} ${ri} 0 0 1 ${x4} ${y4} Z`}
                  fill={colors[i % colors.length]}
                />
              )
            })}

            {/* Needle */}
            {(() => {
              const needleAngle = Math.PI - (angle * Math.PI) / 180
              const needleLen = 55
              const nx = 80 + needleLen * Math.cos(needleAngle)
              const ny = 85 - needleLen * Math.sin(needleAngle)
              return (
                <>
                  <line x1={80} y1={85} x2={nx} y2={ny} stroke="#5c4a3a" strokeWidth={2.5} strokeLinecap="round" />
                  <circle cx={80} cy={85} r={4} fill="#5c4a3a" />
                </>
              )
            })()}
          </svg>
        </div>
      </div>
      <div className="text-center -mt-1">
        <span className="text-sm font-bold text-foreground/80">{meanLabel}</span>
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground px-1">
        <span>{data.labels[0]}</span>
        <span>{data.labels[data.labels.length - 1]}</span>
      </div>
    </div>
  )
}
