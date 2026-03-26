'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SessionHeader } from '@/components/session/SessionHeader'
import { SATForm } from '@/components/sat-form/SATForm'
import { Card, CardContent } from '@/components/ui/card'
import type { Wine } from '@/lib/types/database'
import type { SATEvaluation } from '@/lib/types/sat'

export default function TastingPage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [wines, setWines] = useState<Wine[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const pid = localStorage.getItem(`bv_participant_${code}`)
    if (!pid) {
      router.push(`/session/${code}/join`)
      return
    }
    setParticipantId(pid)
  }, [code, router])

  const fetchWines = useCallback(async () => {
    const res = await fetch(`/api/session/${code}/wines`)
    if (res.ok) {
      const data: Wine[] = await res.json()
      setWines(data)
    }
    setLoading(false)
  }, [code])

  // Initial load
  useEffect(() => {
    if (participantId) fetchWines()
  }, [participantId, fetchWines])

  // Track sessionId separately so realtime sub doesn't re-create on every wines change
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    if (wines.length > 0 && wines[0].session_id && !sessionId) {
      setSessionId(wines[0].session_id)
    }
  }, [wines, sessionId])

  // Realtime subscription to wine changes
  useEffect(() => {
    if (!participantId || !sessionId) return

    const supabase = createClient()
    const channel = supabase
      .channel('wines-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wines',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          setSubmitted(false)
          fetchWines()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [participantId, sessionId, fetchWines])

  const activeWine = wines.find((w) => w.is_active)

  async function handleSubmit(data: SATEvaluation) {
    if (!activeWine || !participantId) return
    setSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('evaluations').upsert(
        {
          wine_id: activeWine.id,
          participant_id: participantId,
          data,
        },
        { onConflict: 'wine_id,participant_id' }
      )

      if (!error) {
        setSubmitted(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!participantId) return null

  return (
    <div className="min-h-dvh bg-background">
      <SessionHeader
        code={code}
        role="participant"
        wineName={activeWine?.name}
      />

      <div className="max-w-3xl mx-auto p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-muted">Betöltés...</p>
          </div>
        ) : !activeWine ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">&#127863;</span>
            <h2 className="text-lg font-semibold mb-1">
              Várd a következő bort...
            </h2>
            <p className="text-sm text-muted">
              A vezető hamarosan aktiválja a következő bort
            </p>
          </div>
        ) : submitted ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-4xl mb-4">&#10003;</span>
            <h2 className="text-lg font-semibold mb-1">
              Értékelés elküldve!
            </h2>
            <p className="text-sm text-muted">
              Várd az eredményeket...
            </p>
            {activeWine.results_revealed && (
              <a
                href={`/session/${code}/leader/results`}
                className="mt-4 text-primary underline text-sm"
              >
                Eredmények megtekintése
              </a>
            )}
          </div>
        ) : (
          <>
            <Card className="mb-4">
              <CardContent className="p-4">
                <p className="text-xs text-muted">{activeWine.producer}</p>
                <p className="font-semibold">{activeWine.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                  {activeWine.vintage && <span>{activeWine.vintage}</span>}
                  {activeWine.region && (
                    <>
                      {activeWine.vintage && <span>&middot;</span>}
                      <span>{activeWine.region}</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <SATForm
              key={activeWine.id}
              wineType={activeWine.wine_type}
              onSubmit={handleSubmit}
              disabled={submitting}
            />
          </>
        )}
      </div>
    </div>
  )
}
