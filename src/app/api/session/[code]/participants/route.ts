import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const supabase = createServiceClient()

    const leaderId = request.headers.get('x-participant-id')
    if (!leaderId) {
      return NextResponse.json({ error: 'Nincs jogosultság' }, { status: 401 })
    }

    // Verify leader
    const { data: leader } = await supabase
      .from('participants')
      .select('is_leader')
      .eq('id', leaderId)
      .single()

    if (!leader?.is_leader) {
      return NextResponse.json({ error: 'Csak az ügyvezető törölhet résztvevőt' }, { status: 403 })
    }

    const { participantId } = await request.json()
    if (!participantId) {
      return NextResponse.json({ error: 'Hiányzó résztvevő azonosító' }, { status: 400 })
    }

    // Don't allow deleting the leader
    const { data: target } = await supabase
      .from('participants')
      .select('is_leader, session_id')
      .eq('id', participantId)
      .single()

    if (!target) {
      return NextResponse.json({ error: 'Résztvevő nem található' }, { status: 404 })
    }
    if (target.is_leader) {
      return NextResponse.json({ error: 'Az ügyvezető nem törölhető' }, { status: 400 })
    }

    // Verify same session
    const { data: session } = await supabase
      .from('sessions')
      .select('id')
      .eq('code', code.toUpperCase())
      .single()

    if (!session || target.session_id !== session.id) {
      return NextResponse.json({ error: 'A résztvevő nem ehhez a kóstolóhoz tartozik' }, { status: 400 })
    }

    // Delete evaluations first, then participant
    await supabase.from('evaluations').delete().eq('participant_id', participantId)
    await supabase.from('participants').delete().eq('id', participantId)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Szerverhiba' }, { status: 500 })
  }
}
