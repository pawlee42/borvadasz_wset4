'use client'

import type { DotStripData } from '@/lib/utils/chart-data'
import { CONCLUSIONS } from '@/lib/constants/sat-options'
import DotStripChart from '@/components/results/DotStripChart'

interface QualitySummaryProps {
  data: DotStripData
}

export default function QualitySummary({ data }: QualitySummaryProps) {
  const qualityLabel = CONCLUSIONS.quality[Math.round(data.mean)] ?? ''

  return (
    <div data-chart-id="quality" className="text-center">
      <div className="mb-2">
        <span className="text-3xl font-bold text-stone-800">
          {data.mean.toFixed(1)}
        </span>
        <span className="text-lg text-stone-500"> / 5</span>
      </div>
      <p className="mb-3 text-sm font-medium text-stone-600">{qualityLabel}</p>
      <DotStripChart data={data} height={70} />
    </div>
  )
}
