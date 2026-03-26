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
  submissionCount?: number
  participantCount?: number
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
  submissionCount,
  participantCount,
}: WineCardProps) {
  return (
    <Card
      className={cn(
        'transition-colors',
        wine.is_active && 'border-primary border-2'
      )}
    >
      <CardContent className="flex gap-4 p-4">
        <div className="flex-shrink-0 w-16 h-20 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
          {wine.image_url ? (
            <img
              src={wine.image_url}
              alt={wine.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl text-muted">🍷</span>
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
            <span className="text-xs text-muted">
              {TYPE_LABELS[wine.wine_type] ?? wine.wine_type}
            </span>
          </div>
          <p className="text-xs text-muted truncate">{wine.producer}</p>
          <p className="font-semibold text-sm truncate">{wine.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
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
              {!wine.is_active && onActivate && (
                <Button size="sm" variant="outline" onClick={onActivate}>
                  Aktiválás
                </Button>
              )}
              {onReveal && (
                <Button size="sm" variant="secondary" onClick={onReveal}>
                  Eredmények
                </Button>
              )}
              {submissionCount != null && participantCount != null && (
                <span className="text-xs text-muted ml-auto">
                  {submissionCount}/{participantCount} beérkezett
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
