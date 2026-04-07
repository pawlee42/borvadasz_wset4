'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import type { Participant } from '@/lib/types/database'

interface ParticipantListProps {
  participants: Participant[]
  evaluationCounts?: Map<string, number>
  isLeader?: boolean
  onRemove?: (participantId: string, keepEvaluations: boolean) => void
}

export function ParticipantList({
  participants,
  evaluationCounts,
  isLeader,
  onRemove,
}: ParticipantListProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null)

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
              <span className={cn('truncate flex-1', p.is_removed && 'text-muted-foreground line-through')}>
                {p.name}
                {p.is_leader && (
                  <span className="ml-1.5 text-xs text-muted-foreground">(ügyvezető)</span>
                )}
                {p.is_removed && (
                  <span className="ml-1.5 text-xs text-muted-foreground no-underline">(eltávozott)</span>
                )}
              </span>
              {isLeader && !p.is_leader && !p.is_removed && onRemove && (
                confirmId === p.id ? (
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() => { onRemove(p.id, true); setConfirmId(null) }}
                      className="text-xs text-foreground/70 hover:text-foreground font-medium px-1.5 py-0.5 rounded bg-surface-high"
                    >
                      Eltávozott
                    </button>
                    <button
                      onClick={() => { onRemove(p.id, false); setConfirmId(null) }}
                      className="text-xs text-red-600 hover:text-red-700 font-medium px-1.5 py-0.5 rounded bg-red-50"
                    >
                      Törlés értékelésekkel
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5"
                    >
                      Mégsem
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(p.id)}
                    className="text-xs text-muted-foreground hover:text-red-600 flex-shrink-0 px-1.5 py-0.5 transition-colors"
                    title="Résztvevő eltávolítása"
                  >
                    ✕
                  </button>
                )
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
