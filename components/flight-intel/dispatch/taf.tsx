'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Calendar,
  RefreshCw,
  Copy,
  CheckCircle,
  MapPin,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '@/components/input/Standard'
import { Label } from '@/components/label/Standard'
import { Button } from '@/components/buttons/Standard'

// --- TAF Types ---
interface TafTimeInfo {
  issue: string
  valid: string
}

interface TafWind {
  text: string | null
}

interface TafVisibility {
  text: string | null
}

interface TafCloudLayer {
  type: string
  height: number
  text: string
}

interface TafClouds {
  ceiling: number | null
  text: string
}

interface TafPeriod {
  type: 'MAIN' | 'FM' | 'TEMPO' | 'BECMG'
  time: string
  raw: string
  wind: TafWind
  visibility: TafVisibility | null
  clouds: TafClouds
  weather: string | null
}

// --- Props Interface ---
interface TafProps {
  currentState: {
    dep?: string
    arr?: string
    alternate?: string
    tafDep?: string
    tafArr?: string
    tafAlternate?: string
  }
  onStateUpdate: (newState: {
    tafDep: string
    tafArr: string
    tafAlternate: string
    dep?: string
    arr?: string
    alternate?: string
  }) => void
}

type TafCardType = 'dep' | 'arr' | 'alternate'

// --- Parsing Functions ---
function parseTafTime(raw: string): TafTimeInfo | null {
  const issueMatch = raw.match(/\b(\d{6})Z\b/)
  if (!issueMatch) return null

  const validityMatch = raw.match(/\b(\d{4})\/(\d{4})\b/)

  const issue = issueMatch[1]
  const issueText = `Day ${issue.slice(0, 2)} at ${issue.slice(2, 4)}:${issue.slice(4, 6)}Z`

  if (validityMatch) {
    const from = validityMatch[1]
    const to = validityMatch[2]

    return {
      issue: issueText,
      valid: `${from.slice(0, 2)}:${from.slice(2, 4)}Z to ${to.slice(
        0,
        2
      )}:${to.slice(2, 4)}Z`,
    }
  }

  return {
    issue: issueText,
    valid: '—',
  }
}

function parseTafWind(period: string): TafWind {
  const m = period.match(/\b(\d{3}|VRB)(\d{2,3})(G(\d{2,3}))?KT\b/)

  if (!m) return { text: null }

  const dir = m[1] === 'VRB' ? null : Number(m[1])
  const spd = Number(m[2])
  const gust = m[4] ? Number(m[4]) : null

  const base =
    dir == null
      ? `VRB ${spd} kt`
      : `${String(dir).padStart(3, '0')}° / ${spd} kt`

  return {
    text: gust ? `${base} (gust ${gust} kt)` : base,
  }
}

function parseTafVisibility(period: string): TafVisibility {
  const us = period.match(/\b(P?\d+|\d+\s\d\/\d|\d\/\d)\s?SM\b/)

  if (us) {
    const value = us[1].replace(/\s/g, '')

    return {
      text: value.startsWith('P')
        ? `More than ${value.replace('P', '')} statute miles`
        : `${value} statute miles`,
    }
  }

  const intl = period.match(/\b(\d{4})\b/)

  if (intl) {
    const meters = Number(intl[1])

    if (!Number.isNaN(meters) && meters <= 10000) {
      return {
        text: meters === 9999 ? '10 km or more' : `${meters} meters`,
      }
    }
  }

  if (/\bCAVOK\b/.test(period)) {
    return {
      text: '10 km or more (CAVOK)',
    }
  }

  return { text: null }
}

function parseTafClouds(period: string): TafClouds {
  const matches = [
    ...period.matchAll(/\b(FEW|SCT|BKN|OVC|VV)(\d{3})(CB|TCU)?\b/g),
  ]

  if (!matches.length) {
    return {
      ceiling: null,
      text: 'Clear',
    }
  }

  const parts: TafCloudLayer[] = matches.map((m) => {
    const type = m[1]
    const h = Number(m[2]) * 100

    const label =
      type === 'FEW'
        ? 'Few'
        : type === 'SCT'
        ? 'Scattered'
        : type === 'BKN'
        ? 'Broken'
        : type === 'OVC'
        ? 'Overcast'
        : type === 'VV'
        ? 'Vert. Vis'
        : type

    return {
      type,
      height: h,
      text: `${label} at ${h} ft`,
    }
  })

  const ceilingLayer = parts.find((p) => ['BKN', 'OVC', 'VV'].includes(p.type))
  const text = parts.map((p) => p.text).join(', ')

  return {
    ceiling: ceilingLayer?.height || null,
    text,
  }
}

function parseTafWeather(period: string): string | null {
  const weatherCodes = [
    { code: 'TS', meaning: 'Thunderstorm' },
    { code: 'SH', meaning: 'Shower' },
    { code: 'RA', meaning: 'Rain' },
    { code: 'SN', meaning: 'Snow' },
    { code: 'FG', meaning: 'Fog' },
    { code: 'BR', meaning: 'Mist' },
    { code: 'HZ', meaning: 'Haze' },
    { code: 'FU', meaning: 'Smoke' },
    { code: 'VA', meaning: 'Volcanic Ash' },
  ]

  const matches =
    period.match(/\b(\+|-)?(TS|SH|RA|SN|FG|BR|HZ|FU|VA)(\w+)?\b/g) || []

  if (!matches.length) return null

  return matches
    .map((code) => {
      const intensity = code.includes('+')
        ? 'Heavy'
        : code.includes('-')
        ? 'Light'
        : 'Moderate'

      const baseCode = weatherCodes.find((w) => code.includes(w.code))

      return baseCode ? `${intensity} ${baseCode.meaning}` : code
    })
    .join(', ')
}

function parseTafPeriods(raw: string): TafPeriod[] {
  const periods: TafPeriod[] = []

  const cleanedRaw = raw
    .replace(/^TAF\s+/, '')
    .replace(/^AMD\s+/, '')
    .replace(/^COR\s+/, '')
    .trim()

  const lines = cleanedRaw.split(/\s+(?=FM\d{6}|TEMPO|BECMG)/)

  let currentPeriod: Partial<TafPeriod> = {}

  lines.forEach((line, index) => {
    const fmMatch = line.match(/FM(\d{6})/)

    if (fmMatch) {
      if (Object.keys(currentPeriod).length > 0) {
        periods.push(currentPeriod as TafPeriod)
      }

      const fm = fmMatch[1]

      currentPeriod = {
        type: 'FM',
        time: `Day ${fm.slice(0, 2)} at ${fm.slice(2, 4)}:${fm.slice(4, 6)}Z`,
        raw: line,
      }

      return
    }

    const tempoMatch = line.match(/\bTEMPO\b/)

    if (tempoMatch) {
      if (Object.keys(currentPeriod).length > 0) {
        periods.push(currentPeriod as TafPeriod)
      }

      currentPeriod = {
        type: 'TEMPO',
        time: 'Temporary',
        raw: line,
      }

      return
    }

    const becmgMatch = line.match(/\bBECMG\b/)

    if (becmgMatch) {
      if (Object.keys(currentPeriod).length > 0) {
        periods.push(currentPeriod as TafPeriod)
      }

      currentPeriod = {
        type: 'BECMG',
        time: 'Becoming',
        raw: line,
      }

      return
    }

    if (index === 0) {
      currentPeriod = {
        type: 'MAIN',
        time: 'Main',
        raw: line,
      }
    } else {
      currentPeriod.raw = `${currentPeriod.raw ?? ''} ${line}`.trim()
    }
  })

  if (Object.keys(currentPeriod).length > 0) {
    periods.push(currentPeriod as TafPeriod)
  }

  return periods.map((period) => ({
    ...period,
    wind: parseTafWind(period.raw),
    visibility: parseTafVisibility(period.raw),
    clouds: parseTafClouds(period.raw),
    weather: parseTafWeather(period.raw),
  }))
}

function getTafFlightCategory(
  visText: string | null,
  ceilingFt: number | null
): string {
  let vis = 10

  if (visText?.includes('km')) {
    vis = 6
  } else {
    const match = visText?.match(/(\d+(\.\d+)?)/)

    if (match) {
      vis = parseFloat(match[1])
    }
  }

  const c = ceilingFt ?? 99999

  if (vis >= 5 && c >= 3000) return 'VFR'
  if (vis >= 3 && c >= 1000) return 'MVFR'
  if (vis >= 1 && c >= 500) return 'IFR'

  return 'LIFR'
}

// --- Dark-themed UI Components ---
interface TafPeriodCardProps {
  period: TafPeriod
  isFirst?: boolean
}

function TafPeriodCard({ period, isFirst = false }: TafPeriodCardProps) {
  const flightCat = getTafFlightCategory(
    period.visibility?.text ?? null,
    period.clouds.ceiling
  )

  const getPeriodTypeStyle = (type: string) => {
    switch (type) {
      case 'MAIN':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30'
      case 'FM':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'TEMPO':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'BECMG':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
    }
  }

  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case 'VFR':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'MVFR':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30'
      case 'IFR':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'LIFR':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
    }
  }

  return (
    <div
      className={`bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 ${
        !isFirst ? 'mt-3' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPeriodTypeStyle(
              period.type
            )}`}
          >
            {period.type === 'MAIN'
              ? 'Main Forecast'
              : period.type === 'FM'
              ? `From ${period.time}`
              : period.type}
          </span>

          <Clock className="w-3 h-3 text-zinc-500" />

          <span className="text-sm text-zinc-400">{period.time}</span>
        </div>

        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryStyle(
            flightCat
          )}`}
        >
          {flightCat}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-zinc-500">Wind:</span>
          <span className="ml-2 text-zinc-200 font-mono">
            {period.wind.text || '—'}
          </span>
        </div>

        <div>
          <span className="text-zinc-500">Visibility:</span>
          <span className="ml-2 text-zinc-200">
            {period.visibility?.text || '—'}
          </span>
        </div>

        <div>
          <span className="text-zinc-500">Clouds:</span>
          <span className="ml-2 text-zinc-200">{period.clouds.text || '—'}</span>
        </div>

        <div>
          <span className="text-zinc-500">Weather:</span>
          <span className="ml-2 text-zinc-200">{period.weather || '—'}</span>
        </div>
      </div>

      {period.clouds.ceiling && (
        <div className="mt-2 text-xs text-zinc-500">
          Ceiling: {period.clouds.ceiling} ft
        </div>
      )}
    </div>
  )
}

interface TafCardProps {
  title: string
  icao: string
  taf: string
  type: TafCardType
  copied: TafCardType | null
  accentClass: string
  iconClass: string
  onCopy: (text: string, type: TafCardType) => void
  renderTafAnalysis: (taf: string) => React.ReactNode
}

function TafCard({
  title,
  icao,
  taf,
  type,
  copied,
  accentClass,
  iconClass,
  onCopy,
  renderTafAnalysis,
}: TafCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:border-zinc-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${accentClass}`}
          >
            <Calendar className={`w-5 h-5 ${iconClass}`} />
          </div>

          <div>
            <h3 className="text-lg font-medium text-white">{title}</h3>
            <p className="text-zinc-500 text-sm">{icao || '—'}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCopy(taf, type)}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          {copied === type ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Raw TAF */}
      <div className="mb-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm">
          <code className="text-emerald-400 select-all whitespace-pre-wrap">
            {taf || '—'}
          </code>
        </div>
      </div>

      {taf &&
        taf !== '—' &&
        taf !== 'Invalid ICAO' &&
        renderTafAnalysis(taf)}
    </div>
  )
}

// --- Main TAF Component ---
export function Taf({ currentState, onStateUpdate }: TafProps) {
  const [dep, setDep] = useState(currentState.dep ?? '')
  const [arr, setArr] = useState(currentState.arr ?? '')
  const [alternate, setAlternate] = useState(currentState.alternate ?? '')

  const [tafDep, setTafDep] = useState(currentState.tafDep ?? '')
  const [tafArr, setTafArr] = useState(currentState.tafArr ?? '')
  const [tafAlternate, setTafAlternate] = useState(
    currentState.tafAlternate ?? ''
  )

  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<TafCardType | null>(null)

  // Sync with props
  useEffect(() => {
    setDep(currentState.dep ?? '')
    setArr(currentState.arr ?? '')
    setAlternate(currentState.alternate ?? '')

    setTafDep(currentState.tafDep ?? '')
    setTafArr(currentState.tafArr ?? '')
    setTafAlternate(currentState.tafAlternate ?? '')
  }, [currentState])

  // Propagate changes upward
  useEffect(() => {
    onStateUpdate({
      tafDep,
      tafArr,
      tafAlternate,
      dep,
      arr,
      alternate,
    })
  }, [tafDep, tafArr, tafAlternate, dep, arr, alternate, onStateUpdate])

  const fetchSingleTaf = async (icao: string) => {
    const response = await fetch(`/api/skylink/taf?icao=${icao}`)

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      console.error(`Failed to fetch TAF for ${icao}:`, data)

      throw new Error(
        data?.error || data?.details || `Failed to fetch TAF for ${icao}`
      )
    }

    return data.full ?? data.raw ?? '—'
  }

  const fetchTafs = useCallback(async () => {
    setLoading(true)

    try {
      const cleanDep = (dep ?? '').trim().toUpperCase()
      const cleanArr = (arr ?? '').trim().toUpperCase()
      const cleanAlternate = (alternate ?? '').trim().toUpperCase()

      const isValidIcao = (icao: string) => /^[A-Z]{4}$/.test(icao)

      if (!isValidIcao(cleanDep)) {
        setTafDep('Invalid ICAO')
        return
      }

      if (!isValidIcao(cleanArr)) {
        setTafArr('Invalid ICAO')
        return
      }

      if (cleanAlternate && !isValidIcao(cleanAlternate)) {
        setTafAlternate('Invalid ICAO')
        return
      }

      const [departureTaf, arrivalTaf, alternateTaf] = await Promise.all([
        fetchSingleTaf(cleanDep),
        fetchSingleTaf(cleanArr),
        cleanAlternate ? fetchSingleTaf(cleanAlternate) : Promise.resolve('—'),
      ])

      setTafDep(departureTaf)
      setTafArr(arrivalTaf)
      setTafAlternate(alternateTaf)
    } catch (error) {
      console.error('TAF fetch error:', error)
      setTafDep('—')
      setTafArr('—')
      setTafAlternate('—')
    } finally {
      setLoading(false)
    }
  }, [dep, arr, alternate])

  const copyToClipboard = (text: string, type: TafCardType) => {
    navigator.clipboard.writeText(text || '')
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDepChange = (value: string) => {
    setDep(value.toUpperCase())
  }

  const handleArrChange = (value: string) => {
    setArr(value.toUpperCase())
  }

  const handleAlternateChange = (value: string) => {
    setAlternate(value.toUpperCase())
  }

  const renderTafAnalysis = (taf: string) => {
    if (!taf || taf === '—' || taf === 'Invalid ICAO') return null

    const time = parseTafTime(taf)
    const periods = parseTafPeriods(taf)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-zinc-200">
            Forecast Analysis
          </h4>

          {time && (
            <div className="text-sm text-zinc-400">
              <div>Issued: {time.issue}</div>
              <div>Valid: {time.valid}</div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {periods.map((period, index) => (
            <TafPeriodCard key={index} period={period} isFirst={index === 0} />
          ))}
        </div>

        {periods.some((p) => p.type === 'TEMPO') && (
          <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4" />
            Temporary changes expected during forecast period
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-sky-500/20 rounded-2xl flex items-center justify-center border border-sky-500/30">
          <Calendar className="w-6 h-6 text-sky-400" />
        </div>

        <div>
          <h2 className="text-3xl font-light text-white">
            Terminal Aerodrome Forecast
          </h2>
          <p className="text-zinc-400">
            Aviation weather forecasts for departure, arrival, and alternate
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-3">
            <Label
              htmlFor="taf-dep"
              className="text-zinc-300 font-medium flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-sky-400" />
              Departure ICAO
            </Label>

            <Input
              id="taf-dep"
              value={dep}
              onChange={(e) => handleDepChange(e.target.value)}
              maxLength={4}
              placeholder="OPIS"
              className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-sky-500/20"
            />
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="taf-arr"
              className="text-zinc-300 font-medium flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              Arrival ICAO
            </Label>

            <Input
              id="taf-arr"
              value={arr}
              onChange={(e) => handleArrChange(e.target.value)}
              maxLength={4}
              placeholder="EGLL"
              className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-sky-500/20"
            />
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="taf-alternate"
              className="text-zinc-300 font-medium flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-purple-400" />
              Alternate ICAO
            </Label>

            <Input
              id="taf-alternate"
              value={alternate}
              onChange={(e) => handleAlternateChange(e.target.value)}
              maxLength={4}
              placeholder="OMDB"
              className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-sky-500/20"
            />
          </div>

          <div className="flex items-end gap-3">
            <Button
              onClick={fetchTafs}
              disabled={loading}
              size="lg"
              className="flex-1 group bg-sky-500 hover:bg-sky-600 text-white rounded-full px-6 py-3 transition-all duration-[650ms] hover:scale-[1.02] disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 mr-2 transition-transform duration-500 ${
                  loading ? 'animate-spin' : 'group-hover:rotate-180'
                }`}
              />

              {loading ? 'Loading…' : 'Fetch TAF'}
            </Button>
          </div>
        </div>
      </div>

      {/* TAF Display Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <TafCard
          title="Departure TAF"
          icao={dep}
          taf={tafDep}
          type="dep"
          copied={copied}
          accentClass="bg-sky-500/20 border-sky-500/30"
          iconClass="text-sky-400"
          onCopy={copyToClipboard}
          renderTafAnalysis={renderTafAnalysis}
        />

        <TafCard
          title="Arrival TAF"
          icao={arr}
          taf={tafArr}
          type="arr"
          copied={copied}
          accentClass="bg-emerald-500/20 border-emerald-500/30"
          iconClass="text-emerald-400"
          onCopy={copyToClipboard}
          renderTafAnalysis={renderTafAnalysis}
        />

        <TafCard
          title="Alternate TAF"
          icao={alternate}
          taf={tafAlternate}
          type="alternate"
          copied={copied}
          accentClass="bg-purple-500/20 border-purple-500/30"
          iconClass="text-purple-400"
          onCopy={copyToClipboard}
          renderTafAnalysis={renderTafAnalysis}
        />
      </div>
    </motion.div>
  )
}