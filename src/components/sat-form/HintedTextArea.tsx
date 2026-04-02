'use client'

import { cn } from '@/lib/utils/cn'

interface HintedTextAreaProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  label: string
  className?: string
}

export function HintedTextArea({
  placeholder,
  value,
  onChange,
  label,
  className,
}: HintedTextAreaProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="flex w-full rounded-lg bg-surface-high bg-background px-3 py-2 text-sm placeholder:text-muted-foreground placeholder:italic transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
      />
    </div>
  )
}
