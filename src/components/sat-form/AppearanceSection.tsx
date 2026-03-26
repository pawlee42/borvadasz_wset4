'use client'

import type { SATEvaluation } from '@/lib/types/sat'
import type { WineType } from '@/lib/types/sat'
import { APPEARANCE } from '@/lib/constants/sat-options'
import { OptionSelector } from './OptionSelector'
import { ScaleSlider } from './ScaleSlider'
import { HintedTextArea } from './HintedTextArea'

interface AppearanceSectionProps {
  data: SATEvaluation['appearance']
  onChange: (update: Partial<SATEvaluation['appearance']>) => void
  wineType: WineType
}

function getColourOptions(wineType: WineType) {
  switch (wineType) {
    case 'white':
      return [...APPEARANCE.colourWhite]
    case 'rosé':
      return [...APPEARANCE.colourRose]
    case 'red':
      return [...APPEARANCE.colourRed]
  }
}

export function AppearanceSection({
  data,
  onChange,
  wineType,
}: AppearanceSectionProps) {
  return (
    <>
      <OptionSelector
        label="Tisztaság"
        options={[...APPEARANCE.clarity]}
        value={data.clarity}
        onChange={(v) => onChange({ clarity: v as 'clear' | 'hazy' })}
      />
      <ScaleSlider
        label="Intenzitás"
        labels={[...APPEARANCE.intensity]}
        value={data.intensity}
        onChange={(v) => onChange({ intensity: v })}
      />
      <OptionSelector
        label="Szín"
        options={getColourOptions(wineType)}
        value={data.colour}
        onChange={(v) => onChange({ colour: v })}
      />
      <HintedTextArea
        label="Megjegyzések"
        placeholder={APPEARANCE.observationsPlaceholder}
        value={data.observations}
        onChange={(v) => onChange({ observations: v })}
      />
    </>
  )
}
