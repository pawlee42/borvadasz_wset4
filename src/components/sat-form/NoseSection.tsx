'use client'

import type { SATEvaluation } from '@/lib/types/sat'
import { NOSE } from '@/lib/constants/sat-options'
import { OptionSelector } from './OptionSelector'
import { ScaleSlider } from './ScaleSlider'
import { AromaSelector } from './AromaSelector'

interface NoseSectionProps {
  data: SATEvaluation['nose']
  onChange: (update: Partial<SATEvaluation['nose']>) => void
}

export function NoseSection({ data, onChange }: NoseSectionProps) {
  return (
    <>
      <OptionSelector
        label="Állapot"
        options={[...NOSE.condition]}
        value={data.condition}
        onChange={(v) => onChange({ condition: v as 'clean' | 'unclean' })}
      />
      <ScaleSlider
        label="Intenzitás"
        labels={[...NOSE.intensity]}
        value={data.intensity}
        onChange={(v) => onChange({ intensity: v })}
      />
      <AromaSelector
        label="Illatjegyek"
        value={data.aromaCharacteristics}
        onChange={(v) => onChange({ aromaCharacteristics: v })}
      />
      <OptionSelector
        label="Fejlettség"
        options={[...NOSE.development]}
        value={data.development}
        onChange={(v) =>
          onChange({
            development: v as
              | 'youthful'
              | 'developing'
              | 'fully_developed'
              | 'tired',
          })
        }
      />
    </>
  )
}
