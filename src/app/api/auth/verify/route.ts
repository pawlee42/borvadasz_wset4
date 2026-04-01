import { NextResponse } from 'next/server'
import { verifyPasswordSchema } from '@/lib/utils/validators'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = verifyPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Hibás kérés' }, { status: 400 })
    }

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword || parsed.data.password !== adminPassword) {
      return NextResponse.json({ error: 'Hibás jelszó' }, { status: 401 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Szerverhiba' }, { status: 500 })
  }
}
