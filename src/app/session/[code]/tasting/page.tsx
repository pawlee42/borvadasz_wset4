'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SessionHeader } from '@/components/session/SessionHeader'
import { SATForm } from '@/components/sat-form/SATForm'
import { EvaluationSummary } from '@/components/tasting/EvaluationSummary'
import { Card, CardContent } from '@/components/ui/card'
import type { Wine, Session } from '@/lib/types/database'
import type { SATEvaluation } from '@/lib/types/sat'

interface EvaluationHistory {
  wine: Wine
  evaluation: SATEvaluation
}

export default function TastingPage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [participantName, setParticipantName] = useState<string | null>(null)
  const [wines, setWines] = useState<Wine[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [evaluationHistory, setEvaluationHistory] = useState<EvaluationHistory[]>([])

  useEffect(() => {
    const pid = localStorage.getItem(`bv_participant_${code}`)
    if (!pid) {
      router.push(`/session/${code}/join`)
      return
    }
    setParticipantId(pid)
    setParticipantName(localStorage.getItem(`bv_participant_name_${code}`))

    fetch(`/api/session/${code}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setSessionInfo(d) })
  }, [code, router])

  const fetchWines = useCallback(async () => {
    const res = await fetch(`/api/session/${code}/wines`)
    if (res.ok) {
      const data: Wine[] = await res.json()
      setWines(data)
    }
    setLoading(false)
  }, [code])

  const fetchMyEvaluations = useCallback(async () => {
    if (!participantId || wines.length === 0) return
    const supabase = createClient()
    const { data } = await supabase
      .from('evaluations')
      .select('wine_id, data')
      .eq('participant_id', participantId)
    if (data) {
      const history: EvaluationHistory[] = []
      for (const row of data) {
        const wine = wines.find((w) => w.id === row.wine_id)
        if (wine) {
          history.push({ wine, evaluation: row.data as SATEvaluation })
        }
      }
      // Sort by wine sort_order descending (newest first)
      history.sort((a, b) => b.wine.sort_order - a.wine.sort_order)
      setEvaluationHistory(history)
    }
  }, [participantId, wines])

  // Initial load
  useEffect(() => {
    if (participantId) fetchWines()
  }, [participantId, fetchWines])

  // Fetch my evaluations when wines are loaded
  useEffect(() => {
    fetchMyEvaluations()
  }, [fetchMyEvaluations])

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
    if (!activeWine || !participantId || activeWine.results_revealed) return
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
        fetchMyEvaluations()
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
        sessionTitle={sessionInfo?.title ?? undefined}
        eventDate={sessionInfo?.event_date ?? undefined}
        participantName={participantName ?? undefined}
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
            <p className="text-sm text-muted-foreground">
              Az ügyvezető hamarosan aktiválja a következő bort
            </p>
          </div>
        ) : activeWine.results_revealed ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-4xl mb-4">&#128270;</span>
            <h2 className="text-lg font-semibold mb-1">
              Az eredmények már elérhetők
            </h2>
            <p className="text-sm text-muted-foreground">
              Ennél a bornál az értékelés már lezárult.
            </p>
            <a
              href={`/session/${code}/leader/results`}
              className="mt-4 text-primary underline text-sm"
            >
              Eredmények megtekintése
            </a>
          </div>
        ) : submitted ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-4xl mb-4">&#10003;</span>
            <h2 className="text-lg font-semibold mb-1">
              Értékelés elküldve!
            </h2>
            <p className="text-sm text-muted-foreground">
              Várd az eredményeket...
            </p>
          </div>
        ) : (
          <>
            <Card className="mb-4">
              <CardContent className="p-4 flex items-start gap-4">
                {activeWine.image_url ? (
                  <img
                    src={activeWine.image_url}
                    alt={activeWine.name}
                    className="h-24 w-16 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="flex h-24 w-16 items-center justify-center rounded bg-surface-high text-3xl text-muted-foreground flex-shrink-0">
                    <svg viewBox="0 0 24 40" fill="currentColor" className="h-12 w-8">
                      <path d="M9 0h6v2h-6zM10 2h4v6a6 6 0 0 1 4 5.5v20a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 33.5v-20A6 6 0 0 1 10 8z" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">{activeWine.producer}</p>
                  <p className="font-semibold">{activeWine.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    {activeWine.vintage && <span>{activeWine.vintage}</span>}
                    {activeWine.region && (
                      <>
                        {activeWine.vintage && <span>&middot;</span>}
                        <span>{activeWine.region}</span>
                      </>
                    )}
                  </div>
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

        {evaluationHistory.length > 0 && (
          <div className="mt-8 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Korábbi értékeléseid ({evaluationHistory.length})
            </h3>
            {evaluationHistory.map((item) => (
              <EvaluationSummary
                key={item.wine.id}
                wine={item.wine}
                evaluation={item.evaluation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
