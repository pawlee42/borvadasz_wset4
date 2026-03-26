'use client'

import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { OptionSelector } from '@/components/sat-form/OptionSelector'
import type { WineType } from '@/lib/types/sat'

interface WineFormData {
  producer: string
  name: string
  vintage: number | null
  region: string
  wine_type: WineType
  image_url: string | null
}

interface WineFormProps {
  onSubmit: (data: WineFormData) => void
  initialData?: Partial<WineFormData>
}

const WINE_TYPE_OPTIONS = [
  { value: 'white', label: 'Fehér' },
  { value: 'rosé', label: 'Rosé' },
  { value: 'red', label: 'Vörös' },
]

export function WineForm({ onSubmit, initialData }: WineFormProps) {
  const [producer, setProducer] = useState(initialData?.producer ?? '')
  const [name, setName] = useState(initialData?.name ?? '')
  const [vintage, setVintage] = useState<string>(
    initialData?.vintage?.toString() ?? ''
  )
  const [region, setRegion] = useState(initialData?.region ?? '')
  const [wineType, setWineType] = useState<WineType>(
    initialData?.wine_type ?? 'red'
  )
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.image_url ?? null
  )
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const isEditing = !!(initialData?.name)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const { url } = await res.json()
        setImageUrl(url)
      }
    } finally {
      setUploading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      producer,
      name,
      vintage: vintage ? parseInt(vintage, 10) : null,
      region,
      wine_type: wineType,
      image_url: imageUrl,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Termelő</label>
        <Input
          value={producer}
          onChange={(e) => setProducer(e.target.value)}
          placeholder="pl. Bott Frigyes"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Bor neve</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="pl. Juhfark"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Évjárat</label>
          <Input
            type="number"
            value={vintage}
            onChange={(e) => setVintage(e.target.value)}
            placeholder="pl. 2021"
            min={1900}
            max={2099}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Régió</label>
          <Input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="pl. Somló"
          />
        </div>
      </div>
      <OptionSelector
        label="Bor típusa"
        options={WINE_TYPE_OPTIONS}
        value={wineType}
        onChange={(v) => setWineType(v as WineType)}
      />
      <div className="space-y-2">
        <label className="text-sm font-medium">Fotó (opcionális)</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          className="hidden"
        />
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Bor fotó"
              className="h-16 w-12 rounded object-cover border border-border"
            />
          ) : (
            <div className="flex h-16 w-12 items-center justify-center rounded bg-secondary text-lg text-muted">
              🍷
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? 'Feltöltés...' : imageUrl ? 'Csere' : 'Kép feltöltése'}
          </Button>
          {imageUrl && (
            <button
              type="button"
              onClick={() => setImageUrl(null)}
              className="text-xs text-muted hover:text-destructive"
            >
              Törlés
            </button>
          )}
        </div>
      </div>
      <Button type="submit" className="w-full">
        {isEditing ? 'Mentés' : 'Bor hozzáadása'}
      </Button>
    </form>
  )
}
