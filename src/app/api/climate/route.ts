import { NextResponse } from 'next/server'
import { computeClimateProfile, detectHemisphere } from '@/lib/utils/climate-data'
import type { ClimateProfile, DailyWeatherData } from '@/lib/types/climate'

const cache = new Map<string, ClimateProfile>()

// Strip wine classification suffixes that confuse geocoding
const WINE_SUFFIXES = /\b(AOP|AOC|DOC|DOCG|DOCa|DO|AVA|IGP|IGT|VdP|GG|DAC|PDO|PGI|Classico|Riserva|Gran Reserva|Reserva|Superiore|Cru|Premier Cru|Grand Cru)\b/gi

// Known wine region → geocoding-friendly name mappings
const REGION_ALIASES: Record<string, string[]> = {
  'südsteiermark': ['Leibnitz'],
  'südtirol': ['Terlan'],
  'alto adige': ['Terlan'],
  'friuli colli orientali': ['Cividale del Friuli'],
  'valle de uco': ['Tupungato'],
  'cape south': ['Hermanus'],
  'hemel-en-aarde': ['Hermanus'],
  'marlborough': ['Blenheim'],
  'hawke\'s bay': ['Napier'],
  'central otago': ['Cromwell'],
  'waipara': ['Waipara'],
  'casablanca valley': ['Casablanca'],
  'colchagua': ['Santa Cruz'],
  'stellenbosch': ['Stellenbosch'],
  'franschhoek': ['Franschhoek'],
  'swartland': ['Malmesbury'],
}

function generateVariants(region: string): string[] {
  const variants: string[] = []

  // Strip wine suffixes
  const cleaned = region.replace(WINE_SUFFIXES, '').replace(/\s+/g, ' ').trim()

  // Check alias table FIRST — aliases include country names for disambiguation
  const lower = cleaned.toLowerCase()
  for (const [key, aliases] of Object.entries(REGION_ALIASES)) {
    if (lower.includes(key)) {
      variants.push(...aliases)
      break
    }
  }
  // Also check the raw region (before cleaning) for slash-separated parts
  if (variants.length === 0) {
    const rawLower = region.toLowerCase()
    for (const [key, aliases] of Object.entries(REGION_ALIASES)) {
      if (rawLower.includes(key)) {
        variants.push(...aliases)
        break
      }
    }
  }

  // Then try the original and cleaned versions
  variants.push(region)
  if (cleaned !== region) variants.push(cleaned)

  // Split on / and try each part
  if (region.includes('/')) {
    for (const part of region.split('/')) {
      const p = part.replace(WINE_SUFFIXES, '').replace(/\s+/g, ' ').trim()
      if (p.length >= 3) variants.push(p)
    }
  }

  // Try individual multi-word fragments (2+ words, skip single words that are too generic)
  const words = cleaned.split(/\s+/)
  if (words.length >= 3) {
    variants.push(words.slice(0, 2).join(' '))
    variants.push(words.slice(-2).join(' '))
  }

  // Deduplicate while preserving order
  return [...new Set(variants)]
}

async function tryGeocode(query: string): Promise<{ latitude: number; longitude: number; name: string } | null> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en`
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.results?.[0] ?? null
}

async function geocode(region: string): Promise<{ latitude: number; longitude: number; name: string } | null> {
  for (const query of generateVariants(region)) {
    const result = await tryGeocode(query)
    if (result) return result
  }
  return null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const region = searchParams.get('region')
  const vintageStr = searchParams.get('vintage')

  if (!region || !vintageStr) {
    return NextResponse.json({ error: 'Hiányzó régió vagy évjárat' }, { status: 400 })
  }

  const vintage = parseInt(vintageStr, 10)
  if (isNaN(vintage) || vintage < 1940 || vintage > new Date().getFullYear()) {
    return NextResponse.json({ error: 'Érvénytelen évjárat (1940-tól elérhető)' }, { status: 400 })
  }

  const cacheKey = `${region.toLowerCase()}:${vintage}`
  const cached = cache.get(cacheKey)
  if (cached) {
    return NextResponse.json(cached)
  }

  try {
    // Geocode region (with suffix stripping fallback)
    const geo = await geocode(region)
    if (!geo) {
      return NextResponse.json({ error: 'Régió nem található' }, { status: 404 })
    }

    const { latitude: lat, longitude: lon, name: locationName } = geo
    const hemisphere = detectHemisphere(lat)

    // Fetch full calendar year for charts; for southern hemisphere also fetch
    // previous year's Oct-Dec so the growing season (Oct-Apr) is complete
    const startDate = hemisphere === 'south' ? `${vintage - 1}-01-01` : `${vintage}-01-01`
    const endDate = `${vintage}-12-31`

    // Fetch historical weather
    const weatherUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,sunshine_duration&timezone=auto`
    const weatherRes = await fetch(weatherUrl)

    if (!weatherRes.ok) {
      return NextResponse.json({ error: 'Időjárási adatok nem elérhetőek' }, { status: 502 })
    }

    const weatherData = await weatherRes.json()
    if (!weatherData.daily) {
      return NextResponse.json({ error: 'Hiányos időjárási adatok' }, { status: 502 })
    }

    const daily: DailyWeatherData = weatherData.daily
    const profile = computeClimateProfile(daily, lat, lon, locationName, vintage)

    cache.set(cacheKey, profile)
    return NextResponse.json(profile)
  } catch {
    return NextResponse.json({ error: 'Szolgáltatás nem elérhető' }, { status: 503 })
  }
}
