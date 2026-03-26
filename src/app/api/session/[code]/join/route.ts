import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { joinSessionSchema } from '@/lib/utils/validators'

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60_000
  const maxRequests = 10

  const timestamps = rateLimitMap.get(ip) ?? []
  const recent = timestamps.filter((t) => now - t < windowMs)
  recent.push(now)
  rateLimitMap.set(ip, recent)

  return recent.length > maxRequests
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Túl sok kérés, próbáld újra később' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = joinSessionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Érvénytelen adatok', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { code } = await params
    const supabase = createServiceClient()

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Kóstoló nem található' },
        { status: 404 }
      )
    }

    if (session.status !== 'active') {
      return NextResponse.json(
        { error: 'Ez a kóstoló már nem aktív' },
        { status: 410 }
      )
    }

    // Check if name is taken
    const { data: existing } = await supabase
      .from('participants')
      .select('id')
      .eq('session_id', session.id)
      .eq('name', parsed.data.name)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Ez a név már foglalt ebben a kóstolóban' },
        { status: 409 }
      )
    }

    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .insert({
        session_id: session.id,
        name: parsed.data.name,
        is_leader: false,
      })
      .select()
      .single()

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Nem sikerült csatlakozni' },
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
