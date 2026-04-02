'use client'

import { cn } from '@/lib/utils/cn'

interface SessionHeaderProps {
  code: string
  role: 'leader' | 'participant'
  wineName?: string
  sessionTitle?: string
  eventDate?: string
  participantName?: string
}

export function SessionHeader({ code, role, wineName, sessionTitle, eventDate, participantName }: SessionHeaderProps) {
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <header className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-[16px]">
      <div className="flex h-14 items-center justify-between px-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/logo-circle.png"
            alt="BT"
            className="h-9 w-9 rounded-full flex-shrink-0"
          />
          <div className="min-w-0">
            {sessionTitle && (
              <p className="font-serif text-sm font-semibold text-foreground truncate leading-tight">
                {sessionTitle}
              </p>
            )}
            {formattedDate && (
              <p className="text-xs text-muted-foreground truncate leading-tight">
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
          <span className="rounded-md bg-surface-high px-2.5 py-1 text-xs font-mono font-semibold text-foreground">
            {code}
          </span>
          <span
            className={cn(
              'rounded-none px-2.5 py-1 text-xs font-medium',
              role === 'leader'
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent/20 text-accent'
            )}
          >
            {role === 'leader' ? 'Ügyvezető' : participantName ? `${participantName} — résztvevő` : 'Résztvevő'}
          </span>
        </div>
      </div>
    </header>
  )
}
