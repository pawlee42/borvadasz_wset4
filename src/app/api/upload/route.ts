import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import sharp from 'sharp'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff', 'image/gif', 'image/avif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_HEIGHT = 800

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nincs fájl feltöltve' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Csak JPEG, PNG és WebP képek engedélyezettek' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'A fájl mérete nem haladhatja meg az 5MB-ot' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const filename = `${crypto.randomUUID()}.jpg`

    const rawBuffer = Buffer.from(await file.arrayBuffer())
    const buffer = await sharp(rawBuffer)
      .resize({ height: MAX_HEIGHT, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer()

    const { error: uploadError } = await supabase.storage
      .from('wine-images')
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Nem sikerült feltölteni a képet' },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage
      .from('wine-images')
      .getPublicUrl(filename)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch {
    return NextResponse.json({ error: 'Szerverhiba' }, { status: 500 })
  }
}
