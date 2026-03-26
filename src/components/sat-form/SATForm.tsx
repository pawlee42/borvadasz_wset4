'use client'

import { useState } from 'react'
import { createEmptyEvaluation, type WineType, type SATEvaluation } from '@/lib/types/sat'
import { SECTION_LABELS } from '@/lib/constants/sat-options'
import { AppearanceSection } from './AppearanceSection'
import { NoseSection } from './NoseSection'
import { PalateSection } from './PalateSection'
import { ConclusionsSection } from './ConclusionsSection'
import { Button } from '@/components/ui/button'

interface SATFormProps {
  wineType: WineType
  onSubmit: (data: SATEvaluation) => void
  disabled?: boolean
}

export function SATForm({ wineType, onSubmit, disabled }: SATFormProps) {
  const [data, setData] = useState<SATEvaluation>(() =>
    createEmptyEvaluation(wineType)
  )

  function updateAppearance(update: Partial<SATEvaluation['appearance']>) {
    setData((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, ...update },
    }))
  }

  function updateNose(update: Partial<SATEvaluation['nose']>) {
    setData((prev) => ({
      ...prev,
      nose: { ...prev.nose, ...update },
    }))
  }

  function updatePalate(update: Partial<SATEvaluation['palate']>) {
    setData((prev) => ({
      ...prev,
      palate: { ...prev.palate, ...update },
    }))
  }

  function updateConclusions(update: Partial<SATEvaluation['conclusions']>) {
    setData((prev) => ({
      ...prev,
      conclusions: { ...prev.conclusions, ...update },
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 pb-20">
      <details open>
        <summary className="cursor-pointer select-none rounded-lg bg-card p-3 font-semibold text-sm border border-border">
          {SECTION_LABELS.appearance}
        </summary>
        <div className="p-4 space-y-4">
          <AppearanceSection
            data={data.appearance}
            onChange={updateAppearance}
            wineType={wineType}
          />
        </div>
      </details>

      <details>
        <summary className="cursor-pointer select-none rounded-lg bg-card p-3 font-semibold text-sm border border-border">
          {SECTION_LABELS.nose}
        </summary>
        <div className="p-4 space-y-4">
          <NoseSection data={data.nose} onChange={updateNose} />
        </div>
      </details>

      <details>
        <summary className="cursor-pointer select-none rounded-lg bg-card p-3 font-semibold text-sm border border-border">
          {SECTION_LABELS.palate}
        </summary>
        <div className="p-4 space-y-4">
          <PalateSection
            data={data.palate}
            onChange={updatePalate}
            wineType={wineType}
          />
        </div>
      </details>

      <details>
        <summary className="cursor-pointer select-none rounded-lg bg-card p-3 font-semibold text-sm border border-border">
          {SECTION_LABELS.conclusions}
        </summary>
        <div className="p-4 space-y-4">
          <ConclusionsSection
            data={data.conclusions}
            onChange={updateConclusions}
          />
        </div>
      </details>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border">
        <div className="max-w-3xl mx-auto">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={disabled}
          >
            Értékelés beküldése
          </Button>
        </div>
      </div>
    </form>
  )
}
