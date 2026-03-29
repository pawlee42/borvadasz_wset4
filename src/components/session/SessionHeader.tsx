'use client'

import { cn } from '@/lib/utils/cn'

interface SessionHeaderProps {
  code: string
  role: 'leader' | 'participant'
  wineName?: string
  sessionTitle?: string
  eventDate?: string
}

export function SessionHeader({ code, role, wineName, sessionTitle, eventDate }: SessionHeaderProps) {
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-14 items-center justify-between px-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/logo-circle.png"
            alt="BT"
            className="h-9 w-9 rounded-full flex-shrink-0"
          />
          <div className="min-w-0">
            {sessionTitle && (
              <p className="text-sm font-semibold text-foreground truncate leading-tight">
                {sessionTitle}
              </p>
            )}
            {formattedDate && (
              <p className="text-xs text-muted truncate leading-tight">
                {formattedDate}
              </p>
            )}
            {!sessionTitle && !formattedDate && wineName && (
              <span className="text-sm font-medium text-foreground truncate">
                {wineName}
              </span>
            )}
          </div>
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
