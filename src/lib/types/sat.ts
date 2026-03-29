export type WineType = 'white' | 'rosé' | 'red'

export interface SATEvaluation {
  appearance: {
    clarity: 'clear' | 'hazy'
    intensity: number // 0-4
    colour: string
    observations: string
  }
  nose: {
    condition: 'clean' | 'unclean'
    intensity: number // 0-4
    aromaCharacteristics: string
    development: 'youthful' | 'developing' | 'fully_developed' | 'tired'
  }
  palate: {
    sweetness: number // 0-4
    acidity: number // 0-4
    tanninLevel: number | null // 0-4, null for white/rosé
    tanninNature: string | null
    alcohol: number // 0-4
    body: number // 0-4
    flavourIntensity: number // 0-4
    flavourCharacteristics: string
    finishSeconds: number // 0-15
    observations: string
  }
  conclusions: {
    quality: number // 50-100
    readiness: 'too_young' | 'can_drink_ageing' | 'drink_now' | 'too_old'
    explanation: string
  }
}

export function createEmptyEvaluation(wineType: WineType): SATEvaluation {
  return {
    appearance: {
      clarity: 'clear',
      intensity: 2,
      colour: wineType === 'red' ? 'ruby' : wineType === 'rosé' ? 'pink' : 'lemon',
      observations: '',
    },
    nose: {
      condition: 'clean',
      intensity: 2,
      aromaCharacteristics: '',
      development: 'youthful',
    },
    palate: {
      sweetness: 0,
      acidity: 2,
      tanninLevel: wineType === 'red' ? 2 : null,
      tanninNature: wineType === 'red' ? '' : null,
      alcohol: 2,
      body: 2,
      flavourIntensity: 2,
      flavourCharacteristics: '',
      finishSeconds: 5,
      observations: '',
    },
    conclusions: {
      quality: 75,
      readiness: 'drink_now',
      explanation: '',
    },
  }
}
