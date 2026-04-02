'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CreateSessionPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [leaderName, setLeaderName] = useState('')
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [location, setLocation] = useState('')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const csvRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLInputElement>(null)

  async function handlePasswordCheck(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        setError('Hibás jelszó')
        return
      }
      setAuthenticated(true)
    } catch {
      setError('Hálózati hiba')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Create session
      const res = await fetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          leaderName: leaderName.trim(),
          title: title.trim() || undefined,
          eventDate: eventDate || undefined,
          location: location.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Hiba történt')
        return
      }

      const { session, participant } = await res.json()
      localStorage.setItem(`bv_participant_${session.code}`, participant.id)
      localStorage.setItem(`bv_leader_${session.code}`, 'true')

      // 2. Upload wines via CSV if provided
      if (csvFile) {
        const formData = new FormData()
        formData.append('participantId', participant.id)
        formData.append('csv', csvFile)

        // Attach image files matched by number (1.jpg -> image_1, 2.png -> image_2)
        for (const img of imageFiles) {
          const numMatch = img.name.match(/^(\d+)\./)
          if (numMatch) {
            formData.append(`image_${numMatch[1]}`, img)
          }
        }

        const wineRes = await fetch(`/api/session/${session.code}/wines/bulk`, {
          method: 'POST',
          body: formData,
        })

        if (!wineRes.ok) {
          const data = await wineRes.json()
          setError(`Kóstoló létrehozva, de a borok feltöltése sikertelen: ${data.error}`)
          router.push(`/session/${session.code}/leader`)
          return
        }
      }

      router.push(`/session/${session.code}/leader`)
    } catch {
      setError('Hálózati hiba, próbáld újra')
    } finally {
      setLoading(false)
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files))
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <img src="/logo-circle.png" alt="BT" className="h-10 w-10 rounded-full" />
            <CardTitle>Kóstoló létrehozása</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {!authenticated ? (
            <form onSubmit={handlePasswordCheck} className="space-y-4">
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
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" className="w-full" size="lg">
                Belépés
              </Button>
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kóstoló adatai</p>

              <div className="space-y-2">
                <label className="text-sm font-medium">Borkóstoló címe</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="pl. Somlói borest"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dátum</label>
                  <Input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Helyszín</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="pl. Budapest"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ügyvezető</label>
                <Input
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="pl. Kiss János"
                  required
                  maxLength={100}
                />
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Borok feltöltése</p>

              <div className="space-y-2">
                <label className="text-sm font-medium">CSV fájl</label>
                <p className="text-xs text-muted-foreground">
                  Oszlopok (pontosvesszővel elválasztva): név; termelő; évjárat; régió; típus (fehér/rosé/vörös)
                </p>
                <input
                  ref={csvRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => csvRef.current?.click()}
                  >
                    {csvFile ? 'Csere' : 'CSV kiválasztása'}
                  </Button>
                  {csvFile && (
                    <span className="text-xs text-muted-foreground truncate">{csvFile.name}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Palack fotók (opcionális)</label>
                <p className="text-xs text-muted-foreground">
                  A fájlokat a kóstolási sorrend szerint nevezd el: 1.jpg, 2.jpg, 3.jpg...
                </p>
                <input
                  ref={imgRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => imgRef.current?.click()}
                  >
                    {imageFiles.length > 0 ? 'Csere' : 'Képek kiválasztása'}
                  </Button>
                  {imageFiles.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {imageFiles.length} kép kiválasztva
                    </span>
                  )}
                </div>
                {imageFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {imageFiles
                      .sort((a, b) => {
                        const na = parseInt(a.name) || 0
                        const nb = parseInt(b.name) || 0
                        return na - nb
                      })
                      .map((f) => (
                        <div key={f.name} className="text-center">
                          <img
                            src={URL.createObjectURL(f)}
                            alt={f.name}
                            className="h-16 w-12 rounded object-cover bg-surface-high"
                          />
                          <p className="text-[10px] text-muted-foreground mt-0.5">{f.name}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || !leaderName.trim()}
            >
              {loading ? 'Létrehozás...' : 'Kóstoló létrehozása'}
            </Button>
          </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
