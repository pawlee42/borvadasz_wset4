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
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Borvadász Társaság</h1>
          <p className="text-muted text-sm">Borkóstoló Alkalmazás</p>
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
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            Ügyvezető
          </button>
        </div>
      </div>
    </main>
  )
}
