import type { SATEvaluation } from '@/lib/types/sat'
import { computeWordFrequency, type WordFrequency } from './word-frequency'
import { PALATE, CONCLUSIONS, APPEARANCE, NOSE } from '@/lib/constants/sat-options'

export interface DotStripData {
  label: string
  labels: string[]
  values: number[]
  median: number
  mean: number
  domain?: [number, number]
}

export interface DistributionData {
  label: string
  counts: { name: string; count: number }[]
}

export interface FinishData {
  values: number[]
  mean: number
  median: number
  categoryLabel: string
}

export interface RadarData {
  dimension: string
  value: number
  fullMark: number
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function countValues(values: string[]): { name: string; count: number }[] {
  const map = new Map<string, number>()
  for (const v of values) {
    map.set(v, (map.get(v) || 0) + 1)
  }
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }))
}

function getFinishCategory(seconds: number): string {
  const cat = PALATE.finishLabels.find((l) => seconds >= l.min && seconds < l.max)
  return cat?.label ?? 'Hosszú'
}

export function buildDotStrip(label: string, labels: string[], values: number[]): DotStripData {
  return { label, labels, values, median: median(values), mean: mean(values) }
}

export function transformEvaluations(evals: SATEvaluation[]) {
  if (evals.length === 0) return null

  // Appearance
  const appearanceIntensity = buildDotStrip(
    'Színintenzitás',
    APPEARANCE.intensity as unknown as string[],
    evals.map((e) => e.appearance.intensity)
  )
  const clarityDist: DistributionData = {
    label: 'Tisztaság',
    counts: countValues(evals.map((e) => e.appearance.clarity === 'clear' ? 'Tiszta' : 'Zavaros')),
  }
  const allColours = [...APPEARANCE.colourWhite, ...APPEARANCE.colourRose, ...APPEARANCE.colourRed]
  const colourDist: DistributionData = {
    label: 'Szín',
    counts: countValues(evals.map((e) => {
      const opt = allColours.find((c) => c.value === e.appearance.colour)
      return opt?.label ?? e.appearance.colour
    })),
  }

  // Nose
  const noseIntensity = buildDotStrip(
    'Illatintenzitás',
    NOSE.intensity as unknown as string[],
    evals.map((e) => e.nose.intensity)
  )
  const conditionDist: DistributionData = {
    label: 'Állapot',
    counts: countValues(evals.map((e) => e.nose.condition === 'clean' ? 'Tiszta' : 'Nem tiszta')),
  }
  const developmentDist: DistributionData = {
    label: 'Fejlettség',
    counts: countValues(evals.map((e) => {
      const opt = NOSE.development.find((d) => d.value === e.nose.development)
      return opt?.label ?? e.nose.development
    })),
  }
  const aromaWords: WordFrequency[] = computeWordFrequency(evals.map((e) => e.nose.aromaCharacteristics))

  // Palate
  const sweetness = buildDotStrip('Édesség', PALATE.sweetness as unknown as string[], evals.map((e) => e.palate.sweetness))
  const acidity = buildDotStrip('Savasság', PALATE.acidity as unknown as string[], evals.map((e) => e.palate.acidity))
  const alcohol = buildDotStrip('Alkohol', PALATE.alcohol as unknown as string[], evals.map((e) => e.palate.alcohol))
  const body = buildDotStrip('Test', PALATE.body as unknown as string[], evals.map((e) => e.palate.body))
  const flavourIntensity = buildDotStrip('Ízintenzitás', PALATE.flavourIntensity as unknown as string[], evals.map((e) => e.palate.flavourIntensity))

  const tanninValues = evals.map((e) => e.palate.tanninLevel).filter((v): v is number => v !== null)
  const tanninLevel = tanninValues.length > 0
    ? buildDotStrip('Tannin', PALATE.tanninLevel as unknown as string[], tanninValues)
    : null

  const tanninNatureWords: WordFrequency[] = computeWordFrequency(
    evals.map((e) => e.palate.tanninNature).filter((v): v is string => v !== null)
  )
  const flavourWords: WordFrequency[] = computeWordFrequency(evals.map((e) => e.palate.flavourCharacteristics))

  const finishValues = evals.map((e) => e.palate.finishSeconds)
  const finish: FinishData = {
    values: finishValues,
    mean: mean(finishValues),
    median: median(finishValues),
    categoryLabel: getFinishCategory(mean(finishValues)),
  }

  // Conclusions
  const qualityValues = evals.map((e) => e.conclusions.quality)
  const quality: DotStripData = {
    label: 'Minőség',
    labels: CONCLUSIONS.qualityRanges.map((r) => r.label),
    values: qualityValues,
    median: median(qualityValues),
    mean: mean(qualityValues),
    domain: [50, 100],
  }
  const readinessDist: DistributionData = {
    label: 'Érettség',
    counts: countValues(evals.map((e) => {
      const opt = CONCLUSIONS.readiness.find((r) => r.value === e.conclusions.readiness)
      return opt?.label ?? e.conclusions.readiness
    })),
  }
  const explanationWords: WordFrequency[] = computeWordFrequency(evals.map((e) => e.conclusions.explanation))

  // Radar chart: median values normalized to 0-1
  const radar: RadarData[] = [
    { dimension: 'Illatintenzitás', value: median(evals.map((e) => e.nose.intensity)), fullMark: 4 },
    { dimension: 'Savasság', value: median(evals.map((e) => e.palate.acidity)), fullMark: 4 },
    { dimension: 'Test', value: median(evals.map((e) => e.palate.body)), fullMark: 4 },
    { dimension: 'Alkohol', value: median(evals.map((e) => e.palate.alcohol)), fullMark: 4 },
    { dimension: 'Ízintenzitás', value: median(evals.map((e) => e.palate.flavourIntensity)), fullMark: 4 },
    { dimension: 'Utóíz', value: Math.min(median(finishValues) / 15 * 4, 4), fullMark: 4 },
  ]

  if (tanninLevel) {
    radar.splice(2, 0, { dimension: 'Tannin', value: median(tanninValues), fullMark: 4 })
  }

  return {
    appearance: { intensity: appearanceIntensity, clarity: clarityDist, colour: colourDist },
    nose: { intensity: noseIntensity, condition: conditionDist, development: developmentDist, aromas: aromaWords },
    palate: { sweetness, acidity, tanninLevel, tanninNatureWords, alcohol, body, flavourIntensity, flavourWords, finish },
    conclusions: { quality, readiness: readinessDist, explanations: explanationWords },
    radar,
    participantCount: evals.length,
  }
}
