'use client'

import { cn } from '@/lib/utils/cn'
import type { Participant } from '@/lib/types/database'

interface ParticipantListProps {
  participants: Participant[]
  evaluationCounts?: Map<string, number>
}

export function ParticipantList({
  participants,
  evaluationCounts,
}: ParticipantListProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        Résztvevők ({participants.length})
      </h3>
      <ul className="space-y-1">
        {participants.map((p) => {
          const count = evaluationCounts?.get(p.id) ?? 0
          const hasSubmitted = count > 0
          return (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-card"
            >
              <span
                className={cn(
                  'flex-shrink-0 text-base',
                  hasSubmitted ? 'text-green-600' : 'text-border'
                )}
              >
                {hasSubmitted ? '✓' : '○'}
              </span>
              <span className="truncate">
                {p.name}
                {p.is_leader && (
                  <span className="ml-1.5 text-xs text-muted-foreground">(ügyvezető)</span>
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
