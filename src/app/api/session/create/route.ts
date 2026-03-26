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

    const supabase = createServiceClient()
    const { leaderName } = parsed.data

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

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        code,
        leader_name: leaderName,
        status: 'active',
      })
      .select()
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Nem sikerült létrehozni a kóstolót' },
        { status: 500 }
      )
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
        { error: 'Nem sikerült regisztrálni a vezetőt' },
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
