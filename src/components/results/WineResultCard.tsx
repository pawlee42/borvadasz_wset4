'use client'

import type { Wine } from '@/lib/types/database'
import type { SATEvaluation } from '@/lib/types/sat'
import { transformEvaluations } from '@/lib/utils/chart-data'
import { APPEARANCE, NOSE, CONCLUSIONS } from '@/lib/constants/sat-options'
import CategoryPieChart from '@/components/results/CategoryPieChart'
import StackedBarChart from '@/components/results/StackedBarChart'
import VerticalBarChart from '@/components/results/VerticalBarChart'
import BubbleScale from '@/components/results/BubbleScale'
import GaugeChart from '@/components/results/GaugeChart'
import DistributionBar from '@/components/results/DistributionBar'
import RadarProfile from '@/components/results/RadarProfile'
import FinishChart from '@/components/results/FinishChart'
import QualitySummary from '@/components/results/QualitySummary'
import SizedWordList from '@/components/results/SizedWordList'
import ClimatePanel from '@/components/results/ClimatePanel'

interface WineResultCardProps {
  wine: Wine
  evaluations: SATEvaluation[]
  participantCount: number
  myEvaluation?: SATEvaluation
}

/** Tokenize text the same way as computeWordFrequency to match displayed words */
function extractWords(text: string | undefined): Set<string> {
  if (!text?.trim()) return new Set()
  return new Set(
    text.toLowerCase()
      .split(/[,;.\n]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 1)
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="col-span-full mb-2 mt-4 border-b border-border-visible/15 pb-1 text-sm font-semibold uppercase tracking-wide text-foreground/80">
      {title}
    </h3>
  )
}

export default function WineResultCard({
  wine,
  evaluations,
  participantCount,
  myEvaluation,
}: WineResultCardProps) {
  const data = transformEvaluations(evaluations)

  // Build individual radar data if participant has own evaluation
  const myRadar = myEvaluation ? [
    { dimension: 'Illatintenzitás', value: myEvaluation.nose.intensity, fullMark: 4 },
    { dimension: 'Savasság', value: myEvaluation.palate.acidity, fullMark: 4 },
    ...(myEvaluation.palate.tanninLevel !== null ? [{ dimension: 'Tannin', value: myEvaluation.palate.tanninLevel, fullMark: 4 }] : []),
    { dimension: 'Test', value: myEvaluation.palate.body, fullMark: 4 },
    { dimension: 'Alkohol', value: myEvaluation.palate.alcohol, fullMark: 4 },
    { dimension: 'Ízintenzitás', value: myEvaluation.palate.flavourIntensity, fullMark: 4 },
    { dimension: 'Utóíz', value: Math.min(myEvaluation.palate.finishSeconds / 15 * 4, 4), fullMark: 4 },
  ] : undefined

  if (!data) {
    return (
      <div className="rounded-lg border border-border-visible/15 bg-white p-6">
        <p className="text-muted-foreground">Nincs elegendő értékelés.</p>
      </div>
    )
  }

  return (
    <div
      id={`wine-result-${wine.id}`}
      className="rounded-lg border border-border-visible/15 bg-white p-4 sm:p-6 print:break-inside-avoid print:shadow-none"
    >
      {/* Wine image + Radar side by side */}
      <div className="mb-4 grid grid-cols-2 gap-4 items-start overflow-hidden">
        <div className="flex flex-col items-center min-w-0">
          {wine.image_url ? (
            <img
              src={wine.image_url}
              alt={wine.name}
              className="h-64 w-auto rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-64 w-32 items-center justify-center rounded-lg bg-surface-high text-muted-foreground">
              <svg viewBox="0 0 24 40" fill="currentColor" className="h-24 w-16">
                <path d="M9 0h6v2h-6zM10 2h4v6a6 6 0 0 1 4 5.5v20a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 33.5v-20A6 6 0 0 1 10 8z" />
              </svg>
            </div>
          )}
          <div className="mt-3 text-center">
            <p className="text-xs text-muted-foreground">{wine.producer}</p>
            <h2 className="text-lg font-bold text-foreground">{wine.name}</h2>
            <p className="text-sm text-muted-foreground">
              {wine.vintage && `${wine.vintage} `}
              {wine.region && `- ${wine.region}`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {participantCount} értékelő
            </p>
          </div>
        </div>
        <div className="min-w-0">
          <RadarProfile data={data.radar} myData={myRadar} />
        </div>
      </div>

      {/* Szín */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 [&>*]:min-w-0">
        <SectionHeader title="Szín" />
        <CategoryPieChart data={data.appearance.intensity} myValue={myEvaluation?.appearance.intensity} />
        <div className="space-y-2">
          <DistributionBar data={data.appearance.clarity} myLabel={myEvaluation ? (myEvaluation.appearance.clarity === 'clear' ? 'Tiszta' : 'Zavaros') : undefined} />
          <DistributionBar data={data.appearance.colour} myLabel={myEvaluation ? ([...APPEARANCE.colourWhite, ...APPEARANCE.colourRose, ...APPEARANCE.colourRed].find(c => c.value === myEvaluation.appearance.colour)?.label ?? myEvaluation.appearance.colour) : undefined} />
        </div>
      </div>

      {/* Illat */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 [&>*]:min-w-0">
        <SectionHeader title="Illat" />
        <CategoryPieChart data={data.nose.intensity} myValue={myEvaluation?.nose.intensity} />
        <div className="space-y-2">
          <DistributionBar data={data.nose.condition} myLabel={myEvaluation ? (myEvaluation.nose.condition === 'clean' ? 'Tiszta' : 'Nem tiszta') : undefined} />
          <DistributionBar data={data.nose.development} myLabel={myEvaluation ? (NOSE.development.find(d => d.value === myEvaluation.nose.development)?.label ?? myEvaluation.nose.development) : undefined} />
        </div>
        <div className="col-span-full">
          <p className="mb-1 text-xs font-medium text-foreground/70">Illatjegyek</p>
          <SizedWordList words={data.nose.aromas} myWords={extractWords(myEvaluation?.nose.aromaCharacteristics)} />
        </div>
      </div>

      {/* Ízvilág */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 [&>*]:min-w-0">
        <SectionHeader title="Ízvilág" />
        <StackedBarChart data={data.palate.sweetness} myValue={myEvaluation?.palate.sweetness} />
        <StackedBarChart data={data.palate.acidity} myValue={myEvaluation?.palate.acidity} />
        {data.palate.tanninLevel && (
          <CategoryPieChart data={data.palate.tanninLevel} myValue={myEvaluation?.palate.tanninLevel ?? undefined} />
        )}
        <BubbleScale data={data.palate.alcohol} myValue={myEvaluation?.palate.alcohol} />
        <BubbleScale data={data.palate.body} myValue={myEvaluation?.palate.body} />
        <CategoryPieChart data={data.palate.flavourIntensity} myValue={myEvaluation?.palate.flavourIntensity} />
        <div className="col-span-full">
          <FinishChart data={data.palate.finish} myValue={myEvaluation?.palate.finishSeconds} />
        </div>
        {data.palate.tanninLevel && data.palate.tanninNatureWords.length > 0 && (
          <div className="col-span-full">
            <p className="mb-1 text-xs font-medium text-foreground/70">Tannin jellege</p>
            <SizedWordList words={data.palate.tanninNatureWords} myWords={extractWords(myEvaluation?.palate.tanninNature)} />
          </div>
        )}
        <div className="col-span-full">
          <p className="mb-1 text-xs font-medium text-foreground/70">Ízjegyek</p>
          <SizedWordList words={data.palate.flavourWords} myWords={extractWords(myEvaluation?.palate.flavourCharacteristics)} />
        </div>
      </div>

      {/* Következtetések */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 [&>*]:min-w-0">
        <SectionHeader title="Következtetések" />
        <QualitySummary data={data.conclusions.quality} myValue={myEvaluation?.conclusions.quality} />
        <DistributionBar data={data.conclusions.readiness} myLabel={myEvaluation ? (CONCLUSIONS.readiness.find(r => r.value === myEvaluation.conclusions.readiness)?.label ?? myEvaluation.conclusions.readiness) : undefined} />
        <div className="col-span-full">
          <p className="mb-1 text-xs font-medium text-foreground/70">Indoklás</p>
          <SizedWordList words={data.conclusions.explanations} myWords={extractWords(myEvaluation?.conclusions.explanation)} />
        </div>
      </div>

      {/* Évjárat időjárása */}
      {wine.vintage && wine.region && (
        <div className="grid grid-cols-1 gap-4">
          <SectionHeader title="Évjárat időjárása" />
          <div className="col-span-full">
            <ClimatePanel wine={wine} />
          </div>
        </div>
      )}
    </div>
  )
}
