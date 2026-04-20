import type { WindCalculation, FDPCalculation } from "@/components/types/flightData/aircraft"
export function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function norm360(a: number): number {
  a = a % 360
  if (a < 0) a += 360
  return a
}

export function deltaAngle(a: number, b: number): number {
  const d = Math.abs(norm360(a) - norm360(b))
  return d > 180 ? 360 - d : d
}

export function parseHHMM(s: string): number {
  if (!s) return 0
  const m = s.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return 0
  const h = Math.min(23, Math.max(0, Number.parseInt(m[1], 10)))
  const min = Math.min(59, Math.max(0, Number.parseInt(m[2], 10)))
  return h + min / 60
}

export function fmtHM(hours: number): string {
  const sign = hours < 0 ? "-" : ""
  const h = Math.floor(Math.abs(hours))
  const m = Math.round((Math.abs(hours) - h) * 60)
  return sign + String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0")
}

export function calculateWind(
  runwayHeading: number,
  windDirection: number,
  windSpeed: number,
  crosswindLimit: number,
  tailwindLimit: number,
): WindCalculation {
  const d = deltaAngle(windDirection, runwayHeading)
  const headwind = windSpeed * Math.cos(toRad(d))
  const crosswind = Math.abs(windSpeed * Math.sin(toRad(d)))
  const tailwind = headwind < 0 ? Math.abs(headwind) : 0

  const crosswindOK = crosswind <= crosswindLimit || crosswindLimit === 0
  const tailwindOK = tailwind <= tailwindLimit || tailwindLimit === 0

  return {
    headwind: Math.max(0, headwind),
    crosswind,
    tailwind,
    crosswindOK,
    tailwindOK,
  }
}

export function baseFdp(sectors: number, startHour: number): number {
  const night = startHour >= 20 || startHour < 5
  let base

  if (!night) {
    if (sectors <= 2) base = 13
    else if (sectors === 3) base = 12
    else if (sectors === 4) base = 11
    else if (sectors === 5) base = 10
    else if (sectors === 6) base = 9
    else base = 8
  } else {
    if (sectors <= 2) base = 12
    else if (sectors === 3) base = 11
    else if (sectors === 4) base = 10
    else if (sectors === 5) base = 9
    else base = 8
  }

  return base
}

export function calculateFDP(
  reportTime: string,
  priorRest: number,
  sectors: number,
  plannedBlock: string,
): FDPCalculation {
  const startH = parseHHMM(reportTime)
  let fdp = baseFdp(sectors, Math.floor(startH))

  if (priorRest < 10) fdp -= 1
  if (priorRest >= 12) fdp += 0.5

  fdp = Math.max(6, fdp)

  const planned = parseHHMM(plannedBlock)
  const remaining = fdp - planned

  let status: "OK" | "TIGHT" | "EXCEED"
  if (remaining >= 1) status = "OK"
  else if (remaining >= 0) status = "TIGHT"
  else status = "EXCEED"

  return {
    fdpLimit: fdp,
    fdpRemaining: remaining,
    status,
  }
}
