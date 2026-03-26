'use client'

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts'
import type { RadarData } from '@/lib/utils/chart-data'

interface RadarProfileProps {
  data: RadarData[]
}

export default function RadarProfile({ data }: RadarProfileProps) {
  return (
    <div data-chart-id="radar">
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="#d6d3d1" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 11, fill: '#57534e' }}
          />
          <Radar
            dataKey="value"
            stroke="#8b5e3c"
            fill="#8b5e3c"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
