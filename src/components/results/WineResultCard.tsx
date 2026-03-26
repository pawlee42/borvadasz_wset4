'use client'

import type { Wine } from '@/lib/types/database'
import type { SATEvaluation } from '@/lib/types/sat'
import { transformEvaluations } from '@/lib/utils/chart-data'
import DotStripChart from '@/components/results/DotStripChart'
import DistributionBar from '@/components/results/DistributionBar'
import RadarProfile from '@/components/results/RadarProfile'
import FinishChart from '@/components/results/FinishChart'
import QualitySummary from '@/components/results/QualitySummary'
import SizedWordList from '@/components/results/SizedWordList'

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
      {/* Wine header */}
      <div className="mb-4 flex items-start gap-4">
        {wine.image_url ? (
          <img
            src={wine.image_url}
            alt={wine.name}
            className="h-24 w-16 rounded object-cover"
          />
        ) : (
          <div className="flex h-24 w-16 items-center justify-center rounded bg-stone-100 text-2xl text-stone-300">
            🍷
          </div>
        )}
        <div>
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

      {/* Radar + Quality */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <RadarProfile data={data.radar} />
        <QualitySummary data={data.conclusions.quality} />
      </div>

      {/* Megjelenés */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionHeader title="Megjelenés" />
        <DotStripChart data={data.appearance.intensity} />
        <div className="space-y-2">
          <DistributionBar data={data.appearance.clarity} />
          <DistributionBar data={data.appearance.colour} />
        </div>
      </div>

      {/* Illat */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionHeader title="Illat" />
        <DotStripChart data={data.nose.intensity} />
        <div className="space-y-2">
          <DistributionBar data={data.nose.condition} />
          <DistributionBar data={data.nose.development} />
        </div>
        <div className="col-span-full">
          <p className="mb-1 text-xs font-medium text-stone-600">Illatjegyek</p>
          <SizedWordList words={data.nose.aromas} />
        </div>
      </div>

      {/* Ízlelés */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionHeader title="Ízlelés" />
        <DotStripChart data={data.palate.sweetness} />
        <DotStripChart data={data.palate.acidity} />
        {data.palate.tanninLevel && (
          <DotStripChart data={data.palate.tanninLevel} />
        )}
        <DotStripChart data={data.palate.alcohol} />
        <DotStripChart data={data.palate.body} />
        <DotStripChart data={data.palate.flavourIntensity} />
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
    </div>
  )
}
