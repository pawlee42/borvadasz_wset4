'use client'

import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils/cn'

interface ScaleSliderProps {
  labels: string[]
  value: number
  onChange: (value: number) => void
  label: string
  className?: string
}

export function ScaleSlider({
  labels,
  value,
  onChange,
  label,
  className,
}: ScaleSliderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Slider
        min={0}
        max={labels.length - 1}
        step={1}
        value={value}
        onChange={onChange}
        labels={labels}
      />
    </div>
  )
}
