'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Session } from '@/lib/types/database'

export default function JoinSessionPage() {
  const router = useRouter()
  const { code } = useParams<{ code: string }>()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [showNameConflict, setShowNameConflict] = useState(false)

  useEffect(() => {
    async function checkExistingSession() {
      const existingId = localStorage.getItem(`bv_participant_${code}`)
      if (existingId) {
        const validateRes = await fetch(`/api/session/${code}/join?participantId=${existingId}`)
        if (validateRes.ok) {
          router.push(`/session/${code}/tasting`)
          return
        }
        localStorage.removeItem(`bv_participant_${code}`)
        localStorage.removeItem(`bv_participant_name_${code}`)
      }

      const sessionRes = await fetch(`/api/session/${code}`)
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json()
        setSession(sessionData)
      }
      setSessionLoading(false)
    }

    checkExistingSession()
  }, [code, router])

  const formattedDate = session?.event_date
    ? new Date(session.event_date).toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  async function submitJoin(shouldConfirm: boolean) {
    setLoading(true)
    setError('')
    setShowNameConflict(false)

    try {
      const res = await fetch(`/api/session/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          ...(shouldConfirm ? { confirm: true } : {}),
        }),
      })

      if (!res.ok) {
        const responseData = await res.json()
        if (responseData.nameConflict) {
          setShowNameConflict(true)
          return
        }
        setError(responseData.error ?? 'Hiba történt')
        return
      }

      const { participant } = await res.json()
      localStorage.setItem(`bv_participant_${code}`, participant.id)
      localStorage.setItem(`bv_participant_name_${code}`, name.trim())
      router.push(`/session/${code}/tasting`)
    } catch {
      setError('Hálózati hiba, próbáld újra')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    submitJoin(false)
  }

  function handleConfirmRejoin() {
    submitJoin(true)
  }

  function handleChangeName() {
    setShowNameConflict(false)
    setName('')
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <img
          src="/logo.png"
          alt="Borvadász Társaság"
          className="h-24 w-auto"
        />

        {sessionLoading ? (
          <p className="text-sm text-muted-foreground">Betöltés...</p>
        ) : session ? (
          <div className="text-center space-y-1">
            {session.title && (
              <h1 className="font-serif text-2xl font-semibold text-foreground">
                {session.title}
              </h1>
            )}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
              {formattedDate && <span>{formattedDate}</span>}
              {formattedDate && session.location && <span>·</span>}
              {session.location && <span>{session.location}</span>}
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-600">Kóstoló nem található</p>
        )}

        {showNameConflict ? (
          <div className="w-full space-y-4">
            <div className="rounded-xl bg-surface-low p-4 space-y-2">
              <p className="text-sm text-foreground">
                Már van egy <strong>{name.trim()}</strong> a kóstolón.
              </p>
              <p className="text-xs text-muted-foreground">
                Ha te vagy az (pl. másik eszközről csatlakozol), nyomj a Folytatás gombra.
                Ha nem, használj becenevet vagy vezetéknév + keresztnév kombinációt.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleChangeName}
                disabled={loading}
              >
                Név módosítása
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmRejoin}
                disabled={loading}
              >
                {loading ? 'Csatlakozás...' : 'Folytatás'}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Neved</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="pl. Kiss János"
                required
                maxLength={100}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || !name.trim() || !session}
            >
              {loading ? 'Csatlakozás...' : 'Csatlakozás'}
            </Button>
          </form>
        )}
      </div>
    </main>
  )
}
