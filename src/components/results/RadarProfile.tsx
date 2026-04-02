'use client'

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import type { RadarData } from '@/lib/utils/chart-data'

interface RadarProfileProps {
  data: RadarData[]
  myData?: RadarData[]
}

export default function RadarProfile({ data, myData }: RadarProfileProps) {
  // Merge myData values into main data array for dual-radar rendering
  const merged = myData
    ? data.map((d) => {
        const my = myData.find((m) => m.dimension === d.dimension)
        return { ...d, myValue: my?.value ?? 0 }
      })
    : data

  return (
    <div data-chart-id="radar" className="w-full overflow-hidden">
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={merged} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="#d6d3d1" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 11, fill: '#57534e' }}
          />
          <PolarRadiusAxis domain={[0, 4]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="#8b5e3c"
            fill="#8b5e3c"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          {myData && (
            <Radar
              dataKey="myValue"
              stroke="#dc2626"
              fill="#dc2626"
              fillOpacity={0.08}
              strokeWidth={2}
              strokeDasharray="4 3"
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
      {myData && (
        <div className="flex items-center justify-center gap-4 mt-1 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-[#8b5e3c]" /> átlag</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-[#dc2626]" style={{ borderBottom: '2px dashed #dc2626', height: 0 }} /> saját</span>
        </div>
      )}
    </div>
  )
}
