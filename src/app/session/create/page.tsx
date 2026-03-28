'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CreateSessionPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== 'borvadasz42') {
      setError('Hibás jelszó')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderName: name.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Hiba történt')
        return
      }

      const { session, participant } = await res.json()
      localStorage.setItem(`bv_participant_${session.code}`, participant.id)
      localStorage.setItem(`bv_leader_${session.code}`, 'true')
      router.push(`/session/${session.code}/leader`)
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
          <CardTitle>Kóstoló létrehozása</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin jelszó</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Jelszó"
                required
              />
            </div>
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
              {loading ? 'Létrehozás...' : 'Kóstoló létrehozása'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
