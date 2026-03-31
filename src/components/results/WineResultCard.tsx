'use client'

import type { Wine } from '@/lib/types/database'
import type { SATEvaluation } from '@/lib/types/sat'
import { transformEvaluations } from '@/lib/utils/chart-data'
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
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="col-span-full mb-2 mt-4 border-b border-stone-200 pb-1 text-sm font-semibold uppercase tracking-wide text-stone-700">
      {title}
    </h3>
  )
}

export default function WineResultCard({
  wine,
  evaluations,
  participantCount,
}: WineResultCardProps) {
  const data = transformEvaluations(evaluations)

  if (!data) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-6">
        <p className="text-stone-400">Nincs elegendő értékelés.</p>
      </div>
    )
  }

  return (
    <div
      id={`wine-result-${wine.id}`}
      className="rounded-lg border border-stone-200 bg-white p-4 sm:p-6 print:break-inside-avoid print:shadow-none"
    >
      {/* Wine image + Radar side by side */}
      <div className="mb-4 grid grid-cols-2 gap-4 items-start">
        <div className="flex flex-col items-center">
          {wine.image_url ? (
            <img
              src={wine.image_url}
              alt={wine.name}
              className="h-64 w-auto rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-64 w-32 items-center justify-center rounded-lg bg-stone-100 text-stone-300">
              <svg viewBox="0 0 24 40" fill="currentColor" className="h-24 w-16">
                <path d="M9 0h6v2h-6zM10 2h4v6a6 6 0 0 1 4 5.5v20a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 33.5v-20A6 6 0 0 1 10 8z" />
              </svg>
            </div>
          )}
          <div className="mt-3 text-center">
            <p className="text-xs text-stone-400">{wine.producer}</p>
            <h2 className="text-lg font-bold text-stone-800">{wine.name}</h2>
            <p className="text-sm text-stone-500">
              {wine.vintage && `${wine.vintage} `}
              {wine.region && `- ${wine.region}`}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              {participantCount} értékelő
            </p>
          </div>
        </div>
        <RadarProfile data={data.radar} />
      </div>

      {/* Szín */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionHeader title="Szín" />
        <CategoryPieChart data={data.appearance.intensity} />
        <div className="space-y-2">
          <DistributionBar data={data.appearance.clarity} />
          <DistributionBar data={data.appearance.colour} />
        </div>
      </div>

      {/* Illat */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionHeader title="Illat" />
        <CategoryPieChart data={data.nose.intensity} />
        <div className="space-y-2">
          <DistributionBar data={data.nose.condition} />
          <DistributionBar data={data.nose.development} />
        </div>
        <div className="col-span-full">
          <p className="mb-1 text-xs font-medium text-stone-600">Illatjegyek</p>
          <SizedWordList words={data.nose.aromas} />
        </div>
      </div>

      {/* Ízvilág */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionHeader title="Ízvilág" />
        <StackedBarChart data={data.palate.sweetness} />
        <StackedBarChart data={data.palate.acidity} />
        {data.palate.tanninLevel && (
          <CategoryPieChart data={data.palate.tanninLevel} />
        )}
        <BubbleScale data={data.palate.alcohol} />
        <BubbleScale data={data.palate.body} />
        <CategoryPieChart data={data.palate.flavourIntensity} />
        <div className="col-span-full">
          <FinishChart data={data.palate.finish} />
        </div>
        {data.palate.tanninLevel && data.palate.tanninNatureWords.length > 0 && (
          <div className="col-span-full">
            <p className="mb-1 text-xs font-medium text-stone-600">Tannin jellege</p>
            <SizedWordList words={data.palate.tanninNatureWords} />
          </div>
        )}
        <div className="col-span-full">
          <p className="mb-1 text-xs font-medium text-stone-600">Ízjegyek</p>
          <SizedWordList words={data.palate.flavourWords} />
        </div>
      </div>

      {/* Következtetések */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionHeader title="Következtetések" />
        <QualitySummary data={data.conclusions.quality} />
        <DistributionBar data={data.conclusions.readiness} />
        <div className="col-span-full">
          <p className="mb-1 text-xs font-medium text-stone-600">Indoklás</p>
          <SizedWordList words={data.conclusions.explanations} />
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
