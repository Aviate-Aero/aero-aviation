import type { FlightCategory } from "@/components/types/disaptch"

export function parseVisibility(raw: string): number | null {
  if (/\bCAVOK\b/.test(raw)) return 10
  const mM = raw.match(/\b(\d{4})\b/)
  const mSM = raw.match(/\b(\d{1,2})(?:SM)\b/)
  if (mSM) return +mSM[1]
  if (mM) {
    const m = +mM[1]
    return m >= 9999 ? 10 : +(m / 1609.34).toFixed(1)
  }
  return null
}

export function parseCeiling(raw: string): number | null {
  const re = /\b(FEW|SCT|BKN|OVC)(\d{3})\b/g
  const list: { typ: string; ft: number }[] = []
  let m: RegExpExecArray | null

  while ((m = re.exec(raw)) !== null) {
    list.push({ typ: m[1], ft: +m[2] * 100 })
  }

  const ceil: number[] = []
  const any: number[] = []

  for (let i = 0; i < list.length; i++) {
    any.push(list[i].ft)
    if (list[i].typ === "BKN" || list[i].typ === "OVC") ceil.push(list[i].ft)
  }

  if (ceil.length) {
    let c = ceil[0]
    for (let i = 1; i < ceil.length; i++) c = Math.min(c, ceil[i])
    return c
  }
  if (any.length) {
    let a = any[0]
    for (let i = 1; i < any.length; i++) a = Math.min(a, any[i])
    return a
  }
  return null
}

export function getFlightCategory(raw: string): FlightCategory {
  const vis = parseVisibility(raw)
  const ceil = parseCeiling(raw)
  let cat = "—"
  const v = vis == null ? 1e9 : vis
  const c = ceil == null ? 1e9 : ceil

  if (c < 500 || v < 1) {
    cat = "LIFR"
  } else if (c < 1000 || v < 3) {
    cat = "IFR"
  } else if (c < 3000 || v < 5) {
    cat = "MVFR"
  } else {
    cat = "VFR"
  }

  return { cat, vis, ceil }
}

export function parseWind(raw: string): { dir: number | null; spd: number | null } {
  if (!raw || raw === "—") return { dir: null, spd: null }
  
  const text = raw.toUpperCase()
  
  // Calm wind
  if (text.includes("00000KT")) return { dir: null, spd: 0 }
  
  // Variable wind
  if (text.includes("VRB")) {
    const match = text.match(/\bVRB(\d{2,3})G?(\d{2,3})?KT\b/)
    if (match) return { dir: null, spd: parseInt(match[1]) }
  }
  
  // Normal wind
  const match = text.match(/\b(\d{3})(\d{2,3})G?(\d{2,3})?KT\b/)
  if (match) {
    return {
      dir: parseInt(match[1]),
      spd: parseInt(match[2])
    }
  }
  
  return { dir: null, spd: null }
}

export function calculateWindComponents(
  runwayHeading: number,
  windDirection: number | null,
  windSpeed: number | null
): {
  head: string
  cross: string
  hv: number | null
  cv: number | null
} {
  if (windSpeed === null || isNaN(windSpeed) || windDirection === null || isNaN(windDirection)) {
    return { head: "—", cross: "—", hv: null, cv: null }
  }

  if (runwayHeading === null || isNaN(runwayHeading)) {
    return { head: "—", cross: "—", hv: null, cv: null }
  }

  const angle = ((windDirection - runwayHeading) * Math.PI) / 180
  const headwind = Math.round(windSpeed * Math.cos(angle))
  const crosswind = Math.round(Math.abs(windSpeed * Math.sin(angle)))
  
  const tag = headwind >= 0 ? 'HW' : 'TW'
  
  return {
    head: `${Math.abs(headwind)} kt ${tag}`,
    cross: `${crosswind} kt`,
    hv: headwind,
    cv: crosswind
  }
}

export function extractWeatherTokens(raw: string): string {
  const visTok = (raw.match(/\b(\d{4}|\d{1,2}SM|CAVOK)\b/) || [])[0] || "—"
  const ceilTok = (raw.match(/\b(FEW|SCT|BKN|OVC)\d{3}\b/) || [])[0] || "—"
  return `vis: ${visTok} • ceil: ${ceilTok}`
}

