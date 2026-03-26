'use client'

import type { SATEvaluation } from '@/lib/types/sat'
import { CONCLUSIONS } from '@/lib/constants/sat-options'
import { ScaleSlider } from './ScaleSlider'
import { OptionSelector } from './OptionSelector'
import { HintedTextArea } from './HintedTextArea'

interface ConclusionsSectionProps {
  data: SATEvaluation['conclusions']
  onChange: (update: Partial<SATEvaluation['conclusions']>) => void
}

export function ConclusionsSection({
  data,
  onChange,
}: ConclusionsSectionProps) {
  return (
    <>
      <ScaleSlider
        label="Minőség"
        labels={[...CONCLUSIONS.quality]}
        value={data.quality}
        onChange={(v) => onChange({ quality: v })}
      />
      <OptionSelector
        label="Érettség"
        options={[...CONCLUSIONS.readiness]}
        value={data.readiness}
        onChange={(v) =>
          onChange({
            readiness: v as
              | 'too_young'
              | 'can_drink_ageing'
              | 'drink_now'
              | 'too_old',
          })
        }
      />
      <HintedTextArea
        label="Indoklás"
        placeholder={CONCLUSIONS.explanationPlaceholder}
        value={data.explanation}
        onChange={(v) => onChange({ explanation: v })}
      />
    </>
  )
}
