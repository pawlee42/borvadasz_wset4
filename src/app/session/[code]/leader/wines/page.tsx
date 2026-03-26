'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { SessionHeader } from '@/components/session/SessionHeader'
import { WineForm } from '@/components/session/WineForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Wine } from '@/lib/types/database'

export default function ManageWinesPage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()
  const [wines, setWines] = useState<Wine[]>([])
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
    if (res.ok) setWines(await res.json())
    setLoading(false)
  }, [code])

  useEffect(() => {
    if (participantId) fetchWines()
  }, [participantId, fetchWines])

  async function handleAdd(data: {
    producer: string
    name: string
    vintage: number | null
    region: string
    wine_type: string
    image_url: string | null
  }) {
    const res = await fetch(`/api/session/${code}/wines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-participant-id': participantId!,
      },
      body: JSON.stringify(data),
    })
    if (res.ok) fetchWines()
  }

  async function handleDelete(wineId: string) {
    const res = await fetch(`/api/session/${code}/wines`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-participant-id': participantId!,
      },
      body: JSON.stringify({ wineId }),
    })
    if (res.ok || res.status === 204) fetchWines()
  }

  return (
    <div className="min-h-dvh bg-background">
      <SessionHeader code={code} role="leader" />

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Borok kezelése</h2>
          <Link href={`/session/${code}/leader`}>
            <Button variant="outline" size="sm">
              Vissza
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="pt-5">
            <WineForm onSubmit={handleAdd} />
          </CardContent>
        </Card>

        {wines.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted">
              Hozzáadott borok ({wines.length})
            </h3>
            {wines.map((wine) => (
              <Card key={wine.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{wine.name}</p>
                    <p className="text-xs text-muted truncate">
                      {wine.producer}
                      {wine.vintage ? ` - ${wine.vintage}` : ''}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(wine.id)}
                  >
                    Törlés
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
