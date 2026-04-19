export interface Airport {
  name: string
  elev: number
  lat: number
  lon: number
  runways: Runway[]
}

export interface Runway {
  up: string
  down: string
  hdgUp: number
}

export interface WindComponents {
  head: string
  cross: string
  hv: number | null
  cv: number | null
}

export interface FlightCategory {
  cat: string
  vis: number | null
  ceil: number | null
}

export interface AlternateCard {
  icao: string
  full: string
  provider: string
}

export interface DispatchState {
  // Flight planning
  dep: string
  arr: string
  limitXW: number
  minCeil: number
  minVis: number
  rwDep: string
  rwArr: string
  notesDep: string
  notesArr: string
  alts: string

  // Fuel planning
  policy: string
  tripKg: number
  taxiKg: number
  holdFlow: number
  cruiseFlow: number
  gsKt: number
  contPct: number
  finalMin: number
  altPlan: string
  altFuel: number 

  // Weather and operational data
  metarDep: string
  metarArr: string
  provDep: string
  provArr: string
  notam: string
  status: string
  networkStatus: string

  // Analysis results
  cmpDep: string
  cmpArr: string
  bestDep: string
  bestArr: string
  trigDep: string
  trigArr: string
  minBadgeDep: string
  minBadgeArr: string
  xwBadge: string
  fuelPlan: string
  opsBadge: string
  riskBadge: string
  riskText: string
  riskNotes: string
  deepLink: string
  audit: string
  altGrid: AlternateCard[]
}

export interface FuelPolicy {
  name: string
  contPct: number
  finalMin: number
}

export interface RiskFactor {
  category: string
  score: number
  description: string
}
