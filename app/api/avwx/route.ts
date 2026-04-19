// app/api/avwx/route.ts
import { NextResponse } from 'next/server'
import axios from 'axios'

/**
 * Supported:
 * type: 'station' | 'metar' | 'taf' | 'pirep' | 'sigmet' | 'gairmet' | 'airsigmet' | 'nbm' | 'gfs' | 'notam'
 * mode (varies by type)
 */

const SINGLE = new Set(['metar', 'taf'])
const COLLECTION = new Set(['pirep', 'sigmet', 'gairmet', 'airsigmet', 'notam'])
const STATION = 'station'
const MODE_PATH = { search: 'search', nearest: 'nearest' } as const

// ---- Types ----
interface StationCoords {
  lat: number
  lon: number
  elevation_m: number
  name: string
}

interface GFSForecastItem {
  time?: { dt?: string }
  temperature?: { value?: number }
  dewpoint?: { value?: number }
  wind_direction?: { value?: number }
  wind_speed?: { value?: number }
  visibility?: { value?: string }
  cloud?: { repr?: string }
  precip_chance_6?: { value?: number }
  precip_chance_12?: { value?: number }
}

interface GFSResponse {
  forecast?: GFSForecastItem[]
  info?: {
    latitude?: number
    longitude?: number
    elevation_m?: number
    elevation_ft?: number
    name?: string
  }
  time?: {
    dt?: string
    repr?: string
  }
}

interface NormalizedForecast {
  time: string | null
  temperature_2m_c: number
  dewpoint_2m_c: number
  wind_dir_10m_deg: number
  wind_speed_10m_kt: number
  wind_gust_10m_kt: number
  visibility_km: number
  mslp_hpa: number
  cloud_cover_percent: number
  precipitation_mm: number
  precipitation_probability: number
  cape_jkg: number
  freezing_level_ft: number
  relative_humidity: number
}

// ---- Helpers for GFS MOS -> UI normalization ----
const fToC = (f?: number): number =>
  typeof f === 'number' ? Math.round(((f - 32) * 5) / 9) : 0

const miStringToKm = (s?: string): number => {
  if (!s) return 10
  const m = s.match(/(\d+(\.\d+)?)/)
  return m ? Math.round(parseFloat(m[1]) * 1.609344) : 10
}

const cloudCodeToPercent = (repr?: string): number => {
  switch ((repr || '').toUpperCase()) {
    case 'OV': return 100
    case 'BK': return 75
    case 'SC': return 50
    case 'FW': return 25
    case 'CL': return 0
    default: return 0
  }
}

// ---- Small helper: fetch station coords for ICAO ----
async function fetchStationCoords(icao: string, token: string): Promise<StationCoords> {
  const url = `https://avwx.rest/api/station/${icao.toUpperCase()}`
  const resp = await axios.get(url, {
    headers: { Authorization: `Token ${token}` },
    params: { format: 'json', onfail: 'cache' },
    timeout: 10000,
    validateStatus: () => true,
  })
  if (resp.status < 200 || resp.status >= 300) {
    throw new Error(
      `Failed to resolve ICAO ${icao}: ${resp.status} ${
        typeof resp.data === 'string' ? resp.data : resp.data?.error || ''
      }`
    )
  }
  const d = resp.data || {}
  return {
    lat: d.latitude,
    lon: d.longitude,
    elevation_m:
      typeof d.elevation_m === 'number'
        ? d.elevation_m
        : (typeof d.elevation_ft === 'number' ? Math.round(d.elevation_ft * 0.3048) : 0),
    name: d.name || icao.toUpperCase(),
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = (searchParams.get('type') || '').toLowerCase()
  const mode = (searchParams.get('mode') || '').toLowerCase()

  if (!type || ![STATION, ...SINGLE, ...COLLECTION, 'nbm', 'gfs'].includes(type)) {
    return NextResponse.json(
      { error: 'Invalid type. Use: station, metar, taf, pirep, sigmet, gairmet, airsigmet, nbm, gfs, notam' },
      { status: 400 }
    )
  }

  const token = process.env.AVWX_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Server missing AVWX_TOKEN' }, { status: 500 })
  }

  try {
    let url = 'https://avwx.rest/api'
    const params: Record<string, string> = {}

    // forward all params except our control fields
    for (const [k, v] of searchParams.entries()) {
      if (['type', 'mode'].includes(k)) continue
      params[k] = v
    }

    // -------- Build path by type/mode --------
    if (type === STATION) {
      if (mode === 'info') {
        const icao = (params['icao'] || '').toUpperCase()
        if (!/^[A-Z0-9]{3,4}$/.test(icao)) {
          return NextResponse.json({ error: 'station.info needs ?icao=XXXX' }, { status: 400 })
        }
        url += `/station/${icao}`
        delete params['icao']
      } else if (mode === 'search') {
        url += `/${MODE_PATH.search}/station`
      } else if (mode === 'nearest') {
        url += `/${MODE_PATH.nearest}/station`
      } else {
        return NextResponse.json({ error: 'station needs mode=info|search|nearest' }, { status: 400 })
      }
    } else if (SINGLE.has(type)) {
      if (mode === 'nearest') {
        url += `/${MODE_PATH.nearest}/${type}`
      } else if (mode === 'multi') {
        url += `/${type}` // expects ?ids=KJFK,EGLL
      } else if (mode === 'search') {
        url += `/${MODE_PATH.search}/${type}`
      } else {
        const icao = (params['icao'] || '').toUpperCase()
        if (!/^[A-Z]{4}$/.test(icao)) {
          return NextResponse.json({ error: `${type}.single needs ?icao=XXXX` }, { status: 400 })
        }
        url += `/${type}/${icao}`
        delete params['icao']
      }
    } else if (COLLECTION.has(type)) {
      if (mode === 'nearest') {
        url += `/${MODE_PATH.nearest}/${type}`
      } else if (mode === 'search') {
        url += `/${MODE_PATH.search}/${type}`
      } else {
        // AIR/SIGMET uses the 'airsigmet' endpoint, not 'sigmet' or 'gairmet'
        if (type === 'airsigmet') {
          url += '/airsigmet'
        } else {
          url += `/${type}`
        }
      }
    } else if (type === 'gfs') {
      // Map to GFS MOS endpoint
      url += '/gfs/report/location'

      const lat = searchParams.get('lat')
      const lon = searchParams.get('lon')
      const icao = searchParams.get('icao')
      const location = searchParams.get('location')

      if (lat && lon) {
        params['location'] = `${lat},${lon}`
        delete params['lat']; delete params['lon']
      } else if (icao) {
        params['location'] = icao.toUpperCase()
        delete params['icao']
      } else if (location) {
        params['location'] = location
      } else {
        return NextResponse.json(
          { error: 'gfs needs ?lat&lon or ?icao or ?location' },
          { status: 400 }
        )
      }

      // default to MOS MAV
      params['report'] ??= 'mav'
    } else if (type === 'nbm') {
      // NBM needs lat/lon. If only ICAO provided, resolve coords first.
      let lat = searchParams.get('lat')
      let lon = searchParams.get('lon')
      const icao = searchParams.get('icao')

      if ((!lat || !lon) && icao) {
        try {
          const s = await fetchStationCoords(icao, token)
          lat = String(s.lat)
          lon = String(s.lon)
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : `Could not resolve ICAO ${icao}`
          return NextResponse.json(
            { error: errorMessage },
            { status: 400 }
          )
        }
      }

      if (!lat || !lon) {
        return NextResponse.json(
          {
            error:
              'NBM requires ?lat=<deg>&lon=<deg> (or provide ?icao to auto-resolve). Example: /api/avwx?type=nbm&lat=40.64&lon=-73.78&product=point',
          },
          { status: 400 }
        )
      }

      // Put lat/lon into params (overwrite any stale ones)
      params['lat'] = lat
      params['lon'] = lon

      // Default a reasonable product if none supplied
      params['product'] ??= 'point'

      // passthrough
      url += '/nbm'
    }

    // sensible defaults
    params['format'] ??= 'json'
    params['onfail'] ??= 'cache'

    // ---- Call AVWX ----
    const resp = await axios.get(url, {
      headers: { Authorization: `Token ${token}` },
      params,
      timeout: 15000,
      validateStatus: () => true,
    })

    if (resp.status < 200 || resp.status >= 300) {
      return NextResponse.json(
        {
          error: 'AVWX error',
          status: resp.status,
          detail:
            typeof resp.data === 'string'
              ? resp.data
              : resp.data?.error || resp.data,
        },
        { status: resp.status === 0 ? 502 : resp.status }
      )
    }

    // ---- Type-specific shaping ----
    if (SINGLE.has(type) && !['nearest', 'multi', 'search'].includes(mode)) {
      const raw = resp.data?.raw || resp.data?.sanitized
      if (!raw) return NextResponse.json({ error: 'No report in response' }, { status: 404 })
      return NextResponse.json({ full: raw })
    }

    if (type === STATION && mode === 'info') {
      return NextResponse.json({ station: resp.data })
    }

    if (type === 'gfs') {
      const d: GFSResponse = resp.data || {}
      const fcArr = Array.isArray(d.forecast) ? d.forecast : []

      const forecasts: NormalizedForecast[] = fcArr.map((x: GFSForecastItem) => ({
        time: x?.time?.dt || null,
        temperature_2m_c: fToC(x?.temperature?.value),
        dewpoint_2m_c: fToC(x?.dewpoint?.value),
        wind_dir_10m_deg: x?.wind_direction?.value ?? 0,
        wind_speed_10m_kt: x?.wind_speed?.value ?? 0,
        wind_gust_10m_kt: 0,
        visibility_km: miStringToKm(x?.visibility?.value),
        mslp_hpa: 1013,
        cloud_cover_percent: cloudCodeToPercent(x?.cloud?.repr),
        precipitation_mm: 0,
        precipitation_probability:
          x?.precip_chance_6?.value ??
          x?.precip_chance_12?.value ??
          0,
        cape_jkg: 0,
        freezing_level_ft: 0,
        relative_humidity: 0,
      }))

      const loc = d.info || {}
      const issued = d.time?.dt || new Date().toISOString()
      const modelRun = d.time?.repr || 'Latest'

      const latNum = typeof loc.latitude === 'number' ? loc.latitude : Number(searchParams.get('lat') || 0)
      const lonNum = typeof loc.longitude === 'number' ? loc.longitude : Number(searchParams.get('lon') || 0)

      return NextResponse.json({
        location: {
          lat: latNum,
          lon: lonNum,
          elevation_m:
            typeof loc.elevation_m === 'number'
              ? loc.elevation_m
              : (typeof loc.elevation_ft === 'number'
                  ? Math.round(loc.elevation_ft * 0.3048)
                  : 0),
          name: loc.name || params['location'] || 'GFS Location',
        },
        forecasts,
        issued,
        model_run: modelRun,
        product: 'GFS MAV',
      })
    }

    // Everything else (collections/search/nearest/nbm pass-through)
    const items = Array.isArray(resp.data)
      ? resp.data
      : (resp.data?.results || resp.data?.items || resp.data)
    return NextResponse.json({ items })
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// UPDATED: POST endpoint for parsing AIR/SIGMET and PIREP reports
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = (searchParams.get('type') || '').toLowerCase()

  // Support parsing for both airsigmet and pirep
  if (type !== 'parse_airsigmet' && type !== 'parse_pirep') {
    return NextResponse.json(
      { error: 'POST only supported for type=parse_airsigmet or type=parse_pirep' },
      { status: 400 }
    )
  }

  const token = process.env.AVWX_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Server missing AVWX_TOKEN' }, { status: 500 })
  }

  try {
    const rawText = await req.text()
    
    if (!rawText.trim()) {
      return NextResponse.json(
        { error: 'Request body must contain the report text to parse' },
        { status: 400 }
      )
    }

    // Determine the endpoint based on type
    const endpoint = type === 'parse_pirep' ? 'pirep' : 'airsigmet'
    const url = `https://avwx.rest/api/parse/${endpoint}`
    
    const resp = await axios.post(url, rawText, {
      headers: { 
        Authorization: `Token ${token}`,
        'Content-Type': 'text/plain'
      },
      params: {
        format: 'json',
        onfail: 'cache'
      },
      timeout: 15000,
      validateStatus: () => true,
    })

    if (resp.status < 200 || resp.status >= 300) {
      return NextResponse.json(
        {
          error: 'AVWX parse error',
          status: resp.status,
          detail:
            typeof resp.data === 'string'
              ? resp.data
              : resp.data?.error || resp.data,
        },
        { status: resp.status === 0 ? 502 : resp.status }
      )
    }

    return NextResponse.json(resp.data)
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}