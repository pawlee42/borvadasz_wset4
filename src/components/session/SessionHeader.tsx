'use client'

import { cn } from '@/lib/utils/cn'

interface SessionHeaderProps {
  code: string
  role: 'leader' | 'participant'
  wineName?: string
}

export function SessionHeader({ code, role, wineName }: SessionHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-14 items-center justify-between px-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <img
            src="/logo-circle.png"
            alt="BT"
            className="h-9 w-9 rounded-full"
          />
          {wineName && (
            <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
              {wineName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-mono font-semibold text-secondary-foreground">
            {code}
          </span>
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-medium',
              role === 'leader'
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent/20 text-accent'
            )}
          >
            {role === 'leader' ? 'Ügyvezető' : 'Résztvevő'}
          </span>
        </div>
      </div>
    </header>
  )
}
