'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { SessionHeader } from '@/components/session/SessionHeader'
import { WineCard } from '@/components/session/WineCard'
import { ParticipantList } from '@/components/session/ParticipantList'
import { Button } from '@/components/ui/button'
import { QRCheckin } from '@/components/session/QRCheckin'
import type { Wine, Participant, Session } from '@/lib/types/database'

const RESULTS_WINDOW_NAME = 'borvadasz-results'

export default function LeaderDashboard() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()
  const resultsWindowRef = useRef<Window | null>(null)
  const [wines, setWines] = useState<Wine[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({})
  const [submittedNames, setSubmittedNames] = useState<Record<string, string[]>>({})
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionInfo, setSessionInfo] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  function isMobileDevice() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  }

  function navigateToResults(wineId?: string) {
    const hash = wineId ? `#wine-result-${wineId}` : ''
    const url = `/session/${code}/leader/results${hash}`

    if (isMobileDevice()) {
      router.push(url)
      return
    }

    const existing = resultsWindowRef.current
    if (existing && !existing.closed) {
      existing.location.replace(url)
      existing.location.reload()
      existing.focus()
    } else {
      resultsWindowRef.current = window.open(url, RESULTS_WINDOW_NAME)
    }
  }

  useEffect(() => {
    const pid = localStorage.getItem(`bv_participant_${code}`)
    const isLeader = localStorage.getItem(`bv_leader_${code}`)
    if (!pid || isLeader !== 'true') {
      router.push(`/session/${code}/join`)
      return
    }
    setParticipantId(pid)

    fetch(`/api/session/${code}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setSessionInfo(d) })
  }, [code, router])

  const fetchWines = useCallback(async () => {
    const res = await fetch(`/api/session/${code}/wines`)
    if (res.ok) {
      const data = await res.json()
      setWines(data)
    }
  }, [code])

  const fetchParticipants = useCallback(async () => {
    if (!sessionId) return
    const supabase = createClient()
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('session_id', sessionId)
    if (data) setParticipants(data)
  }, [sessionId])

  const [pendingNames, setPendingNames] = useState<Record<string, string[]>>({})

  const fetchSubmissionCounts = useCallback(async () => {
    if (!sessionId || wines.length === 0) return
    const supabase = createClient()

    const counts: Record<string, number> = {}
    const names: Record<string, string[]> = {}
    const pending: Record<string, string[]> = {}
    for (const wine of wines) {
      const { data } = await supabase
        .from('evaluations')
        .select('participant_id, submitted_at')
        .eq('wine_id', wine.id)
        .order('submitted_at', { ascending: true })
      counts[wine.id] = data?.length ?? 0
      if (data && data.length > 0) {
        const evalPids = data.map((e) => e.participant_id)
        // Maintain submission order from the query
        const orderedNames: string[] = []
        for (const evalRow of data) {
          const participant = participants.find((p) => p.id === evalRow.participant_id && !p.is_leader)
          if (participant) orderedNames.push(participant.name)
        }
        names[wine.id] = orderedNames
        // Pending: non-leader participants who haven't submitted
        pending[wine.id] = participants
          .filter((p) => !p.is_leader && !evalPids.includes(p.id))
          .map((p) => p.name)
      } else {
        names[wine.id] = []
        pending[wine.id] = participants
          .filter((p) => !p.is_leader)
          .map((p) => p.name)
      }
    }
    setSubmissionCounts(counts)
    setSubmittedNames(names)
    setPendingNames(pending)
  }, [sessionId, wines, participants])

  // Initial data load
  useEffect(() => {
    if (!participantId) return

    async function init() {
      const res = await fetch(`/api/session/${code}/wines`)
      if (res.ok) {
        const data = await res.json()
        setWines(data)
        if (data.length > 0) {
          setSessionId(data[0].session_id)
        } else {
          const supabase = createClient()
          const { data: p } = await supabase
            .from('participants')
            .select('session_id')
            .eq('id', participantId)
            .single()
          if (p) setSessionId(p.session_id)
        }
      }
      setLoading(false)
    }
    init()
  }, [participantId, code])

  // Fetch participants when sessionId is available
  useEffect(() => {
    if (sessionId) fetchParticipants()
  }, [sessionId, fetchParticipants])

  // Fetch submission counts when wines change
  useEffect(() => {
    if (sessionId && wines.length > 0) fetchSubmissionCounts()
  }, [sessionId, wines, fetchSubmissionCounts])

  // Realtime subscriptions
  useEffect(() => {
    if (!sessionId) return

    const supabase = createClient()

    const participantsSub = supabase
      .channel('participants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `session_id=eq.${sessionId}`,
        },
        () => fetchParticipants()
      )
      .subscribe()

    const evaluationsSub = supabase
      .channel('evaluations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evaluations',
        },
        () => fetchSubmissionCounts()
      )
      .subscribe()

    const winesSub = supabase
      .channel('wines-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wines',
          filter: `session_id=eq.${sessionId}`,
        },
        () => fetchWines()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(participantsSub)
      supabase.removeChannel(evaluationsSub)
      supabase.removeChannel(winesSub)
    }
  }, [sessionId, fetchParticipants, fetchSubmissionCounts, fetchWines])

  async function handleActivate(wineId: string) {
    await fetch(`/api/session/${code}/wines`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-participant-id': participantId!,
      },
      body: JSON.stringify({ wineId, action: 'activate' }),
    })
    fetchWines()
  }

  async function handleReveal(wineId: string) {
    const res = await fetch(`/api/session/${code}/wines`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-participant-id': participantId!,
      },
      body: JSON.stringify({ wineId, action: 'reveal' }),
    })
    if (res.ok) {
      navigateToResults(wineId)
    }
    fetchWines()
  }

  async function handleRemoveParticipant(targetId: string) {
    await fetch(`/api/session/${code}/participants`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-participant-id': participantId!,
      },
      body: JSON.stringify({ participantId: targetId }),
    })
    fetchParticipants()
    fetchSubmissionCounts()
  }

  const activeWine = wines.find((w) => w.is_active)
  const nonLeaderCount = participants.filter((p) => !p.is_leader).length

  return (
    <div className="min-h-dvh bg-background">
      <SessionHeader
        code={code}
        role="leader"
        wineName={activeWine?.name}
        sessionTitle={sessionInfo?.title ?? undefined}
        eventDate={sessionInfo?.event_date ?? undefined}
      />

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Vezérlőpult</h2>
          <Link href={`/session/${code}/leader/wines`}>
            <Button variant="outline" size="sm">
              Borok kezelése
            </Button>
          </Link>
        </div>

        <QRCheckin code={code} />

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Betöltés...</p>
          </div>
        ) : wines.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">Még nincsenek borok hozzáadva</p>
            <Link href={`/session/${code}/leader/wines`}>
              <Button>Borok hozzáadása</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {wines.map((wine) => (
              <WineCard
                key={wine.id}
                wine={wine}
                isLeader
                onActivate={() => handleActivate(wine.id)}
                onReveal={() => handleReveal(wine.id)}
                onViewResults={() => navigateToResults(wine.id)}
                submissionCount={submissionCounts[wine.id] ?? 0}
                participantCount={nonLeaderCount}
                submittedNames={submittedNames[wine.id]}
                pendingNames={pendingNames[wine.id]}
              />
            ))}
          </div>
        )}

        {wines.some((w) => w.results_revealed) && (
          <div className="pt-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigateToResults()}
            >
              Összes eredmény megtekintése
            </Button>
          </div>
        )}

        <ParticipantList
          participants={participants}
          isLeader
          onRemove={handleRemoveParticipant}
        />
      </div>
    </div>
  )
}
