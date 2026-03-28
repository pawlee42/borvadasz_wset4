import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createWineSchema } from '@/lib/utils/validators'

async function verifyLeader(supabase: ReturnType<typeof createServiceClient>, participantId: string) {
  const { data } = await supabase
    .from('participants')
    .select('id, is_leader')
    .eq('id', participantId)
    .single()
  return data?.is_leader === true
}

async function getSession(supabase: ReturnType<typeof createServiceClient>, code: string) {
  const { data } = await supabase
    .from('sessions')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()
  return data
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const supabase = createServiceClient()
    const session = await getSession(supabase, code)

    if (!session) {
      return NextResponse.json({ error: 'Kóstoló nem található' }, { status: 404 })
    }

    const { data: wines, error } = await supabase
      .from('wines')
      .select('*')
      .eq('session_id', session.id)
      .order('sort_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Nem sikerült lekérni a borokat' }, { status: 500 })
    }

    return NextResponse.json(wines)
  } catch {
    return NextResponse.json({ error: 'Szerverhiba' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const participantId = request.headers.get('x-participant-id')
    if (!participantId) {
      return NextResponse.json({ error: 'Hiányzó résztvevő azonosító' }, { status: 401 })
    }

    const supabase = createServiceClient()

    if (!(await verifyLeader(supabase, participantId))) {
      return NextResponse.json({ error: 'Csak az ügyvezető adhat hozzá bort' }, { status: 403 })
    }

    const session = await getSession(supabase, code)
    if (!session) {
      return NextResponse.json({ error: 'Kóstoló nem található' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = createWineSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Érvénytelen adatok', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Get next sort_order
    const { count } = await supabase
      .from('wines')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session.id)

    const { data: wine, error } = await supabase
      .from('wines')
      .insert({
        session_id: session.id,
        sort_order: (count ?? 0) + 1,
        is_active: false,
        results_revealed: false,
        ...parsed.data,
      })
      .select()
      .single()

    if (error || !wine) {
      return NextResponse.json({ error: 'Nem sikerült hozzáadni a bort' }, { status: 500 })
    }

    return NextResponse.json(wine, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Szerverhiba' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const participantId = request.headers.get('x-participant-id')
    if (!participantId) {
      return NextResponse.json({ error: 'Hiányzó résztvevő azonosító' }, { status: 401 })
    }

    const supabase = createServiceClient()

    if (!(await verifyLeader(supabase, participantId))) {
      return NextResponse.json({ error: 'Csak az ügyvezető módosíthatja a borokat' }, { status: 403 })
    }

    const session = await getSession(supabase, code)
    if (!session) {
      return NextResponse.json({ error: 'Kóstoló nem található' }, { status: 404 })
    }

    const { wineId, action } = await request.json()
    if (!wineId || !['activate', 'reveal'].includes(action)) {
      return NextResponse.json({ error: 'Érvénytelen kérés' }, { status: 400 })
    }

    if (action === 'activate') {
      // Deactivate all wines in session
      await supabase
        .from('wines')
        .update({ is_active: false })
        .eq('session_id', session.id)

      // Activate target
      const { data: wine, error } = await supabase
        .from('wines')
        .update({ is_active: true })
        .eq('id', wineId)
        .select()
        .single()

      if (error || !wine) {
        return NextResponse.json({ error: 'Nem sikerült aktiválni' }, { status: 500 })
      }

      return NextResponse.json(wine)
    }

    if (action === 'reveal') {
      const { data: wine, error } = await supabase
        .from('wines')
        .update({ results_revealed: true })
        .eq('id', wineId)
        .select()
        .single()

      if (error || !wine) {
        return NextResponse.json({ error: 'Nem sikerült felfedni az eredményeket' }, { status: 500 })
      }

      return NextResponse.json(wine)
    }

    return NextResponse.json({ error: 'Ismeretlen művelet' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Szerverhiba' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const participantId = request.headers.get('x-participant-id')
    if (!participantId) {
      return NextResponse.json({ error: 'Hiányzó résztvevő azonosító' }, { status: 401 })
    }

    const supabase = createServiceClient()

    if (!(await verifyLeader(supabase, participantId))) {
      return NextResponse.json({ error: 'Csak az ügyvezető törölhet bort' }, { status: 403 })
    }

    const session = await getSession(supabase, code)
    if (!session) {
      return NextResponse.json({ error: 'Kóstoló nem található' }, { status: 404 })
    }

    const { wineId } = await request.json()
    if (!wineId) {
      return NextResponse.json({ error: 'Hiányzó bor azonosító' }, { status: 400 })
    }

    const { error } = await supabase.from('wines').delete().eq('id', wineId)
    if (error) {
      return NextResponse.json({ error: 'Nem sikerült törölni' }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Szerverhiba' }, { status: 500 })
  }
}
