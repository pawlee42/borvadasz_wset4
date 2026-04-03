'use client'

import type { SATEvaluation } from '@/lib/types/sat'
import { CONCLUSIONS } from '@/lib/constants/sat-options'
import { OptionSelector } from './OptionSelector'
import { HintedTextArea } from './HintedTextArea'
import { cn } from '@/lib/utils/cn'

interface ConclusionsSectionProps {
  data: SATEvaluation['conclusions']
  onChange: (update: Partial<SATEvaluation['conclusions']>) => void
}

function getQualityLabel(points: number): string {
  const range = CONCLUSIONS.qualityRanges.find(
    (r) => points >= r.min && points <= r.max
  )
  return range?.label ?? ''
}

export function ConclusionsSection({
  data,
  onChange,
}: ConclusionsSectionProps) {
  const qualityLabel = getQualityLabel(data.quality)

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Minőség</label>
        <div className="text-center">
          <span className="text-2xl font-bold text-primary">{data.quality}</span>
          <span className="text-sm text-muted-foreground ml-1">/ 100</span>
          <span className="ml-2 text-sm font-medium text-foreground">{qualityLabel}</span>
        </div>
        <div className="flex justify-between px-1">
          {CONCLUSIONS.qualityRanges.map((r) => (
            <span
              key={r.label}
              className={cn(
                'text-[10px] leading-tight text-center',
                data.quality >= r.min && data.quality <= r.max
                  ? 'text-primary font-bold'
                  : 'text-muted'
              )}
            >
              {r.label}
            </span>
          ))}
        </div>
        <input
          type="range"
          min={50}
          max={100}
          step={1}
          value={data.quality}
          onChange={(e) => onChange({ quality: Number(e.target.value) })}
          className="w-full min-h-[44px]"
        />
      </div>
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
