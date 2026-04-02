'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Wine, Session } from '@/lib/types/database'
import type { SATEvaluation } from '@/lib/types/sat'
import { useSession } from '@/lib/hooks/useSession'
import WineResultCard from '@/components/results/WineResultCard'

interface EvalRow {
  participant_id: string
  data: SATEvaluation
}

interface WineWithEvaluations {
  wine: Wine
  evaluations: SATEvaluation[]
  myEvaluation?: SATEvaluation
}

export default function ResultsPage() {
  const params = useParams<{ code: string }>()
  const code = params.code
  const { isLeader, participantId } = useSession(code)
  const [wineResults, setWineResults] = useState<WineWithEvaluations[]>([])
  const [sessionInfo, setSessionInfo] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResults() {
      try {
        // Fetch session info
        const sessionRes = await fetch(`/api/session/${code}`)
        if (sessionRes.ok) {
          setSessionInfo(await sessionRes.json())
        }

        const pid = participantId ?? localStorage.getItem(`bv_participant_${code}`)

        const winesRes = await fetch(`/api/session/${code}/wines`)
        if (!winesRes.ok) return
        const wines: Wine[] = await winesRes.json()
        const revealed = wines.filter((w) => w.results_revealed)

        const results: WineWithEvaluations[] = []
        for (const wine of revealed) {
          const evalRes = await fetch(
            `/api/session/${code}/wines/${wine.id}/results`
          )
          if (evalRes.ok) {
            const rows: EvalRow[] = await evalRes.json()
            const evaluations: SATEvaluation[] = rows.map((r) => r.data)
            const myRow = pid ? rows.find((r) => r.participant_id === pid) : undefined
            results.push({ wine, evaluations, myEvaluation: myRow?.data })
          }
        }
        setWineResults(results)

        // Scroll to specific wine if hash is present
        setTimeout(() => {
          const hash = window.location.hash.slice(1)
          if (hash) {
            const element = document.getElementById(hash)
            element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      } catch (err) {
        console.error('Eredmények betöltése sikertelen:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [code, participantId])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Eredmények betöltése...</p>
      </div>
    )
  }

  if (wineResults.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Még nincsenek közzétett eredmények.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 print:max-w-none print:p-0">
      <div className="flex items-center justify-between" data-print-hide>
        <div className="flex items-center gap-3">
          <Link
            href={isLeader ? `/session/${code}/leader` : `/session/${code}/tasting`}
            className="text-sm text-muted-foreground hover:text-foreground/80"
          >
            &larr; Vissza
          </Link>
          <h1 className="text-xl font-bold text-foreground">Kóstolás eredményei</h1>
        </div>
        {isLeader && (
          <button
            onClick={handlePrint}
            className="rounded-md bg-stone-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700"
          >
            PDF letöltése / Nyomtatás
          </button>
        )}
      </div>

      {sessionInfo && (sessionInfo.title || sessionInfo.event_date || sessionInfo.location) && (
        <div className="rounded-lg border border-border-visible/15 bg-white p-4 sm:p-6 flex items-center gap-4">
          <img src="/logo-circle.png" alt="BT" className="h-16 w-16 rounded-full print:h-12 print:w-12" />
          <div>
            {sessionInfo.title && (
              <h2 className="text-lg font-bold text-foreground">{sessionInfo.title}</h2>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-muted-foreground mt-0.5">
              {sessionInfo.event_date && (
                <span>{new Date(sessionInfo.event_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              )}
              {sessionInfo.location && <span>{sessionInfo.location}</span>}
              <span>Ügyvezető: {sessionInfo.leader_name}</span>
            </div>
          </div>
        </div>
      )}

      {wineResults.map((wr) => (
        <WineResultCard
          key={wr.wine.id}
          wine={wr.wine}
          evaluations={wr.evaluations}
          participantCount={wr.evaluations.length}
          myEvaluation={wr.myEvaluation}
        />
      ))}
    </div>
  )
}
