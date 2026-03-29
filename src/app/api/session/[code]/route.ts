import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const supabase = createServiceClient()

    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (error || !session) {
      return NextResponse.json({ error: 'Kóstoló nem található' }, { status: 404 })
    }

    return NextResponse.json(session)
  } catch {
    return NextResponse.json({ error: 'Szerverhiba' }, { status: 500 })
  }
}
