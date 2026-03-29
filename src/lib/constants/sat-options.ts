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
  sweetness: ['Száraz', 'Félszáraz', 'Félédes', 'Édes', 'Nagyon édes'],
  acidity: ['Alacsony', 'Közepes(-)', 'Közepes', 'Közepes(+)', 'Magas'],
  tanninLevel: ['Alacsony', 'Közepes(-)', 'Közepes', 'Közepes(+)', 'Magas'],
  tanninNaturePlaceholder: 'pl. érett, lágy, sima, éretlen, zöld, durva, krétaszerű, finomszemcsés...',
  alcohol: ['Alacsony', 'Közepes(-)', 'Közepes', 'Közepes(+)', 'Magas'],
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
  quality: ['Elfogadhatatlan', 'Gyenge', 'Átlagos', 'Nagyon jó', 'Kiváló', 'Rendkívüli'],
  qualityRanges: [
    { min: 50, max: 59, label: 'Elfogadhatatlan' },
    { min: 60, max: 69, label: 'Gyenge' },
    { min: 70, max: 79, label: 'Átlagos' },
    { min: 80, max: 89, label: 'Nagyon jó' },
    { min: 90, max: 95, label: 'Kiváló' },
    { min: 96, max: 100, label: 'Rendkívüli' },
  ],
  readiness: [
    { value: 'too_young', label: 'Túl fiatal' },
    { value: 'can_drink_ageing', label: 'Iható' },
    { value: 'drink_now', label: 'Csúcson' },
    { value: 'too_old', label: 'Hanyatló' },
  ],
  explanationPlaceholder: 'pl. a bor minőségét alátámasztó érvek, egyensúly, összetettség...',
} as const

export const SECTION_LABELS = {
  appearance: 'Szín',
  nose: 'Illat',
  palate: 'Ízvilág',
  conclusions: 'Következtetések',
} as const
