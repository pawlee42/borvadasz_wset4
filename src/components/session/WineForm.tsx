'use client'

import { useState } from 'react'
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

  const isEditing = !!(initialData?.name)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      producer,
      name,
      vintage: vintage ? parseInt(vintage, 10) : null,
      region,
      wine_type: wineType,
      image_url: initialData?.image_url ?? null,
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
      <Button type="submit" className="w-full">
        {isEditing ? 'Mentés' : 'Bor hozzáadása'}
      </Button>
    </form>
  )
}
