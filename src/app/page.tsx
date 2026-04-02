'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LandingPage() {
  const router = useRouter()
  const [code, setCode] = useState('')

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length === 6) {
      router.push(`/session/${trimmed}/join`)
    }
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4 mb-8">
          <img
            src="/logo-circle.png"
            alt="Borvadász Társaság"
            className="mx-auto h-32 w-32 rounded-full"
          />
          <div className="space-y-1">
            <h1 className="font-serif text-4xl font-bold tracking-tight" style={{ letterSpacing: '-0.02em' }}>Borvadász Társaság</h1>
            <p className="text-muted-foreground text-sm tracking-wide">...csak szelektíven</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Csatlakozás</CardTitle>
            <CardDescription>
              Add meg a 6 karakteres kódot a csatlakozáshoz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="font-mono text-center text-lg tracking-widest"
              />
              <Button type="submit" disabled={code.trim().length !== 6}>
                Belépés
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="pt-8 text-center">
          <button
            onClick={() => router.push('/session/create')}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Ügyvezető
          </button>
        </div>
      </div>
    </main>
  )
}
