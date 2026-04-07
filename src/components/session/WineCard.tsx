'use client'

import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Wine } from '@/lib/types/database'

interface WineCardProps {
  wine: Wine
  isLeader?: boolean
  onActivate?: () => void
  onReveal?: () => void
  onViewResults?: () => void
  submissionCount?: number
  participantCount?: number
  submittedNames?: string[]
  pendingNames?: string[]
}

const TYPE_COLORS: Record<string, string> = {
  red: 'bg-red-600',
  white: 'bg-amber-300',
  rosé: 'bg-pink-400',
}

const TYPE_LABELS: Record<string, string> = {
  red: 'Vörös',
  white: 'Fehér',
  rosé: 'Rosé',
}

export function WineCard({
  wine,
  isLeader,
  onActivate,
  onReveal,
  onViewResults,
  submissionCount,
  participantCount,
  submittedNames,
  pendingNames,
}: WineCardProps) {
  return (
    <Card
      className={cn(
        'transition-colors',
        wine.is_active && 'border-primary border-2'
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-16 h-20 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
            {wine.image_url ? (
              <img
                src={wine.image_url}
                alt={wine.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg viewBox="0 0 24 40" fill="currentColor" className="h-10 w-6 text-muted-foreground">
                <path d="M9 0h6v2h-6zM10 2h4v6a6 6 0 0 1 4 5.5v20a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 33.5v-20A6 6 0 0 1 10 8z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  'w-2.5 h-2.5 rounded-full flex-shrink-0',
                  TYPE_COLORS[wine.wine_type] ?? 'bg-muted'
                )}
              />
              <span className="text-xs text-muted-foreground">
                {TYPE_LABELS[wine.wine_type] ?? wine.wine_type}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{wine.producer}</p>
            <p className="font-semibold text-sm truncate">{wine.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              {wine.vintage && <span>{wine.vintage}</span>}
              {wine.region && (
                <>
                  {wine.vintage && <span>&middot;</span>}
                  <span className="truncate">{wine.region}</span>
                </>
              )}
            </div>
            {isLeader && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {!wine.is_active && !wine.results_revealed && onActivate && (
                  <Button size="sm" variant="outline" onClick={onActivate}>
                    Aktiválás
                  </Button>
                )}
                {!wine.results_revealed && onReveal && (
                  <Button size="sm" variant="secondary" onClick={onReveal}>
                    Eredmények felfedése
                  </Button>
                )}
                {wine.results_revealed && onViewResults && (
                  <Button size="sm" variant="default" onClick={onViewResults}>
                    Eredmények megtekintése
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        {isLeader && wine.is_active && submissionCount != null && participantCount != null && (
          <div className="border-t border-border-visible/15 pt-3 space-y-1">
            <p className="text-xs font-medium text-foreground">
              Beküldött értékelések: {submissionCount}/{participantCount}
            </p>
            {submittedNames && submittedNames.length > 0 && (
              <p className="text-xs text-muted-foreground break-words">
                {submittedNames.join(', ')}
              </p>
            )}
            {pendingNames && pendingNames.length > 0 && (
              <p className="text-xs text-muted-foreground/40 break-words">
                {pendingNames.join(', ')}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
