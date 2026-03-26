'use client'

import { cn } from '@/lib/utils/cn'

interface OptionSelectorProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  label: string
  className?: string
}

export function OptionSelector({
  options,
  value,
  onChange,
  label,
  className,
}: OptionSelectorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[44px]',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary border border-border text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
