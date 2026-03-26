import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string; wineId: string }> }
) {
  try {
    const { code, wineId } = await params
    const supabase = createServiceClient()

    const { data: session } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Kóstoló nem található' }, { status: 404 })
    }

    const { data: wine } = await supabase
      .from('wines')
      .select('*')
      .eq('id', wineId)
      .single()

    if (!wine) {
      return NextResponse.json({ error: 'Bor nem található' }, { status: 404 })
    }

    // Check if results are revealed (leader can always see)
    const participantId = request.headers.get('x-participant-id')
    if (!wine.results_revealed) {
      if (participantId) {
        const { data: participant } = await supabase
          .from('participants')
          .select('is_leader')
          .eq('id', participantId)
          .single()

        if (!participant?.is_leader) {
          return NextResponse.json(
            { error: 'Az eredmények még nem lettek felfedve' },
            { status: 403 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Az eredmények még nem lettek felfedve' },
          { status: 403 }
        )
      }
    }

    const { data: evaluations, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('wine_id', wineId)

    if (error) {
      return NextResponse.json(
        { error: 'Nem sikerült lekérni az értékeléseket' },
        { status: 500 }
      )
    }

    return NextResponse.json(evaluations)
  } catch {
    return NextResponse.json({ error: 'Szerverhiba' }, { status: 500 })
  }
}
