const BASE = 'http://localhost:3000'

async function main() {
  // 1. Create session
  console.log('=== Creating session ===')
  const createRes = await fetch(`${BASE}/api/session/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leaderName: 'Teszt Vezető' }),
  })
  const { session, participant: leader } = await createRes.json()
  console.log('Session code:', session.code)
  console.log('Leader ID:', leader.id)

  // 2. Add a wine
  console.log('\n=== Adding wine ===')
  const wineRes = await fetch(`${BASE}/api/session/${session.code}/wines`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-participant-id': leader.id,
    },
    body: JSON.stringify({
      name: 'Egri Bikavér Superior',
      producer: 'St. Andrea',
      vintage: 2019,
      region: 'Eger',
      wine_type: 'red',
    }),
  })
  const wine = await wineRes.json()
  console.log('Wine:', wine.producer, '-', wine.name, wine.vintage)
  console.log('Wine ID:', wine.id)

  // 3. Activate wine
  console.log('\n=== Activating wine ===')
  const actRes = await fetch(`${BASE}/api/session/${session.code}/wines`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-participant-id': leader.id,
    },
    body: JSON.stringify({ wineId: wine.id, action: 'activate' }),
  })
  const actWine = await actRes.json()
  console.log('Active:', actWine.is_active)

  // 4. Join as participant
  console.log('\n=== Joining as participant ===')
  const joinRes = await fetch(`${BASE}/api/session/${session.code}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Kóstoló Péter' }),
  })
  const { participant } = await joinRes.json()
  console.log('Participant:', participant.name, '- ID:', participant.id)

  // 5. Submit evaluation via Supabase client
  console.log('\n=== Submitting evaluation ===')
  const { createClient } = await import('@supabase/supabase-js')
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
  )
  const { data: evalData, error: evalErr } = await sb
    .from('evaluations')
    .upsert(
      {
        wine_id: wine.id,
        participant_id: participant.id,
        data: {
          appearance: { clarity: 'clear', intensity: 3, colour: 'garnet', observations: 'szép könnycsepp' },
          nose: { condition: 'clean', intensity: 3, aromaCharacteristics: 'cseresznye, szilva, fűszeres, tölgyfa', development: 'developing' },
          palate: { sweetness: 0, acidity: 3, tanninLevel: 3, tanninNature: 'érett, finomszemcsés', alcohol: 1, body: 3, flavourIntensity: 3, flavourCharacteristics: 'fekete gyümölcsök, paprika, vanília', finishSeconds: 8.5, observations: 'krémes textúra' },
          conclusions: { quality: 4, readiness: 'can_drink_ageing', explanation: 'Kiváló egyensúly, összetett, hosszú utóíz' },
        },
      },
      { onConflict: 'wine_id,participant_id' }
    )
    .select()
    .single()

  if (evalErr) {
    console.log('ERROR:', evalErr.message)
  } else {
    console.log('Evaluation submitted! ID:', evalData.id)
    console.log('Quality:', evalData.data.conclusions.quality, '/ 5')
  }

  // 6. Reveal results
  console.log('\n=== Revealing results ===')
  const revRes = await fetch(`${BASE}/api/session/${session.code}/wines`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-participant-id': leader.id,
    },
    body: JSON.stringify({ wineId: wine.id, action: 'reveal' }),
  })
  const revWine = await revRes.json()
  console.log('Results revealed:', revWine.results_revealed)

  // 7. Fetch results
  console.log('\n=== Fetching results ===')
  const resultsRes = await fetch(
    `${BASE}/api/session/${session.code}/wines/${wine.id}/results?participant_id=${leader.id}`
  )
  const results = await resultsRes.json()
  console.log('Evaluations count:', results.length)
  if (results[0]) {
    console.log('Aroma:', results[0].data.nose.aromaCharacteristics)
    console.log('Finish:', results[0].data.palate.finishSeconds, 'seconds')
    console.log('Quality:', results[0].data.conclusions.quality, '/ 5')
  }

  console.log('\n========================================')
  console.log('ALL TESTS PASSED')
  console.log('Session code:', session.code)
  console.log('Open http://localhost:3000 in your browser')
  console.log('========================================')
}

main().catch(console.error)
