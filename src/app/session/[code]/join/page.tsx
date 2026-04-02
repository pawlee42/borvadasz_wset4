'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function JoinSessionPage() {
  const router = useRouter()
  const { code } = useParams<{ code: string }>()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/session/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Hiba történt')
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

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Csatlakozás</CardTitle>
          <CardDescription>
            Kód: <span className="font-mono font-bold">{code}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Neved</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="pl. Kiss János"
                required
                maxLength={100}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Csatlakozás...' : 'Csatlakozás'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
