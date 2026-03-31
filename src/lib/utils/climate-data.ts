import type { DailyWeatherData, MonthlyClimateData, ClimateProfile } from '@/lib/types/climate'

const MONTH_LABELS = [
  'Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún',
  'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec',
]

export function detectHemisphere(lat: number): 'north' | 'south' {
  return lat >= 0 ? 'north' : 'south'
}

export function getGrowingSeasonMonths(hemisphere: 'north' | 'south'): number[] {
  return hemisphere === 'north'
    ? [4, 5, 6, 7, 8, 9, 10]
    : [10, 11, 12, 1, 2, 3, 4]
}

export function getHarvestMonths(hemisphere: 'north' | 'south'): number[] {
  return hemisphere === 'north' ? [9, 10] : [3, 4]
}

export function computeMonthlyData(daily: DailyWeatherData, vintageYear?: number): MonthlyClimateData[] {
  const buckets: { temps: number[]; mins: number[]; maxs: number[]; precip: number; sunshine: number }[] =
    Array.from({ length: 12 }, () => ({ temps: [], mins: [], maxs: [], precip: 0, sunshine: 0 }))

  for (let i = 0; i < daily.time.length; i++) {
    const date = new Date(daily.time[i])
    // For chart display: only use the vintage year's data so each month has one value
    if (vintageYear && date.getFullYear() !== vintageYear) continue
    const m = date.getMonth() // 0-11
    const mean = daily.temperature_2m_mean[i]
    const min = daily.temperature_2m_min[i]
    const max = daily.temperature_2m_max[i]
    const precip = daily.precipitation_sum[i]
    const sun = daily.sunshine_duration[i]

    if (mean != null) buckets[m].temps.push(mean)
    if (min != null) buckets[m].mins.push(min)
    if (max != null) buckets[m].maxs.push(max)
    if (precip != null) buckets[m].precip += precip
    if (sun != null) buckets[m].sunshine += sun
  }

  return buckets.map((b, i) => ({
    month: MONTH_LABELS[i],
    monthIndex: i + 1,
    avgTemp: b.temps.length ? +(b.temps.reduce((a, v) => a + v, 0) / b.temps.length).toFixed(1) : 0,
    minTemp: b.mins.length ? +(b.mins.reduce((a, v) => a + v, 0) / b.mins.length).toFixed(1) : 0,
    maxTemp: b.maxs.length ? +(b.maxs.reduce((a, v) => a + v, 0) / b.maxs.length).toFixed(1) : 0,
    precipitation: +b.precip.toFixed(1),
    sunshineHours: +(b.sunshine / 3600).toFixed(1), // seconds → hours
  }))
}

export function computeGDD(
  daily: DailyWeatherData,
  growingMonths: number[],
  hemisphere: 'north' | 'south',
  vintageYear: number
): number {
  let gdd = 0
  for (let i = 0; i < daily.time.length; i++) {
    const date = new Date(daily.time[i])
    const m = date.getMonth() + 1
    const y = date.getFullYear()
    if (!growingMonths.includes(m)) continue
    // For southern hemisphere: Oct-Dec must be from previous year, Jan-Apr from vintage year
    if (hemisphere === 'south') {
      if (m >= 10 && y !== vintageYear - 1) continue
      if (m <= 4 && y !== vintageYear) continue
    } else {
      if (y !== vintageYear) continue
    }
    const mean = daily.temperature_2m_mean[i]
    if (mean != null && mean > 10) gdd += mean - 10
  }
  return Math.round(gdd)
}

export function computeClimateBadge(gdd: number): 'cool' | 'moderate' | 'warm' | 'hot' {
  if (gdd < 1000) return 'cool'
  if (gdd < 1500) return 'moderate'
  if (gdd < 2000) return 'warm'
  return 'hot'
}

export function computeClimateProfile(
  daily: DailyWeatherData,
  lat: number,
  lon: number,
  locationName: string,
  vintageYear: number
): ClimateProfile {
  const hemisphere = detectHemisphere(lat)
  const growingMonths = getGrowingSeasonMonths(hemisphere)
  const harvestMonths = getHarvestMonths(hemisphere)
  const monthlyData = computeMonthlyData(daily, vintageYear)
  const gdd = computeGDD(daily, growingMonths, hemisphere, vintageYear)

  const growingMonthly = monthlyData.filter((m) => growingMonths.includes(m.monthIndex))
  const harvestMonthly = monthlyData.filter((m) => harvestMonths.includes(m.monthIndex))

  const growingSeasonAvgTemp = growingMonthly.length
    ? +(growingMonthly.reduce((a, m) => a + m.avgTemp, 0) / growingMonthly.length).toFixed(1)
    : 0
  const growingSeasonPrecipitation = +growingMonthly.reduce((a, m) => a + m.precipitation, 0).toFixed(1)
  const growingSeasonSunshineHours = +growingMonthly.reduce((a, m) => a + m.sunshineHours, 0).toFixed(0)

  const harvestAvgTemp = harvestMonthly.length
    ? +(harvestMonthly.reduce((a, m) => a + m.avgTemp, 0) / harvestMonthly.length).toFixed(1)
    : 0
  const harvestPrecipitation = +harvestMonthly.reduce((a, m) => a + m.precipitation, 0).toFixed(1)

  // Count frost and heat spike days during growing season
  let frostDays = 0
  let heatSpikeDays = 0
  for (let i = 0; i < daily.time.length; i++) {
    const date = new Date(daily.time[i])
    const m = date.getMonth() + 1
    const y = date.getFullYear()
    if (!growingMonths.includes(m)) continue
    if (hemisphere === 'south') {
      if (m >= 10 && y !== vintageYear - 1) continue
      if (m <= 4 && y !== vintageYear) continue
    } else {
      if (y !== vintageYear) continue
    }
    const min = daily.temperature_2m_min[i]
    const max = daily.temperature_2m_max[i]
    if (min != null && min < 0) frostDays++
    if (max != null && max > 35) heatSpikeDays++
  }

  return {
    monthlyData,
    gdd,
    growingSeasonAvgTemp,
    growingSeasonPrecipitation,
    growingSeasonSunshineHours,
    frostDays,
    heatSpikeDays,
    harvestAvgTemp,
    harvestPrecipitation,
    climateBadge: computeClimateBadge(gdd),
    hemisphere,
    growingSeasonMonths: growingMonths,
    location: { name: locationName, lat, lon },
  }
}
