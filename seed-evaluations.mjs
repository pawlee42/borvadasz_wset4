import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Parse .env manually
const envContent = readFileSync('.env', 'utf-8')
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SESSION_CODE = 'CMDGBB'

const PARTICIPANTS = [
  'Nagy Péter',
  'Szabó Eszter',
  'Tóth Balázs',
  'Horváth Réka',
  'Kiss Dániel',
  'Varga Miklós',
  'Molnár Kata',
  'Fehér Gábor',
  'Balogh Zsófia',
  'Papp Tamás',
  'Lakatos Nóra',
  'Szilágyi Bence',
  'Farkas Virág',
]

const COLOURS_WHITE = ['lemon-green', 'lemon', 'gold', 'amber']
const DEVELOPMENTS = ['youthful', 'developing', 'fully_developed']
const READINESS = ['too_young', 'can_drink_ageing', 'drink_now']

const AROMA_POOL = [
  'citrus', 'grapefruit', 'lime', 'zöld alma', 'őszibarack', 'nektarin',
  'maracuja', 'mangó', 'fehér virág', 'bodza', 'bodzavirág', 'akácvirág',
  'frissen vágott fű', 'zöld paprika', 'csalán', 'kovakő', 'ásványos',
  'füstös', 'tűzkő', 'citromhéj', 'fehér cseresznye', 'körtés',
  'sárgadinnye', 'csillaggyümölcs', 'menta', 'zsálya',
]

const FLAVOUR_POOL = [
  'citrus', 'grapefruit', 'lime', 'zöld alma', 'őszibarack',
  'maracuja', 'trópusi', 'ásványos', 'kovakő', 'sós', 'krétás',
  'fehér bors', 'zöld paprika', 'friss fű', 'gyömbér', 'citromhéj',
  'nektarin', 'sárgabarack', 'méz', 'mandula', 'fehér virág',
]

const EXPLANATION_POOL = [
  'Jó egyensúly a savasság és a gyümölcsösség között.',
  'Összetett illatvilág, ásványos utóíz.',
  'Elegáns, kifinomult, tipikus sauvignon karakter.',
  'Friss és élénk, könnyen iható stílus.',
  'Erős gyümölcsösség, de hiányzik a komplexitás.',
  'Nagyon jó savstruktúra, hosszú utóíz.',
  'Kiegyensúlyozott, szép ásványosság.',
  'Aromás, de kissé egyszerű.',
  'Kiváló koncentráció és mélység.',
  'Tipikus terroir karakter, jó érettség.',
  'Finom textúra, elegáns lezárás.',
  'Gyümölcsös és virágos, kellemes bor.',
]

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const WINE_PROFILES = [
  // 1. Sancerre - classic Loire SB, mineral, crisp
  { intensityBase: 1, colourBase: 'lemon-green', noseBase: 2, acidBase: 3, bodyBase: 1, alcBase: 1, sweetBase: 0, flavourBase: 2, finishBase: 6, qualityBase: 82, dev: 'youthful', ready: 'drink_now' },
  // 2. Tement Ried Grassnitzberg - Austrian, rich, structured
  { intensityBase: 2, colourBase: 'lemon', noseBase: 3, acidBase: 3, bodyBase: 2, alcBase: 2, sweetBase: 0, flavourBase: 3, finishBase: 9, qualityBase: 88, dev: 'developing', ready: 'can_drink_ageing' },
  // 3. Terlan Winkl - Alto Adige, elegant, aromatic
  { intensityBase: 2, colourBase: 'lemon', noseBase: 3, acidBase: 2, bodyBase: 2, alcBase: 2, sweetBase: 0, flavourBase: 3, finishBase: 8, qualityBase: 85, dev: 'youthful', ready: 'drink_now' },
  // 4. Butussi - Friuli, light, fresh
  { intensityBase: 1, colourBase: 'lemon-green', noseBase: 2, acidBase: 2, bodyBase: 1, alcBase: 1, sweetBase: 0, flavourBase: 2, finishBase: 5, qualityBase: 74, dev: 'youthful', ready: 'drink_now' },
  // 5. Cambil Bay - Spanish, warm climate
  { intensityBase: 2, colourBase: 'lemon', noseBase: 2, acidBase: 1, bodyBase: 2, alcBase: 2, sweetBase: 0, flavourBase: 2, finishBase: 5, qualityBase: 70, dev: 'youthful', ready: 'drink_now' },
  // 6. Bodega Los Helechos - Argentina, Valle de Uco, mature
  { intensityBase: 3, colourBase: 'gold', noseBase: 2, acidBase: 2, bodyBase: 3, alcBase: 3, sweetBase: 0, flavourBase: 2, finishBase: 7, qualityBase: 76, dev: 'developing', ready: 'can_drink_ageing' },
  // 7. Cape South - South African, tropical
  { intensityBase: 2, colourBase: 'lemon', noseBase: 3, acidBase: 2, bodyBase: 2, alcBase: 2, sweetBase: 0, flavourBase: 3, finishBase: 7, qualityBase: 80, dev: 'youthful', ready: 'drink_now' },
  // 8. Nautilus Marlborough - NZ classic, intense
  { intensityBase: 2, colourBase: 'lemon-green', noseBase: 4, acidBase: 3, bodyBase: 2, alcBase: 2, sweetBase: 0, flavourBase: 4, finishBase: 8, qualityBase: 86, dev: 'youthful', ready: 'drink_now' },
]

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

function vary(base, range, min, max) {
  const offset = rand(-range, range)
  return clamp(base + offset, min, max)
}

function generateEvaluation(wineIndex) {
  const profile = WINE_PROFILES[wineIndex]

  const intensity = vary(profile.intensityBase, 1, 0, 4)
  const colourIdx = clamp(COLOURS_WHITE.indexOf(profile.colourBase) + rand(-1, 1), 0, COLOURS_WHITE.length - 1)

  const noseIntensity = vary(profile.noseBase, 1, 0, 4)
  const devIdx = clamp(DEVELOPMENTS.indexOf(profile.dev) + rand(-1, 0), 0, DEVELOPMENTS.length - 1)

  const aromas = pick(AROMA_POOL, rand(3, 6)).join(', ')
  const flavours = pick(FLAVOUR_POOL, rand(3, 6)).join(', ')

  const acidity = vary(profile.acidBase, 1, 0, 4)
  const body = vary(profile.bodyBase, 1, 0, 4)
  const alcohol = vary(profile.alcBase, 1, 0, 4)
  const sweetness = vary(profile.sweetBase, 0, 0, 1)
  const flavourIntensity = vary(profile.flavourBase, 1, 0, 4)
  const finishSeconds = vary(profile.finishBase, 3, 1, 15)
  const quality = vary(profile.qualityBase, 8, 50, 100)

  const readyIdx = clamp(READINESS.indexOf(profile.ready) + rand(-1, 1), 0, READINESS.length - 1)

  return {
    appearance: {
      clarity: Math.random() > 0.1 ? 'clear' : 'hazy',
      intensity,
      colour: COLOURS_WHITE[colourIdx],
      observations: Math.random() > 0.6 ? pickOne(['könnycsepp', 'fényes', 'szép könnycsepp', 'ragyogó', 'kristálytiszta']) : '',
    },
    nose: {
      condition: Math.random() > 0.05 ? 'clean' : 'unclean',
      intensity: noseIntensity,
      aromaCharacteristics: aromas,
      development: DEVELOPMENTS[devIdx],
    },
    palate: {
      sweetness,
      acidity,
      tanninLevel: null,
      tanninNature: null,
      alcohol,
      body,
      flavourIntensity,
      flavourCharacteristics: flavours,
      finishSeconds,
      observations: Math.random() > 0.5 ? pickOne(['szép savstruktúra', 'krémesség', 'ásványos textúra', 'friss lezárás', 'kesernyés utóíz']) : '',
    },
    conclusions: {
      quality,
      readiness: READINESS[readyIdx],
      explanation: pickOne(EXPLANATION_POOL),
    },
  }
}

// --- MAIN ---
const action = process.argv[2] || 'setup'

async function getSession() {
  const { data } = await supabase.from('sessions').select('*').eq('code', SESSION_CODE).single()
  if (!data) { console.error('Session not found!'); process.exit(1) }
  return data
}

async function getWines(sessionId) {
  const { data } = await supabase.from('wines').select('*').eq('session_id', sessionId).order('sort_order')
  return data
}

async function ensureParticipants(sessionId) {
  const ids = []
  for (const name of PARTICIPANTS) {
    const { data: existing } = await supabase
      .from('participants').select('id').eq('session_id', sessionId).eq('name', name).single()
    if (existing) {
      ids.push(existing.id)
    } else {
      const { data: p } = await supabase
        .from('participants').insert({ session_id: sessionId, name, is_leader: false }).select().single()
      ids.push(p.id)
      console.log(`  Létrehozva: ${name}`)
    }
  }
  return ids
}

// Setup: clean slate, create participants, reset all wines
if (action === 'setup') {
  const session = await getSession()
  const wines = await getWines(session.id)
  console.log(`Session: ${SESSION_CODE}, ${wines.length} bor\n`)

  // Clean existing test participant data
  const { data: allP } = await supabase.from('participants').select('id, name, is_leader').eq('session_id', session.id)
  const testIds = allP.filter(p => !p.is_leader && PARTICIPANTS.includes(p.name)).map(p => p.id)
  if (testIds.length > 0) {
    await supabase.from('evaluations').delete().in('participant_id', testIds)
    await supabase.from('participants').delete().in('id', testIds)
  }

  // Also clean old non-leader non-test evaluations
  const oldNonLeader = allP.filter(p => !p.is_leader && !PARTICIPANTS.includes(p.name)).map(p => p.id)
  if (oldNonLeader.length > 0) {
    await supabase.from('evaluations').delete().in('participant_id', oldNonLeader)
  }

  // Reset all wines: none active, none revealed
  for (const w of wines) {
    await supabase.from('wines').update({ is_active: false, results_revealed: false }).eq('id', w.id)
  }

  // Create participants
  console.log('Résztvevők létrehozása...')
  await ensureParticipants(session.id)

  // Activate first wine
  await supabase.from('wines').update({ is_active: true }).eq('id', wines[0].id)
  console.log(`\n✓ Első bor aktiválva: ${wines[0].name}`)
  console.log('\nKész! Futtasd: node seed-evaluations.mjs evaluate')
}

// Evaluate: submit evaluations for the current active wine
if (action === 'evaluate') {
  const session = await getSession()
  const wines = await getWines(session.id)
  const activeWine = wines.find(w => w.is_active)

  if (!activeWine) {
    console.log('Nincs aktív bor! Futtasd: node seed-evaluations.mjs next')
    process.exit(0)
  }

  const wineIndex = wines.indexOf(activeWine)
  console.log(`Aktív bor (#${wineIndex + 1}): ${activeWine.name}\n`)

  const pids = await ensureParticipants(session.id)

  for (let i = 0; i < pids.length; i++) {
    const evalData = generateEvaluation(wineIndex)
    await supabase.from('evaluations').upsert(
      { wine_id: activeWine.id, participant_id: pids[i], data: evalData },
      { onConflict: 'wine_id,participant_id' }
    )
    console.log(`  ✓ ${PARTICIPANTS[i]} értékelt`)
  }

  console.log(`\n6 értékelés beküldve. Futtasd: node seed-evaluations.mjs reveal`)
}

// Reveal: reveal results for active wine
if (action === 'reveal') {
  const session = await getSession()
  const wines = await getWines(session.id)
  const activeWine = wines.find(w => w.is_active)

  if (!activeWine) {
    console.log('Nincs aktív bor!')
    process.exit(0)
  }

  await supabase.from('wines').update({ results_revealed: true }).eq('id', activeWine.id)
  console.log(`✓ Eredmények felfedve: ${activeWine.name}`)
  console.log('\nFuttasd: node seed-evaluations.mjs next')
}

// Next: deactivate current, activate next wine
if (action === 'next') {
  const session = await getSession()
  const wines = await getWines(session.id)
  const activeWine = wines.find(w => w.is_active)

  if (activeWine) {
    await supabase.from('wines').update({ is_active: false }).eq('id', activeWine.id)
  }

  const currentIndex = activeWine ? wines.indexOf(activeWine) : -1
  const nextIndex = currentIndex + 1

  if (nextIndex >= wines.length) {
    console.log('✓ Minden bor kész! Nincs több bor.')
    process.exit(0)
  }

  await supabase.from('wines').update({ is_active: true }).eq('id', wines[nextIndex].id)
  console.log(`✓ Következő bor aktiválva (#${nextIndex + 1}): ${wines[nextIndex].name}`)
  console.log('\nFuttasd: node seed-evaluations.mjs evaluate')
}
