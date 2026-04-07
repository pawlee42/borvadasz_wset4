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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const url = new URL(request.url)
    const participantId = url.searchParams.get('participantId')

    if (!participantId) {
      return NextResponse.json({ error: 'Missing participantId' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: session } = await supabase
      .from('sessions')
      .select('id')
      .eq('code', code.toUpperCase())
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const { data: participant } = await supabase
      .from('participants')
      .select('id')
      .eq('id', participantId)
      .eq('session_id', session.id)
      .single()

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    return NextResponse.json({ valid: true })
  } catch {
    return NextResponse.json({ error: 'Szerverhiba' }, { status: 500 })
  }
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
      .select('*')
      .eq('session_id', session.id)
      .eq('name', parsed.data.name)
      .single()

    if (existing) {
      if (parsed.data.confirm) {
        return NextResponse.json({ session, participant: existing }, { status: 200 })
      }
      return NextResponse.json(
        { error: 'Ez a név már foglalt ebben a kóstolóban', nameConflict: true },
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
