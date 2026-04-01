import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createSessionSchema } from '@/lib/utils/validators'
import { generateSessionCode } from '@/lib/utils/session-code'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createSessionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Érvénytelen adatok', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword || parsed.data.password !== adminPassword) {
      return NextResponse.json(
        { error: 'Hibás jelszó' },
        { status: 401 }
      )
    }

    const supabase = createServiceClient()
    const { leaderName, title, eventDate, location } = parsed.data

    // Generate unique code with retry
    let code: string
    let attempts = 0
    while (true) {
      code = generateSessionCode()
      const { data: existing } = await supabase
        .from('sessions')
        .select('id')
        .eq('code', code)
        .single()
      if (!existing) break
      attempts++
      if (attempts > 10) {
        return NextResponse.json(
          { error: 'Nem sikerült egyedi kódot generálni' },
          { status: 500 }
        )
      }
    }

    // Try with metadata columns, fall back to without if columns don't exist yet
    let session
    const metaInsert = {
      code,
      leader_name: leaderName,
      title: title || null,
      event_date: eventDate || null,
      location: location || null,
      status: 'active',
    }
    const baseInsert = {
      code,
      leader_name: leaderName,
      status: 'active',
    }

    const { data: s1, error: e1 } = await supabase
      .from('sessions')
      .insert(metaInsert)
      .select()
      .single()

    if (e1) {
      // Columns might not exist yet — retry without metadata
      const { data: s2, error: e2 } = await supabase
        .from('sessions')
        .insert(baseInsert)
        .select()
        .single()

      if (e2 || !s2) {
        return NextResponse.json(
          { error: 'Nem sikerült létrehozni a kóstolót' },
          { status: 500 }
        )
      }
      session = s2
    } else {
      session = s1
    }

    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .insert({
        session_id: session.id,
        name: leaderName,
        is_leader: true,
      })
      .select()
      .single()

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Nem sikerült regisztrálni az ügyvezetőt' },
        { status: 500 }
      )
    }

    return NextResponse.json({ session, participant }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Szerverhiba' },
      { status: 500 }
    )
  }
}
