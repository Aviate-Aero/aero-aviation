'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  MapPin,
  RefreshCw,
  Copy,
  CheckCircle,
  Navigation,
  Ruler,
  Phone,
  Building,
  Clock,
  Plane,
  Compass,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '@/components/input/Standard'
import { Label } from '@/components/label/Standard'
import { Button } from '@/components/buttons/Standard'
import type { AirportData } from '@/components/lib/pdf-export/dispatch/pdf-export-dispatch'

// --- Airport Info Types (unchanged) ---
interface AirportInfo {
  icao: string
  iata?: string
  name: string
  city: string
  country: string
  latitude: number
  longitude: number
  elevation_ft: number
  elevation_m: number
  timezone: string
  type: string
}

interface Runway {
  ident1: string
  ident2: string
  length_ft: number
  width_ft: number
  surface: string | null
  bearing1: number
  bearing2: number
}

interface Communication {
  type: string
  frequency: number
}

// --- API Response Types (unchanged) ---
interface ApiRunway {
  ident1?: string
  ident2?: string
  length_ft?: number
  width_ft?: number
  surface?: string | null
  bearing1?: number
  bearing2?: number
}

interface ApiFrequency {
  type?: string
  frequency?: number
}

interface ApiStationResponse {
  icao?: string
  iata?: string
  name?: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  elevation_ft?: number
  elevation_m?: number
  timezone?: string
  type?: string
  runways?: ApiRunway[]
  frequencies?: ApiFrequency[]
  fuel?: string[]
  amenities?: string[]
}

interface ApiResponse {
  station?: ApiStationResponse
  error?: string
}

// --- Icon Prop Type ---
interface IconProps {
  className?: string
}

// --- Dark-themed UI Helpers ---
function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon?: React.ComponentType<IconProps>
}) {
  return (
    <tr className="border-b border-zinc-800 last:border-none hover:bg-zinc-800/50 transition-colors">
      <td className="w-40 px-4 py-3 text-zinc-400 font-medium flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </td>
      <td className="px-4 py-3 text-zinc-200">{value || '—'}</td>
    </tr>
  )
}

function RunwayCard({ runway }: { runway: Runway }) {
  const getSurfaceColor = (surface: string | null) => {
    if (!surface) return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'

    const s = surface.toLowerCase()
    if (s.includes('concrete') || s.includes('paved'))
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    if (s.includes('asphalt'))
      return 'bg-sky-500/20 text-sky-400 border-sky-500/30'
    if (s.includes('grass') || s.includes('turf'))
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    if (s.includes('gravel') || s.includes('dirt'))
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
  }

  const formatSurface = (surface: string | null) => {
    if (!surface) return 'Unknown'
    return surface
  }

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 transition-colors hover:border-zinc-600">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-medium text-white">
              {runway.ident1 || '—'}
            </span>
            <Compass className="w-4 h-4 text-zinc-500" />
            <span className="font-mono text-lg font-medium text-white">
              {runway.ident2 || '—'}
            </span>
          </div>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSurfaceColor(
            runway.surface
          )}`}
        >
          {formatSurface(runway.surface)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-zinc-500" />
          <span className="text-zinc-400">Length:</span>
          <span className="text-zinc-200 font-medium">
            {runway.length_ft ? `${runway.length_ft.toLocaleString()} ft` : '—'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-zinc-500" />
          <span className="text-zinc-400">Width:</span>
          <span className="text-zinc-200 font-medium">
            {runway.width_ft ? `${runway.width_ft} ft` : '—'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-zinc-500" />
          <span className="text-zinc-400">Heading 1:</span>
          <span className="text-zinc-200 font-mono">
            {runway.bearing1 ? `${runway.bearing1}°` : '—'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-zinc-500" />
          <span className="text-zinc-400">Heading 2:</span>
          <span className="text-zinc-200 font-mono">
            {runway.bearing2 ? `${runway.bearing2}°` : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

function CommunicationCard({ comm }: { comm: Communication }) {
  const getCommTypeStyle = (type: string) => {
    if (!type) return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'

    const t = type.toLowerCase()
    if (t.includes('tower')) return 'bg-sky-500/20 text-sky-400 border-sky-500/30'
    if (t.includes('ground')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    if (t.includes('approach')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    if (t.includes('departure')) return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    if (t.includes('atis')) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
  }

  const formatFrequency = (freq: number) => {
    return freq ? (freq / 1000).toFixed(3) : '—'
  }

  return (
    <div className="flex items-center justify-between bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 transition-colors hover:border-zinc-600">
      <div className="flex items-center gap-3">
        <Phone className="w-4 h-4 text-zinc-500" />
        <span className="text-zinc-200 font-medium">{comm.type || 'Unknown'}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-zinc-300">{formatFrequency(comm.frequency)}</span>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCommTypeStyle(
            comm.type
          )}`}
        >
          {comm.type || 'Unknown'}
        </span>
      </div>
    </div>
  )
}

// --- Main Airport Info Component ---
interface AirportInfoProps {
  onAirportDataUpdate?: (data: AirportData | undefined) => void
}

export function AirportInfo({ onAirportDataUpdate }: AirportInfoProps) {
  const [icao, setIcao] = useState('EGLL')
  const [airportData, setAirportData] = useState<AirportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAirportInfo = useCallback(async () => {
    if (!icao || icao.length < 3) {
      setError('Please enter a valid ICAO code (3-4 characters)')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/avwx?type=station&mode=info&icao=${icao.toUpperCase()}`)
      const data: ApiResponse = await response.json()

      if (data.error) {
        setError(data.error)
        setAirportData(null)
        if (onAirportDataUpdate) {
          onAirportDataUpdate(undefined)
        }
        return
      }

      if (!data.station) {
        setError('No airport data found for this ICAO code')
        setAirportData(null)
        if (onAirportDataUpdate) {
          onAirportDataUpdate(undefined)
        }
        return
      }

      const station = data.station
      const airportData: AirportData = {
        info: {
          icao: station.icao || icao.toUpperCase(),
          iata: station.iata || undefined,
          name: station.name || 'Unknown Airport',
          city: station.city || 'Unknown',
          country: station.country || 'Unknown',
          latitude: station.latitude || 0,
          longitude: station.longitude || 0,
          elevation_ft: station.elevation_ft || 0,
          elevation_m: station.elevation_m || 0,
          timezone: station.timezone || 'Unknown',
          type: station.type || 'Unknown',
        },
        runways: (station.runways || []).map((rw: ApiRunway) => ({
          ident1: rw.ident1 || '—',
          ident2: rw.ident2 || '—',
          length_ft: rw.length_ft || 0,
          width_ft: rw.width_ft || 0,
          surface: rw.surface || null,
          bearing1: rw.bearing1 || 0,
          bearing2: rw.bearing2 || 0,
        })),
        communications: (station.frequencies || []).map((freq: ApiFrequency) => ({
          type: freq.type || 'Unknown',
          frequency: freq.frequency || 0,
        })),
        services: {
          fuel: station.fuel || [],
          amenities: station.amenities || [],
        },
      }

      setAirportData(airportData)

      if (onAirportDataUpdate) {
        onAirportDataUpdate(airportData)
      }
    } catch {
      setError('Failed to fetch airport information')
      setAirportData(null)
      if (onAirportDataUpdate) {
        onAirportDataUpdate(undefined)
      }
    } finally {
      setLoading(false)
    }
  }, [icao, onAirportDataUpdate])

  useEffect(() => {
    fetchAirportInfo()
  }, [fetchAirportInfo])

  const copyToClipboard = () => {
    if (!airportData) return

    const text = `Airport: ${airportData.info.icao} - ${airportData.info.name}
Location: ${airportData.info.city}, ${airportData.info.country}
Elevation: ${airportData.info.elevation_ft} ft
Runways: ${airportData.runways.map((rw) => `${rw.ident1}/${rw.ident2} (${rw.length_ft}ft)`).join(', ')}`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatCoordinates = (lat: number, lon: number) => {
    if (!lat || !lon) return '—'
    const latDir = lat >= 0 ? 'N' : 'S'
    const lonDir = lon >= 0 ? 'E' : 'W'
    return `${Math.abs(lat).toFixed(4)}°${latDir} ${Math.abs(lon).toFixed(4)}°${lonDir}`
  }

  const getAirportTypeStyle = (type: string) => {
    if (!type) return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'

    const t = type.toLowerCase()
    if (t.includes('large'))
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    if (t.includes('medium'))
      return 'bg-sky-500/20 text-sky-400 border-sky-500/30'
    if (t.includes('small'))
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    if (t.includes('heliport'))
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
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
          <Building className="w-6 h-6 text-sky-400" />
        </div>
        <div>
          <h2 className="text-3xl font-light text-white">Airport Information</h2>
          <p className="text-zinc-400">Complete airport details and facilities</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-3 md:col-span-3">
            <Label htmlFor="airport-icao" className="text-zinc-300 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              Airport ICAO Code
            </Label>
            <Input
              id="airport-icao"
              value={icao}
              onChange={(e) => setIcao(e.target.value.toUpperCase())}
              maxLength={4}
              placeholder="EGLL"
              className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-sky-500/20"
            />
          </div>
          <div className="flex items-end gap-3">
            <Button
              onClick={fetchAirportInfo}
              disabled={loading}
              size="lg"
              className="flex-1 group bg-sky-500 hover:bg-sky-600 text-white rounded-full px-6 py-3 transition-all duration-[650ms] hover:scale-[1.02] disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 mr-2 transition-transform duration-500 ${
                  loading ? 'animate-spin' : 'group-hover:rotate-180'
                }`}
              />
              {loading ? 'Loading…' : 'Get Info'}
            </Button>
          </div>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Airport Info Display */}
      {airportData && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:border-zinc-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center border border-sky-500/30">
                <Building className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">{airportData.info.name}</h3>
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <span className="font-mono font-medium text-sky-400">
                    {airportData.info.icao}
                  </span>
                  {airportData.info.iata && (
                    <>
                      <span>•</span>
                      <span className="font-mono">{airportData.info.iata}</span>
                    </>
                  )}
                  <span>•</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${getAirportTypeStyle(
                      airportData.info.type
                    )}`}
                  >
                    {airportData.info.type}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="mb-8">
            <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-400" />
              Basic Information
            </h4>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <InfoRow label="City" value={airportData.info.city} icon={Building} />
                  <InfoRow label="Country" value={airportData.info.country} icon={MapPin} />
                  <InfoRow
                    label="Coordinates"
                    value={formatCoordinates(
                      airportData.info.latitude,
                      airportData.info.longitude
                    )}
                    icon={Navigation}
                  />
                  <InfoRow
                    label="Elevation"
                    value={`${airportData.info.elevation_ft} ft / ${airportData.info.elevation_m} m`}
                    icon={Ruler}
                  />
                  <InfoRow label="Timezone" value={airportData.info.timezone} icon={Clock} />
                </tbody>
              </table>
            </div>
          </div>

          {/* Runways */}
          {airportData.runways.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-sky-400" />
                Runways ({airportData.runways.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {airportData.runways.map((runway, index) => (
                  <RunwayCard key={index} runway={runway} />
                ))}
              </div>
            </div>
          )}

          {/* Communications */}
          {airportData.communications.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-sky-400" />
                Communications
              </h4>
              <div className="space-y-2">
                {airportData.communications.map((comm, index) => (
                  <CommunicationCard key={index} comm={comm} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}