'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plane,
  RefreshCw,
  Cloud,
  Copy,
  CheckCircle,
  MapPin,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '@/components/input/Standard'
import { Label } from '@/components/label/Standard'
import { Button } from '@/components/buttons/Standard'

// --- Helper Parsers (unchanged) ---
function parseStation(raw: string) {
  const token = raw.trim().split(/\s+/)[0]
  return /^[A-Z]{4}$/.test(token) ? token : null
}

function parseTime(raw: string) {
  const m = raw.match(/\b(\d{6})Z\b/)
  if (!m) return null
  const t = m[1]
  return {
    text: `Day ${t.slice(0, 2)} at ${t.slice(2, 4)}:${t.slice(4, 6)}Z`,
  }
}

function parseWind(raw: string) {
  const m = raw.match(/\b(\d{3}|VRB)(\d{2,3})(G(\d{2,3}))?KT\b/)
  if (!m) return { text: null }
  const dir = m[1] === 'VRB' ? null : Number(m[1])
  const spd = Number(m[2])
  const gust = m[4] ? Number(m[4]) : null
  const base = dir == null ? `VRB ${spd} kt` : `${String(dir).padStart(3, '0')}° / ${spd} kt`
  return { text: gust ? `${base} (gust ${gust} kt)` : base }
}

function parseVisibility(raw: string) {
  const us = raw.match(/\b((\d+\s)?\d\/\d|\d+)\s?SM\b/)
  if (us) return { text: `${us[1].replace(/\s/g, '')} statute miles` }
  const intl = raw.match(/\b(\d{4})\b/)
  if (intl) {
    const meters = Number(intl[1])
    if (!Number.isNaN(meters) && meters <= 10000) {
      return { text: meters === 9999 ? '10 km or more' : `${meters} meters` }
    }
  }
  if (/\bCAVOK\b/.test(raw)) return { text: '10 km or more (CAVOK)' }
  return { text: null }
}

function parseClouds(raw: string) {
  const matches = [...raw.matchAll(/\b(FEW|SCT|BKN|OVC|VV)(\d{3})(CB|TCU)?\b/g)]
  if (!matches.length) return { ceiling: null, text: 'Clear' }
  const parts = matches.map((m) => {
    const type = m[1]
    const h = Number(m[2]) * 100
    const label =
      type === 'FEW' ? 'Few' :
      type === 'SCT' ? 'Scattered' :
      type === 'BKN' ? 'Broken' :
      type === 'OVC' ? 'Overcast' :
      type === 'VV' ? 'Vert. Vis' : type
    return { type, height: h, text: `${label} at ${h} ft` }
  })
  const ceilingLayer = parts.find(p => ['BKN', 'OVC', 'VV'].includes(p.type))
  const text = parts.map(p => p.text).join(', ')
  return { ceiling: ceilingLayer?.height || null, text }
}

function parseTempDew(raw: string) {
  const m = raw.match(/\b(M?\d{2})\/(M?\d{2})\b/)
  if (!m) return { text: null }
  const t = Number(m[1].replace('M', '-'))
  const d = Number(m[2].replace('M', '-'))
  return { text: `${t}°C / ${d}°C` }
}

function parsePressure(raw: string) {
  const a = raw.match(/\bA(\d{4})\b/)
  if (a) return { text: `${(Number(a[1]) / 100).toFixed(2)} inHg` }
  const q = raw.match(/\bQ(\d{4})\b/)
  if (q) return { text: `${q[1]} hPa` }
  return { text: null }
}

function parseTrend(raw: string) {
  if (/\bNOSIG\b/.test(raw)) return 'NOSIG'
  const t = raw.match(/\b(TEMPO|BECMG)\b.*?(?=(\s[A-Z]{4}\b)|$)/)
  return t ? t[0] : null
}

function parseRemarks(raw: string) {
  const m = raw.match(/\bRMK\b(.*)$/)
  return m ? m[1].trim() : null
}

function flightCategory(visText: string | null, ceilingFt: number | null) {
  let vis = 10
  if (visText?.includes('km')) vis = 6
  else if (visText?.match(/(\d+)/)) vis = parseFloat(RegExp.$1)
  const c = ceilingFt ?? 99999
  if (vis >= 5 && c >= 3000) return 'VFR'
  if (vis >= 3 && c >= 1000) return 'MVFR'
  if (vis >= 1 && c >= 500) return 'IFR'
  return 'LIFR'
}

// --- UI Helpers (dark themed) ---
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b border-zinc-800 last:border-none hover:bg-zinc-800/50 transition-colors">
      <td className="w-40 px-4 py-3 text-zinc-400 font-medium">{label}</td>
      <td className="px-4 py-3 text-zinc-200">{children}</td>
    </tr>
  )
}

function BadgeCat({ cat }: { cat: string }) {
  const styles =
    cat === 'VFR'
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      : cat === 'MVFR'
      ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
      : cat === 'IFR'
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${styles}`}>
      {cat}
    </span>
  )
}

// --- Props Interface ---
interface MetarProps {
  currentState: {
    dep: string;
    arr: string;
    metarDep: string;
    metarArr: string;
  };
  onStateUpdate: (newState: {
    metarDep: string;
    metarArr: string;
    dep?: string;
    arr?: string;
  }) => void;
}

// --- Main Component ---
export function Metar({ currentState, onStateUpdate }: MetarProps) {
  const [dep, setDep] = useState(currentState.dep)
  const [arr, setArr] = useState(currentState.arr)
  const [metarDep, setMetarDep] = useState(currentState.metarDep)
  const [metarArr, setMetarArr] = useState(currentState.metarArr)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<'dep' | 'arr' | null>(null)

  // Sync with props
  useEffect(() => {
    setDep(currentState.dep)
    setArr(currentState.arr)
    setMetarDep(currentState.metarDep)
    setMetarArr(currentState.metarArr)
  }, [currentState])

  // Propagate changes upward
  useEffect(() => {
    onStateUpdate({
      metarDep,
      metarArr,
      dep,
      arr
    })
  }, [metarDep, metarArr, dep, arr, onStateUpdate])

  const fetchMetars = useCallback(async () => {
    setLoading(true)
    try {
      const [r1, r2] = await Promise.all([
        fetch(`/api/avwx?type=metar&mode=single&icao=${dep}`),
        fetch(`/api/avwx?type=metar&mode=single&icao=${arr}`)
      ])
      const j1 = await r1.json()
      const j2 = await r2.json()
      
      setMetarDep(j1.full)
      setMetarArr(j2.full)
    } catch {
      setMetarDep('—')
      setMetarArr('—')
    } finally {
      setLoading(false)
    }
  }, [dep, arr])

  const copyToClipboard = (text: string, type: 'dep' | 'arr') => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDepChange = (value: string) => {
    setDep(value.toUpperCase())
  }

  const handleArrChange = (value: string) => {
    setArr(value.toUpperCase())
  }

  const renderTable = (metar: string) => {
    const stn = parseStation(metar)
    const time = parseTime(metar)
    const wind = parseWind(metar)
    const vis = parseVisibility(metar)
    const clouds = parseClouds(metar)
    const td = parseTempDew(metar)
    const pres = parsePressure(metar)
    const trend = parseTrend(metar)
    const rmk = parseRemarks(metar)
    const cat = flightCategory(vis?.text ?? null, clouds.ceiling)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-zinc-200">Weather Analysis</h4>
          <BadgeCat cat={cat} />
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              <Row label="Station">
                <span className="font-mono text-sky-400">{stn ?? '—'}</span>
              </Row>
              <Row label="Report Time">{time?.text ?? '—'}</Row>
              <Row label="Wind">
                <span className="font-mono text-zinc-300">{wind.text ?? '—'}</span>
              </Row>
              <Row label="Visibility">{vis?.text ?? '—'}</Row>
              <Row label="Ceiling">
                {clouds.ceiling ? (
                  <span className="text-zinc-300">{clouds.ceiling} ft</span>
                ) : '—'}
              </Row>
              <Row label="Clouds">{clouds.text ?? '—'}</Row>
              <Row label="Temp / Dewpoint">
                <span className="font-mono text-zinc-300">{td.text ?? '—'}</span>
              </Row>
              <Row label="Pressure">{pres.text ?? '—'}</Row>
              <Row label="Trend">
                <span className="font-mono text-amber-400">{trend ?? '—'}</span>
              </Row>
              {rmk && (
                <Row label="Remarks">
                  <span className="text-zinc-500 text-xs">{rmk}</span>
                </Row>
              )}
            </tbody>
          </table>
        </div>
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
          <Plane className="w-6 h-6 text-sky-400" />
        </div>
        <div>
          <h2 className="text-3xl font-light text-white">METAR</h2>
          <p className="text-zinc-400">Real‑time aviation weather data</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Label htmlFor="dep" className="text-zinc-300 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              Departure ICAO
            </Label>
            <Input
              id="dep"
              value={dep}
              onChange={(e) => handleDepChange(e.target.value)}
              maxLength={4}
              placeholder="OPIS"
              className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-sky-500/20"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="arr" className="text-zinc-300 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Arrival ICAO
            </Label>
            <Input
              id="arr"
              value={arr}
              onChange={(e) => handleArrChange(e.target.value)}
              maxLength={4}
              placeholder="EGLL"
              className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-sky-500/20"
            />
          </div>
          <div className="flex items-end gap-3">
            <Button 
              onClick={fetchMetars} 
              disabled={loading}
              size="lg"
              className="flex-1 group bg-sky-500 hover:bg-sky-600 text-white rounded-full px-6 py-3 transition-all duration-[650ms] hover:scale-[1.02] disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 mr-2 transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              {loading ? 'Loading…' : 'Fetch METAR'}
            </Button>
          </div>
        </div>
      </div>

      {/* METAR Display Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Departure */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:border-zinc-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center border border-sky-500/30">
                <Cloud className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Departure Weather</h3>
                <p className="text-zinc-500 text-sm">{dep}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(metarDep, 'dep')}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              {copied === 'dep' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Raw METAR */}
          <div className="mb-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm">
              <code className="text-emerald-400 select-all break-all">
                {metarDep || '—'}
              </code>
            </div>
          </div>

          {metarDep && metarDep !== '—' && renderTable(metarDep)}
        </div>

        {/* Arrival */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:border-zinc-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                <Cloud className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Arrival Weather</h3>
                <p className="text-zinc-500 text-sm">{arr}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(metarArr, 'arr')}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              {copied === 'arr' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Raw METAR */}
          <div className="mb-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm">
              <code className="text-emerald-400 select-all break-all">
                {metarArr || '—'}
              </code>
            </div>
          </div>

          {metarArr && metarArr !== '—' && renderTable(metarArr)}
        </div>
      </div>
    </motion.div>
  )
}