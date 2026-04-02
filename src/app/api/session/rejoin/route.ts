import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { rejoinSessionSchema } from '@/lib/utils/validators'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = rejoinSessionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Érvénytelen adatok' },
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
    const code = parsed.data.code.toUpperCase()

    const { data: session } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', code)
      .single()

    if (!session) {
      return NextResponse.json(
        { error: 'Kóstoló nem található ezzel a kóddal' },
        { status: 404 }
      )
    }

    const { data: leader } = await supabase
      .from('participants')
      .select('*')
      .eq('session_id', session.id)
      .eq('is_leader', true)
      .single()

    if (!leader) {
      return NextResponse.json(
        { error: 'Ügyvezető nem található ehhez a kóstolóhoz' },
        { status: 404 }
      )
    }

    return NextResponse.json({ session, participant: leader })
  } catch {
    return NextResponse.json(
      { error: 'Szerverhiba' },
      { status: 500 }
    )
  }
}
