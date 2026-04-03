'use client'

import { cn } from '@/lib/utils/cn'

interface FinishSliderProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

const ZONES = [
  { min: 0, max: 3, label: 'Rövid', color: 'bg-surface-high' },
  { min: 3, max: 5, label: 'Közepes(-)', color: 'bg-surface-high/70' },
  { min: 5, max: 8, label: 'Közepes', color: 'bg-accent/30' },
  { min: 8, max: 10, label: 'Közepes(+)', color: 'bg-accent/50' },
  { min: 10, max: 15, label: 'Hosszú', color: 'bg-primary/60' },
] as const

function getCategory(seconds: number): string {
  for (const zone of ZONES) {
    if (seconds < zone.max || (zone.max === 15 && seconds <= 15)) {
      return zone.label
    }
  }
  return ZONES[ZONES.length - 1].label
}

export function FinishSlider({ value, onChange, className }: FinishSliderProps) {
  const category = getCategory(value)

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">
        Utóíz (másodperc)
      </label>
      <p className="text-lg text-center font-bold text-primary">
        {value.toFixed(1)} mp &ndash; {category}
      </p>
      <div className="flex w-full rounded-md overflow-hidden h-5">
        {ZONES.map((zone) => {
          const widthPercent = ((zone.max - zone.min) / 15) * 100
          return (
            <div
              key={zone.label}
              className={cn(
                'flex items-center justify-center text-[9px] font-medium',
                zone.color
              )}
              style={{ width: `${widthPercent}%` }}
            >
              {zone.label}
            </div>
          )
        })}
      </div>
      <input
        type="range"
        min={0}
        max={15}
        step={0.5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full min-h-[44px]"
      />
    </div>
  )
}
