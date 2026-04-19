'use client'

import { useState } from 'react'
import { FileText, RefreshCw, Copy, CheckCircle, AlertTriangle, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { Label } from '@/components/label/Standard'
import { Button } from '@/components/buttons/Standard'
import { Textarea } from '@/components/textArea/Standard'
import { transformPirepData, validatePirepData } from '@/components/lib/pdf-export/dispatch/pdf-export-dispatch'

// --- Type definitions (unchanged) ---
interface TurbulenceData {
  severity?: string
  frequency?: string
  min_alt?: number
  max_alt?: number
}

interface IcingData {
  severity?: string
  type?: string
  min_alt?: number
  max_alt?: number
}

interface WindData {
  direction?: number
  speed?: number
  gust?: number
}

export interface PirepData {
  raw: string
  station?: string
  type?: string
  time?: string
  latitude?: number
  longitude?: number
  altitude?: number
  flight_level?: number
  aircraft?: string
  turbulence?: TurbulenceData | null
  icing?: IcingData | null
  wx_string?: string
  temp?: number
  wind?: WindData | null
  remarks?: string
}

interface PirepProps {
  onPirepUpdate?: (data: PirepData | null) => void
}

// --- Helper functions (unchanged) ---
const safeFormatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'string') return value

  if (typeof value === 'object') {
    try {
      if ('severity' in value || 'frequency' in value || 'min_alt' in value || 'max_alt' in value) {
        const turb = value as TurbulenceData
        const parts = []
        if (turb.severity) parts.push(turb.severity)
        if (turb.frequency) parts.push(turb.frequency)
        if (turb.min_alt !== undefined && turb.max_alt !== undefined) {
          parts.push(`${turb.min_alt}-${turb.max_alt}ft`)
        } else if (turb.min_alt !== undefined) {
          parts.push(`above ${turb.min_alt}ft`)
        } else if (turb.max_alt !== undefined) {
          parts.push(`below ${turb.max_alt}ft`)
        }
        return parts.join(' ') || '—'
      }

      if ('type' in value) {
        const icing = value as IcingData
        const parts = []
        if (icing.severity) parts.push(icing.severity)
        if (icing.type) parts.push(icing.type)
        if (icing.min_alt !== undefined && icing.max_alt !== undefined) {
          parts.push(`${icing.min_alt}-${icing.max_alt}ft`)
        } else if (icing.min_alt !== undefined) {
          parts.push(`above ${icing.min_alt}ft`)
        } else if (icing.max_alt !== undefined) {
          parts.push(`below ${icing.max_alt}ft`)
        }
        return parts.join(' ') || '—'
      }

      if ('direction' in value || 'speed' in value) {
        const wind = value as WindData
        const parts = []
        if (wind.direction !== undefined) parts.push(`${wind.direction}°`)
        if (wind.speed !== undefined) parts.push(`${wind.speed}kt`)
        if (wind.gust !== undefined) parts.push(`G${wind.gust}`)
        return parts.join('/') || '—'
      }

      return JSON.stringify(value)
    } catch {
      return '[Object]'
    }
  }

  return String(value)
}

// --- Main Component ---
export function Pirep({ onPirepUpdate }: PirepProps) {
  const [raw, setRaw] = useState('IMM UA /OV 2IS/TM 2258/FL055/TP P28A/TB NEG BLO 055/RM DURC')
  const [pirep, setPirep] = useState<PirepData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleParse = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔄 Sending PIREP for parsing:', raw)

      const resP = await fetch('/api/avwx?type=parse_pirep', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: raw,
      })

      if (!resP.ok) {
        const errorText = await resP.text()
        console.error('❌ PIREP parse failed:', resP.status, resP.statusText, errorText)
        throw new Error(`PIREP parse failed: ${resP.status} ${resP.statusText}`)
      }

      const apiResponse = await resP.json()
      console.log('✅ Received API response:', apiResponse)

      if (!apiResponse || typeof apiResponse !== 'object') {
        throw new Error('Invalid PIREP response format from server')
      }

      const transformedData = transformPirepData(apiResponse, raw)
      console.log('🔄 Transformed PIREP data:', transformedData)

      if (!validatePirepData(transformedData)) {
        throw new Error('PIREP data transformation failed - invalid structure')
      }

      const cleanedData: PirepData = {
        raw: transformedData.raw,
        station: transformedData.station,
        type: transformedData.type,
        time: transformedData.time,
        latitude: transformedData.latitude,
        longitude: transformedData.longitude,
        altitude: transformedData.altitude,
        flight_level: transformedData.flight_level,
        aircraft: transformedData.aircraft,
        wx_string: transformedData.wx_string,
        temp: transformedData.temp,
        remarks: transformedData.remarks,
        turbulence: transformedData.turbulence
          ? {
              severity: transformedData.turbulence.severity,
              frequency: transformedData.turbulence.frequency,
              min_alt: transformedData.turbulence.min_alt,
              max_alt: transformedData.turbulence.max_alt,
            }
          : null,
        icing: transformedData.icing
          ? {
              severity: transformedData.icing.severity,
              type: transformedData.icing.type,
              min_alt: transformedData.icing.min_alt,
              max_alt: transformedData.icing.max_alt,
            }
          : null,
        wind: transformedData.wind
          ? {
              direction: transformedData.wind.direction,
              speed: transformedData.wind.speed,
              gust: transformedData.wind.gust,
            }
          : null,
      }

      setPirep(cleanedData)

      if (onPirepUpdate) {
        console.log('📤 Sending cleaned PIREP data to parent:', cleanedData)
        onPirepUpdate(cleanedData)
      }

      console.log('✅ PIREP parsing completed successfully!')
    } catch (err: unknown) {
      console.error('❌ PIREP parsing error:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unknown error occurred while parsing PIREP')
      }

      setPirep(null)
      if (onPirepUpdate) {
        onPirepUpdate(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderTableSection = (title: string, data: Record<string, unknown>) => {
    const entries = Object.entries(data).filter(([, value]) => value != null)
    if (entries.length === 0) return null

    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 text-white border-b border-zinc-800 pb-2">
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700"
            >
              <div className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-white font-medium mt-1">
                {safeFormatValue(value)}
              </div>
            </div>
          ))}
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-500/20 rounded-2xl flex items-center justify-center border border-sky-500/30">
            <FileText className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h2 className="text-3xl font-light text-white">PIREP Parser</h2>
            <p className="text-zinc-400">Parse and analyze Pilot Reports</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setRaw('IMM UA /OV 2IS/TM 2258/FL055/TP P28A/TB NEG BLO 055/RM DURC')
            setPirep(null)
            if (onPirepUpdate) onPirepUpdate(null)
          }}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <Copy className="w-4 h-4 mr-2" />
          Reset Demo
        </Button>
      </div>

      {/* Input Section */}
      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
        <div className="space-y-4">
          <Label htmlFor="pirep-input" className="text-zinc-300 font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            PIREP Text
          </Label>
          <Textarea
            id="pirep-input"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Enter PIREP text here..."
            className="min-h-[120px] bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-sky-500/20"
          />

          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-500">
              Enter raw PIREP data to parse and analyze
            </div>
            <Button
              onClick={handleParse}
              disabled={loading}
              size="lg"
              className="group bg-sky-500 hover:bg-sky-600 text-white rounded-full px-6 py-3 transition-all duration-[650ms] hover:scale-[1.02] disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 mr-2 transition-transform duration-500 ${
                  loading ? 'animate-spin' : 'group-hover:rotate-180'
                }`}
              />
              {loading ? 'Processing...' : 'Parse PIREP'}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-rose-300 mt-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-300 text-sm mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Results Section */}
      {pirep && (
        <div className="space-y-6">
          {/* Raw PIREP Display */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:border-zinc-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
                  <FileText className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Raw PIREP</h3>
                  <p className="text-zinc-500 text-sm">Original input text</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(pirep.raw)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm">
              <code className="text-emerald-400 select-all whitespace-pre-wrap">
                {pirep.raw}
              </code>
            </div>
          </div>

          {/* Parsed Data */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:border-zinc-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center border border-sky-500/30">
                  <MapPin className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Parsed PIREP Data</h3>
                  <p className="text-zinc-500 text-sm">Detailed analysis of the PIREP report</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              {renderTableSection('Basic Information', {
                station: pirep.station,
                type: pirep.type,
                time: pirep.time,
              })}

              {/* Location & Altitude */}
              {renderTableSection('Location & Altitude', {
                latitude: pirep.latitude,
                longitude: pirep.longitude,
                altitude: pirep.altitude,
                flight_level: pirep.flight_level,
              })}

              {/* Aircraft & Conditions */}
              {renderTableSection('Aircraft & Conditions', {
                aircraft: pirep.aircraft,
                turbulence: pirep.turbulence,
                icing: pirep.icing,
                weather: pirep.wx_string,
                temperature: pirep.temp,
                wind: pirep.wind,
              })}

              {/* Remarks */}
              {pirep.remarks && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3 text-white border-b border-zinc-800 pb-2">
                    Remarks
                  </h3>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-amber-300">{pirep.remarks}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Raw JSON (collapsible) */}
              <details className="mt-8 border border-zinc-800 rounded-lg">
                <summary className="p-4 cursor-pointer bg-zinc-800/50 hover:bg-zinc-800 font-medium text-white rounded-lg">
                  View Raw JSON Data
                </summary>
                <div className="p-4 border-t border-zinc-800">
                  <div className="bg-zinc-950 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-emerald-400 text-sm">
                      {JSON.stringify(pirep, null, 2)}
                    </pre>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!pirep && !loading && !error && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No PIREP Data</h3>
          <p className="text-zinc-500">Enter a PIREP above to parse and analyze the data</p>
        </div>
      )}
    </motion.div>
  )
}