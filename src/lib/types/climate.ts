export interface MonthlyClimateData {
  month: string
  monthIndex: number // 1-12
  avgTemp: number
  minTemp: number
  maxTemp: number
  precipitation: number // mm total
  sunshineHours: number
}

export interface ClimateProfile {
  monthlyData: MonthlyClimateData[]
  gdd: number
  growingSeasonAvgTemp: number
  growingSeasonPrecipitation: number
  growingSeasonSunshineHours: number
  frostDays: number
  heatSpikeDays: number
  harvestAvgTemp: number
  harvestPrecipitation: number
  climateBadge: 'cool' | 'moderate' | 'warm' | 'hot'
  hemisphere: 'north' | 'south'
  growingSeasonMonths: number[]
  location: { name: string; lat: number; lon: number }
}

export interface DailyWeatherData {
  time: string[]
  temperature_2m_max: (number | null)[]
  temperature_2m_min: (number | null)[]
  temperature_2m_mean: (number | null)[]
  precipitation_sum: (number | null)[]
  sunshine_duration: (number | null)[]
}
