'use client'

import { cn } from '@/lib/utils/cn'

interface SliderProps {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  labels?: string[]
  name?: string
  className?: string
}

export function Slider({
  min,
  max,
  step,
  value,
  onChange,
  labels,
  name,
  className,
}: SliderProps) {
  const totalSteps = labels ? labels.length - 1 : Math.round((max - min) / step)

  return (
    <div className={cn('w-full', className)}>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full min-h-[44px]"
      />
      {labels && (
        <div className="relative w-full mt-1 px-[12px]">
          <div className="flex justify-between">
            {labels.map((label, i) => {
              const isActive = i === value
              return (
                <div
                  key={i}
                  className="flex flex-col items-center"
                  style={{ width: 0 }}
                >
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full mb-1',
                      isActive ? 'bg-primary' : 'bg-border'
                    )}
                  />
                  <span
                    className={cn(
                      'text-[10px] leading-tight text-center whitespace-nowrap',
                      isActive
                        ? 'text-primary font-bold'
                        : 'text-muted'
                    )}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
