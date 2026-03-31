'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  CartesianGrid,
} from 'recharts'
import type { Wine } from '@/lib/types/database'
import type { ClimateProfile, MonthlyClimateData } from '@/lib/types/climate'

interface ClimatePanelProps {
  wine: Wine
}

const BADGE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  cool: { bg: '#e8ddd4', text: '#6b4f2e', label: 'Hűvös klíma' },
  moderate: { bg: '#c2a98e', text: '#3e2e1a', label: 'Mérsékelt klíma' },
  warm: { bg: '#a68a6b', text: '#fff', label: 'Meleg klíma' },
  hot: { bg: '#6b4f2e', text: '#fff', label: 'Forró klíma' },
}

const GLOBAL_RANGES = {
  temperature: { min: 13, max: 24, minLabel: 'Champagne', maxLabel: 'Barossa Valley' },
  sunshine: { min: 1000, max: 2800, minLabel: 'Anglia', maxLabel: 'Central Valley' },
  precipitation: { min: 50, max: 1200, minLabel: 'Atacama', maxLabel: 'Galicia' },
}

function ClimateScale({ label, value, unit, min, max, minLabel, maxLabel, gradient, markerColor }: {
  label: string; value: number; unit: string
  min: number; max: number; minLabel: string; maxLabel: string
  gradient: string; markerColor: string
}) {
  const rawPct = ((value - min) / (max - min)) * 100
  const pct = Math.max(0, Math.min(100, rawPct))
  const outOfRange = rawPct > 100 || rawPct < 0

  return (
    <div>
      <p className="text-xs font-medium text-stone-600 mb-1">{label}</p>
      <div className="relative pt-5">
        <div
          className="absolute -translate-x-1/2 bottom-full mb-1 text-[11px] font-bold whitespace-nowrap"
          style={{ left: `${pct}%`, color: markerColor }}
        >
          {value}{unit}{outOfRange ? ' !' : ''}
        </div>
        <div className="h-2.5 w-full rounded-full" style={{ background: gradient }} />
        <div
          className="absolute top-5 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${pct}%` }}
        >
          <div className="h-5 w-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: markerColor }} />
        </div>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-stone-400">{minLabel} ({min}{unit})</span>
        <span className="text-[10px] text-stone-400">{maxLabel} ({max}{unit})</span>
      </div>
    </div>
  )
}

function MetricCard({ value, unit, label }: { value: string | number; unit: string; label: string }) {
  return (
    <div className="rounded-lg bg-stone-50 p-3 text-center">
      <p className="text-lg font-bold text-stone-800">
        {value}
        <span className="text-xs font-normal text-stone-400 ml-0.5">{unit}</span>
      </p>
      <p className="text-[10px] text-stone-500 mt-0.5">{label}</p>
    </div>
  )
}

function TemperatureChart({ data, growingMonths }: { data: MonthlyClimateData[]; growingMonths: number[] }) {
  const gsStart = Math.min(...growingMonths) - 1
  const gsEnd = Math.max(...growingMonths) - 1

  return (
    <div>
      <p className="text-xs font-medium text-stone-600 mb-1">Havi hőmérséklet (°C)</p>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#78716c' }} />
          <YAxis tick={{ fontSize: 10, fill: '#78716c' }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #d6ccc2' }}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = { maxTemp: 'Max', avgTemp: 'Átlag', minTemp: 'Min' }
              return [`${value}°C`, labels[name] || name]
            }}
          />
          <ReferenceArea
            x1={data[gsStart]?.month}
            x2={data[gsEnd]?.month}
            fill="#c2a98e"
            fillOpacity={0.1}
          />
          <Area
            type="monotone"
            dataKey="maxTemp"
            stroke="none"
            fill="#e8ddd4"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="minTemp"
            stroke="none"
            fill="#fff"
            fillOpacity={1}
          />
          <Line
            type="monotone"
            dataKey="avgTemp"
            stroke="#8b5e3c"
            strokeWidth={2}
            dot={{ r: 3, fill: '#8b5e3c' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function PrecipitationChart({ data, growingMonths }: { data: MonthlyClimateData[]; growingMonths: number[] }) {
  const chartData = data.map((m) => ({
    ...m,
    fill: growingMonths.includes(m.monthIndex) ? '#8b6f4e' : '#d6ccc2',
  }))

  return (
    <div>
      <p className="text-xs font-medium text-stone-600 mb-1">Havi csapadék (mm)</p>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#78716c' }} />
          <YAxis tick={{ fontSize: 10, fill: '#78716c' }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #d6ccc2' }}
            formatter={(value: number) => [`${value} mm`, 'Csapadék']}
          />
          <Bar dataKey="precipitation" radius={[3, 3, 0, 0]}>
            {chartData.map((entry, i) => (
              <rect key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function SunshineChart({ data, growingMonths }: { data: MonthlyClimateData[]; growingMonths: number[] }) {
  const chartData = data.map((m) => ({
    ...m,
    fill: growingMonths.includes(m.monthIndex) ? '#c2a98e' : '#e8ddd4',
  }))

  return (
    <div>
      <p className="text-xs font-medium text-stone-600 mb-1">Havi napsütés (óra)</p>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#78716c' }} />
          <YAxis tick={{ fontSize: 10, fill: '#78716c' }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #d6ccc2' }}
            formatter={(value: number) => [`${value} óra`, 'Napsütés']}
          />
          <Bar dataKey="sunshineHours" radius={[3, 3, 0, 0]}>
            {chartData.map((entry, i) => (
              <rect key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function ClimatePanel({ wine }: ClimatePanelProps) {
  const [data, setData] = useState<ClimateProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (!expanded || fetched.current || !wine.vintage || !wine.region) return
    fetched.current = true
    setLoading(true)

    fetch(`/api/climate?region=${encodeURIComponent(wine.region)}&vintage=${wine.vintage}`)
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d.error || 'Hiba'))
        return r.json()
      })
      .then((profile: ClimateProfile) => setData(profile))
      .catch((err) => setError(typeof err === 'string' ? err : 'Időjárási adatok nem elérhetőek'))
      .finally(() => setLoading(false))
  }, [expanded, wine.vintage, wine.region])

  if (!wine.vintage || !wine.region) return null

  if (wine.vintage < 1940) {
    return (
      <p className="text-xs text-stone-400 italic">
        Időjárási adatok 1940 előtt nem elérhetőek.
      </p>
    )
  }

  const badge = data ? BADGE_STYLES[data.climateBadge] : null

  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg bg-stone-50 px-4 py-3 text-left transition-colors hover:bg-stone-100"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-stone-700">
            {wine.region} — {wine.vintage}
          </span>
          {badge && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{ backgroundColor: badge.bg, color: badge.text }}
            >
              {badge.label}
            </span>
          )}
        </div>
        <svg
          className={`h-4 w-4 text-stone-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-3 space-y-5">
          {loading && (
            <p className="text-sm text-stone-400 text-center py-8">Időjárási adatok betöltése...</p>
          )}

          {error && (
            <p className="text-sm text-red-500 text-center py-4">{error}</p>
          )}

          {data && (
            <>
              {/* Summary metrics */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <MetricCard value={data.gdd} unit="°C" label="Growing Degree Days" />
                <MetricCard value={data.growingSeasonAvgTemp} unit="°C" label="Tenyészidő átlag" />
                <MetricCard value={data.growingSeasonSunshineHours} unit="h" label="Napsütés (tenyészidő)" />
                <MetricCard value={data.growingSeasonPrecipitation} unit="mm" label="Csapadék (tenyészidő)" />
              </div>

              {/* Global context scales */}
              <div className="space-y-3 rounded-lg bg-stone-50/50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500 mb-2">Globális borvidék skála</p>
                <ClimateScale
                  label="Hőmérséklet" value={data.growingSeasonAvgTemp} unit="°C"
                  {...GLOBAL_RANGES.temperature}
                  gradient="linear-gradient(to right, #4ade80, #a3e635, #facc15, #f97316, #dc2626)"
                  markerColor="#991b1b"
                />
                <ClimateScale
                  label="Napsütés" value={data.growingSeasonSunshineHours} unit="h"
                  {...GLOBAL_RANGES.sunshine}
                  gradient="linear-gradient(to right, #fef9c3, #fde047, #f59e0b, #ea580c)"
                  markerColor="#9a3412"
                />
                <ClimateScale
                  label="Csapadék" value={data.growingSeasonPrecipitation} unit="mm"
                  {...GLOBAL_RANGES.precipitation}
                  gradient="linear-gradient(to right, #fde047, #86efac, #38bdf8, #2563eb)"
                  markerColor="#1e40af"
                />
              </div>

              {/* Charts */}
              <TemperatureChart data={data.monthlyData} growingMonths={data.growingSeasonMonths} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <PrecipitationChart data={data.monthlyData} growingMonths={data.growingSeasonMonths} />
                <SunshineChart data={data.monthlyData} growingMonths={data.growingSeasonMonths} />
              </div>

              {/* Risk indicators + harvest */}
              <div className="flex flex-wrap gap-2">
                {data.frostDays > 0 && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {data.frostDays} fagynap
                  </span>
                )}
                {data.heatSpikeDays > 0 && (
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                    {data.heatSpikeDays} hőségnap (&gt;35°C)
                  </span>
                )}
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                  Szüret: {data.harvestAvgTemp}°C átlag, {data.harvestPrecipitation} mm csapadék
                </span>
              </div>

              <p className="text-[10px] text-stone-400">
                Adatok: Open-Meteo.com | {data.location.name} ({data.location.lat.toFixed(2)}°, {data.location.lon.toFixed(2)}°)
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
