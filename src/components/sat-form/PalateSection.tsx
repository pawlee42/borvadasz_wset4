'use client'

import type { SATEvaluation } from '@/lib/types/sat'
import type { WineType } from '@/lib/types/sat'
import { PALATE } from '@/lib/constants/sat-options'
import { ScaleSlider } from './ScaleSlider'
import { HintedTextArea } from './HintedTextArea'
import { AromaSelector } from './AromaSelector'
import { FinishSlider } from './FinishSlider'

interface PalateSectionProps {
  data: SATEvaluation['palate']
  onChange: (update: Partial<SATEvaluation['palate']>) => void
  wineType: WineType
}

export function PalateSection({
  data,
  onChange,
  wineType,
}: PalateSectionProps) {
  return (
    <>
      <ScaleSlider
        label="Édesség"
        labels={[...PALATE.sweetness]}
        value={data.sweetness}
        onChange={(v) => onChange({ sweetness: v })}
      />
      <ScaleSlider
        label="Savasság"
        labels={[...PALATE.acidity]}
        value={data.acidity}
        onChange={(v) => onChange({ acidity: v })}
      />
      {wineType === 'red' && (
        <>
          <ScaleSlider
            label="Tannin szint"
            labels={[...PALATE.tanninLevel]}
            value={data.tanninLevel ?? 2}
            onChange={(v) => onChange({ tanninLevel: v })}
          />
          <HintedTextArea
            label="Tannin jellege"
            placeholder={PALATE.tanninNaturePlaceholder}
            value={data.tanninNature ?? ''}
            onChange={(v) => onChange({ tanninNature: v })}
          />
        </>
      )}
      <ScaleSlider
        label="Alkohol"
        labels={[...PALATE.alcohol]}
        value={data.alcohol}
        onChange={(v) => onChange({ alcohol: v })}
      />
      <ScaleSlider
        label="Test"
        labels={[...PALATE.body]}
        value={data.body}
        onChange={(v) => onChange({ body: v })}
      />
      <ScaleSlider
        label="Ízintenzitás"
        labels={[...PALATE.flavourIntensity]}
        value={data.flavourIntensity}
        onChange={(v) => onChange({ flavourIntensity: v })}
      />
      <AromaSelector
        label="Ízjegyek"
        value={data.flavourCharacteristics}
        onChange={(v) => onChange({ flavourCharacteristics: v })}
      />
      <FinishSlider
        value={data.finishSeconds}
        onChange={(v) => onChange({ finishSeconds: v })}
      />
      <HintedTextArea
        label="Megjegyzések"
        placeholder={PALATE.observationsPlaceholder}
        value={data.observations}
        onChange={(v) => onChange({ observations: v })}
      />
    </>
  )
}
