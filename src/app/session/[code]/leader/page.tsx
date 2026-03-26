'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { SessionHeader } from '@/components/session/SessionHeader'
import { WineCard } from '@/components/session/WineCard'
import { ParticipantList } from '@/components/session/ParticipantList'
import { Button } from '@/components/ui/button'
import type { Wine, Participant } from '@/lib/types/database'

export default function LeaderDashboard() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()
  const [wines, setWines] = useState<Wine[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({})
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const pid = localStorage.getItem(`bv_participant_${code}`)
    const isLeader = localStorage.getItem(`bv_leader_${code}`)
    if (!pid || isLeader !== 'true') {
      router.push(`/session/${code}/join`)
      return
    }
    setParticipantId(pid)
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

  const fetchSubmissionCounts = useCallback(async () => {
    if (!sessionId) return
    const supabase = createClient()
    const activeWine = wines.find((w) => w.is_active)
    if (!activeWine) return

    const { data } = await supabase
      .from('evaluations')
      .select('id')
      .eq('wine_id', activeWine.id)

    setSubmissionCounts((prev) => ({
      ...prev,
      [activeWine.id]: data?.length ?? 0,
    }))
  }, [sessionId, wines])

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
          // Fetch session id from a participant lookup
          const supabase = createClient()
          const { data: p } = await supabase
            .from('participants')
            .select('session_id')
            .eq('id', participantId)
            .single()
          if (p) setSessionId(p.session_id)
        }
      }
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
          event: 'INSERT',
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
    await fetch(`/api/session/${code}/wines`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-participant-id': participantId!,
      },
      body: JSON.stringify({ wineId, action: 'reveal' }),
    })
    fetchWines()
  }

  const activeWine = wines.find((w) => w.is_active)
  const nonLeaderCount = participants.filter((p) => !p.is_leader).length

  return (
    <div className="min-h-dvh bg-background">
      <SessionHeader code={code} role="leader" wineName={activeWine?.name} />

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Vezérlőpult</h2>
          <Link href={`/session/${code}/leader/wines`}>
            <Button variant="outline" size="sm">
              Borok kezelése
            </Button>
          </Link>
        </div>

        {wines.length === 0 ? (
          <div className="text-center py-12 text-muted">
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
                submissionCount={submissionCounts[wine.id] ?? 0}
                participantCount={nonLeaderCount}
              />
            ))}
          </div>
        )}

        {wines.some((w) => w.results_revealed) && (
          <div className="pt-2">
            <Link href={`/session/${code}/leader/results`}>
              <Button variant="secondary" className="w-full">
                Eredmények megtekintése
              </Button>
            </Link>
          </div>
        )}

        <ParticipantList participants={participants} />
      </div>
    </div>
  )
}
