'use client'

import { Card, CardContent } from '@/components/ui/card'
import { APPEARANCE, NOSE, PALATE, CONCLUSIONS } from '@/lib/constants/sat-options'
import type { SATEvaluation } from '@/lib/types/sat'
import type { Wine } from '@/lib/types/database'

interface EvaluationSummaryProps {
  wine: Wine
  evaluation: SATEvaluation
}

const ALL_COLOURS = [...APPEARANCE.colourWhite, ...APPEARANCE.colourRose, ...APPEARANCE.colourRed]

function colourLabel(value: string): string {
  return ALL_COLOURS.find((c) => c.value === value)?.label ?? value
}

function labelFromArray(arr: readonly string[], index: number): string {
  return arr[index] ?? `${index}`
}

function labelFromOptions(opts: readonly { value: string; label: string }[], value: string): string {
  return opts.find((o) => o.value === value)?.label ?? value
}

function qualityLabel(score: number): string {
  const range = CONCLUSIONS.qualityRanges.find((r) => score >= r.min && score <= r.max)
  return range?.label ?? ''
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}

export function EvaluationSummary({ wine, evaluation }: EvaluationSummaryProps) {
  const e = evaluation

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          {wine.image_url ? (
            <img src={wine.image_url} alt={wine.name} className="h-16 w-11 rounded object-cover flex-shrink-0" />
          ) : (
            <div className="flex h-16 w-11 items-center justify-center rounded bg-surface-high text-muted-foreground flex-shrink-0">
              <svg viewBox="0 0 24 40" fill="currentColor" className="h-8 w-5">
                <path d="M9 0h6v2h-6zM10 2h4v6a6 6 0 0 1 4 5.5v20a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 33.5v-20A6 6 0 0 1 10 8z" />
              </svg>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{wine.producer}</p>
            <p className="font-semibold text-sm">{wine.name}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {wine.vintage && <span>{wine.vintage}</span>}
              {wine.region && (
                <>
                  {wine.vintage && <span>&middot;</span>}
                  <span>{wine.region}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-xs space-y-2 divide-y divide-border-visible/10">
          {/* Szín */}
          <div className="space-y-0.5 pt-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Szín</p>
            <Row label="Tisztaság" value={labelFromOptions(APPEARANCE.clarity, e.appearance.clarity)} />
            <Row label="Intenzitás" value={labelFromArray(APPEARANCE.intensity, e.appearance.intensity)} />
            <Row label="Szín" value={colourLabel(e.appearance.colour)} />
            {e.appearance.observations && <Row label="Megjegyzés" value={e.appearance.observations} />}
          </div>

          {/* Illat */}
          <div className="space-y-0.5 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Illat</p>
            <Row label="Állapot" value={labelFromOptions(NOSE.condition, e.nose.condition)} />
            <Row label="Intenzitás" value={labelFromArray(NOSE.intensity, e.nose.intensity)} />
            <Row label="Fejlettség" value={labelFromOptions(NOSE.development, e.nose.development)} />
            {e.nose.aromaCharacteristics && <Row label="Aromák" value={e.nose.aromaCharacteristics} />}
          </div>

          {/* Ízvilág */}
          <div className="space-y-0.5 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Ízvilág</p>
            <Row label="Édesség" value={labelFromArray(PALATE.sweetness, e.palate.sweetness)} />
            <Row label="Savasság" value={labelFromArray(PALATE.acidity, e.palate.acidity)} />
            {e.palate.tanninLevel !== null && (
              <Row label="Tannin" value={labelFromArray(PALATE.tanninLevel, e.palate.tanninLevel)} />
            )}
            {e.palate.tanninNature && <Row label="Tannin jellege" value={e.palate.tanninNature} />}
            <Row label="Alkohol" value={labelFromArray(PALATE.alcohol, e.palate.alcohol)} />
            <Row label="Test" value={labelFromArray(PALATE.body, e.palate.body)} />
            <Row label="Ízintenzitás" value={labelFromArray(PALATE.flavourIntensity, e.palate.flavourIntensity)} />
            {e.palate.flavourCharacteristics && <Row label="Ízjegyek" value={e.palate.flavourCharacteristics} />}
            <Row label="Utóíz" value={`${e.palate.finishSeconds} mp`} />
            {e.palate.observations && <Row label="Megjegyzés" value={e.palate.observations} />}
          </div>

          {/* Következtetések */}
          <div className="space-y-0.5 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Következtetések</p>
            <Row label="Minőség" value={`${e.conclusions.quality}/100 — ${qualityLabel(e.conclusions.quality)}`} />
            <Row label="Érettség" value={labelFromOptions(CONCLUSIONS.readiness, e.conclusions.readiness)} />
            {e.conclusions.explanation && <Row label="Indoklás" value={e.conclusions.explanation} />}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
