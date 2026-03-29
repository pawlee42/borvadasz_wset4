import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import sharp from 'sharp'

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

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff', 'image/gif', 'image/avif']
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const formData = await request.formData()
    const participantId = formData.get('participantId') as string | null

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

    const csvFile = formData.get('csv') as File | null
    if (!csvFile) {
      return NextResponse.json({ error: 'Hiányzó CSV fájl' }, { status: 400 })
    }

    const csvText = await csvFile.text()
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)

    if (lines.length < 2) {
      return NextResponse.json({ error: 'A CSV fájl üres vagy nincs adatsor' }, { status: 400 })
    }

    // Parse header
    const header = lines[0].split(';').map((h) => h.trim().toLowerCase())
    const nameIdx = header.findIndex((h) => h === 'név' || h === 'name' || h === 'bor')
    const producerIdx = header.findIndex((h) => h === 'termelő' || h === 'producer' || h === 'termelo')
    const vintageIdx = header.findIndex((h) => h === 'évjárat' || h === 'vintage' || h === 'evjarat')
    const regionIdx = header.findIndex((h) => h === 'régió' || h === 'region' || h === 'regio')
    const typeIdx = header.findIndex((h) => h === 'típus' || h === 'type' || h === 'tipus')

    if (nameIdx === -1 || producerIdx === -1) {
      return NextResponse.json(
        { error: 'A CSV-ben kötelező: név/name, termelő/producer oszlop' },
        { status: 400 }
      )
    }

    // Get existing wine count for sort_order
    const { count: existingCount } = await supabase
      .from('wines')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session.id)

    let sortOrder = (existingCount ?? 0) + 1
    const wines: Array<{
      session_id: string
      name: string
      producer: string
      vintage: number | null
      region: string | null
      wine_type: string
      image_url: string | null
      sort_order: number
      is_active: boolean
      results_revealed: boolean
    }> = []

    const typeMap: Record<string, string> = {
      fehér: 'white', feher: 'white', white: 'white',
      rosé: 'rosé', rose: 'rosé', rozé: 'rosé', roze: 'rosé',
      vörös: 'red', voros: 'red', red: 'red', piros: 'red',
    }

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(';').map((c) => c.trim())
      const name = cols[nameIdx] || ''
      const producer = cols[producerIdx] || ''
      if (!name || !producer) continue

      const vintageStr = vintageIdx >= 0 ? cols[vintageIdx] : ''
      const vintage = vintageStr ? parseInt(vintageStr, 10) : null
      const region = regionIdx >= 0 ? cols[regionIdx] || null : null
      const typeStr = typeIdx >= 0 ? cols[typeIdx]?.toLowerCase() || '' : ''
      const wine_type = typeMap[typeStr] || 'red'

      // Check for image file named by sort order (1.jpg, 1.png, etc.)
      let image_url: string | null = null
      const imageFile = formData.get(`image_${i}`) as File | null
      if (imageFile && ALLOWED_TYPES.includes(imageFile.type) && imageFile.size <= MAX_SIZE) {
        const filename = `${crypto.randomUUID()}.jpg`
        const rawBuffer = Buffer.from(await imageFile.arrayBuffer())
        const buffer = await sharp(rawBuffer)
          .resize({ height: 800, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer()

        const { error: uploadError } = await supabase.storage
          .from('wine-images')
          .upload(filename, buffer, { contentType: 'image/jpeg', upsert: false })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('wine-images')
            .getPublicUrl(filename)
          image_url = urlData.publicUrl
        }
      }

      wines.push({
        session_id: session.id,
        name,
        producer,
        vintage: vintage && vintage >= 1900 && vintage <= 2100 ? vintage : null,
        region,
        wine_type,
        image_url,
        sort_order: sortOrder++,
        is_active: false,
        results_revealed: false,
      })
    }

    if (wines.length === 0) {
      return NextResponse.json({ error: 'Nem található érvényes sor a CSV-ben' }, { status: 400 })
    }

    const { data: inserted, error } = await supabase
      .from('wines')
      .insert(wines)
      .select()

    if (error || !inserted) {
      return NextResponse.json({ error: 'Nem sikerült hozzáadni a borokat' }, { status: 500 })
    }

    return NextResponse.json({ count: inserted.length, wines: inserted }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Szerverhiba' }, { status: 500 })
  }
}
