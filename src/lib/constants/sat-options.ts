export const APPEARANCE = {
  clarity: [
    { value: 'clear', label: 'Tiszta' },
    { value: 'hazy', label: 'Zavaros' },
  ],
  intensity: ['Halvány', 'Közepes(-)', 'Közepes', 'Közepes(+)', 'Mély'],
  colourWhite: [
    { value: 'lemon-green', label: 'Citromzöld' },
    { value: 'lemon', label: 'Citrom' },
    { value: 'gold', label: 'Arany' },
    { value: 'amber', label: 'Borostyán' },
    { value: 'brown', label: 'Barna' },
  ],
  colourRose: [
    { value: 'pink', label: 'Rózsaszín' },
    { value: 'pink-orange', label: 'Rózsaszín-narancs' },
    { value: 'orange', label: 'Narancs' },
  ],
  colourRed: [
    { value: 'purple', label: 'Lilás' },
    { value: 'ruby', label: 'Rubinvörös' },
    { value: 'garnet', label: 'Gránát' },
    { value: 'tawny', label: 'Tawny' },
    { value: 'brown', label: 'Barna' },
  ],
  observationsPlaceholder: 'pl. könnycsepp, üledék, buborékok...',
} as const

export const NOSE = {
  condition: [
    { value: 'clean', label: 'Tiszta' },
    { value: 'unclean', label: 'Nem tiszta' },
  ],
  intensity: ['Enyhe', 'Közepes(-)', 'Közepes', 'Közepes(+)', 'Kifejezett'],
  aromaPlaceholder: 'pl. citrusfélék, csonthéjas gyümölcsök, virágillat, fűszeres, tölgyfa, pirítós, méz, bőr...',
  development: [
    { value: 'youthful', label: 'Fiatalos' },
    { value: 'developing', label: 'Fejlődő' },
    { value: 'fully_developed', label: 'Teljesen fejlett' },
    { value: 'tired', label: 'Fáradt' },
  ],
} as const

export const PALATE = {
  sweetness: ['Száraz', 'Félszáraz', 'Közepes-száraz', 'Közepes-édes', 'Édes', 'Nagyon édes'],
  acidity: ['Alacsony', 'Közepes(-)', 'Közepes', 'Közepes(+)', 'Magas'],
  tanninLevel: ['Alacsony', 'Közepes(-)', 'Közepes', 'Közepes(+)', 'Magas'],
  tanninNaturePlaceholder: 'pl. érett, lágy, sima, éretlen, zöld, durva, krétaszerű, finomszemcsés...',
  alcohol: ['Alacsony (<11%)', 'Közepes (11-14%)', 'Magas (>14%)'],
  body: ['Könnyű', 'Közepes(-)', 'Közepes', 'Közepes(+)', 'Testes'],
  flavourIntensity: ['Enyhe', 'Közepes(-)', 'Közepes', 'Közepes(+)', 'Kifejezett'],
  flavourPlaceholder: 'pl. gyümölcsös, fűszeres, vanília, tölgyfa, ásványos...',
  finishLabels: [
    { min: 0, max: 3, label: 'Rövid' },
    { min: 3, max: 5, label: 'Közepes(-)' },
    { min: 5, max: 8, label: 'Közepes' },
    { min: 8, max: 10, label: 'Közepes(+)' },
    { min: 10, max: 15, label: 'Hosszú' },
  ],
  observationsPlaceholder: 'pl. keserűség, krémesség, textúra...',
} as const

export const CONCLUSIONS = {
  quality: ['Hibás', 'Gyenge', 'Elfogadható', 'Jó', 'Nagyon jó', 'Kiváló'],
  readiness: [
    { value: 'too_young', label: 'Túl fiatal' },
    { value: 'can_drink_ageing', label: 'Most idd, de érlelhető' },
    { value: 'drink_now', label: 'Most idd, nem fejlődik tovább' },
    { value: 'too_old', label: 'Túl öreg' },
  ],
  explanationPlaceholder: 'pl. a bor minőségét alátámasztó érvek, egyensúly, összetettség...',
} as const

export const SECTION_LABELS = {
  appearance: 'Megjelenés',
  nose: 'Illat',
  palate: 'Ízlelés',
  conclusions: 'Következtetések',
} as const
