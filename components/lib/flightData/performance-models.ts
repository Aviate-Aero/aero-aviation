import { PERFORMANCE_CONSTANTS } from "../constants"
import { RUNWAY_CONDITION_FACTORS } from "../constants"
import { CalculationParams } from "@/components/types/flightData/aircraft"

export function rho(alt_ft: number, temp_C: number, qnh_hPa: number): number {
  const pressureAlt = alt_ft * 0.3048 + (1013 - qnh_hPa) * 30
  const ISA_K = PERFORMANCE_CONSTANTS.T0 + PERFORMANCE_CONSTANTS.L * pressureAlt
  return Math.pow(
    1 + (temp_C - (ISA_K - 273.15)) / ISA_K,
    -PERFORMANCE_CONSTANTS.g / (PERFORMANCE_CONSTANTS.R * PERFORMANCE_CONSTANTS.L) - 1,
  )
}

// Weight calculation functions
export function weight737(dist: number) {
  return {
    zfw_ng: 41640,
    mtow_ng: 79015,
    land_ng: 66361,
    fuel_ng: Math.round(5.8 * dist + 3000),
    zfw_mx: 42638,
    mtow_mx: 82191,
    land_mx: 69399,
    fuel_mx: Math.round(5.5 * dist + 2800),
  }
}

export function weightAirbus(dist: number) {
  return {
    zfw_319ceo: 40500,
    mtow_319ceo: 68000,
    land_319ceo: 58500,
    fuel_319ceo: Math.round(6.0 * dist + 2500),
    zfw_320ceo: 42600,
    mtow_320ceo: 77000,
    land_320ceo: 64500,
    fuel_320ceo: Math.round(6.2 * dist + 2700),
    zfw_321ceo: 48000,
    mtow_321ceo: 93500,
    land_321ceo: 77500,
    fuel_321ceo: Math.round(6.5 * dist + 3000),
    zfw_319neo: 40000,
    mtow_319neo: 67000,
    land_319neo: 58000,
    fuel_319neo: Math.round(5.7 * dist + 2400),
    zfw_320neo: 42000,
    mtow_320neo: 76000,
    land_320neo: 64000,
    fuel_320neo: Math.round(5.9 * dist + 2600),
    zfw_321neo: 47500,
    mtow_321neo: 92000,
    land_321neo: 77000,
    fuel_321neo: Math.round(6.2 * dist + 2900),
  }
}

export function weightPiston(dist: number) {
  return {
    zfw_sen3: 3200,
    mtow_sen3: 4750,
    land_sen3: 4500,
    fuel_sen3: Math.round(2.5 * dist + 150),
    zfw_sen4: 3150,
    mtow_sen4: 4700,
    land_sen4: 4450,
    fuel_sen4: Math.round(2.4 * dist + 140),
    zfw_sen5: 3100,
    mtow_sen5: 4650,
    land_sen5: 4400,
    fuel_sen5: Math.round(2.3 * dist + 130),
    zfw_c172s: 1600,
    mtow_c172s: 2550,
    land_c172s: 2400,
    fuel_c172s: Math.round(2.0 * dist + 100),
  }
}

export function weightTurboprop(dist: number) {
  return {
    zfw_atr42: 11500,
    mtow_atr42: 18600,
    land_atr42: 17000,
    fuel_atr42: Math.round(4.0 * dist + 1500),
    zfw_atr72: 13500,
    mtow_atr72: 23000,
    land_atr72: 21000,
    fuel_atr72: Math.round(4.5 * dist + 1800),
  }
}

export function weightHelicopter(dist: number) {
  return { zfw: 4000, mtow: 6400, land: 6000, fuel: Math.round(3.0 * dist + 200) }
}

// Performance calculation functions
export function perf737(alt: number, temp: number, qnh: number, packs: boolean, dist: number) {
  const r = rho(alt, temp, qnh)
  const f = Math.pow(r, -1.5) * (packs ? 1.05 : 1)

  const ALT_GRID = [0, 2000, 4000, 6000, 8000] as const

  const CLASSIC = {
    "300F": {
      std: [6200, 6800, 7500, 8300, 9200] as const,
      hot: [7000, 7700, 8500, 9400, 10400] as const,
      mtow: 124500 as const,
      payload: 43100 as const,
      climbBase: 2.7 as const,
    },
    "400F": {
      std: [6800, 7500, 8300, 9200, 10200] as const,
      hot: [7600, 8400, 9300, 10300, 11400] as const,
      mtow: 138500 as const,
      payload: 50700 as const,
      climbBase: 2.6 as const,
    },
    "500F": {
      std: [5800, 6400, 7100, 7900, 8800] as const,
      hot: [6500, 7200, 8000, 8900, 9900] as const,
      mtow: 124500 as const,
      payload: 38700 as const,
      climbBase: 2.8 as const,
    },
  } as const

  function isaTempAtAlt(paFt: number) {
    return 15 - 1.98 * (paFt / 1000)
  }

  function lerp(x0: number, x1: number, t: number) {
    return x0 + (x1 - x0) * t
  }

  function interpAlt(paFt: number, grid: ReadonlyArray<number>, values: ReadonlyArray<number>) {
    if (paFt <= grid[0]!) return values[0]!
    const lastIdx = grid.length - 1
    if (paFt >= grid[lastIdx]!) return values[lastIdx]!
    for (let i = 0; i < grid.length - 1; i++) {
      const x0 = grid[i]!
      const x1 = grid[i + 1]!
      if (paFt >= x0 && paFt <= x1) {
        const t = (paFt - x0) / (x1 - x0)
        return lerp(values[i]!, values[i + 1]!, t)
      }
    }
    return values[lastIdx]!
  }

  function classicTodFromTables(
    paFt: number,
    oatC: number,
    stdArr: ReadonlyArray<number>,
    hotArr: ReadonlyArray<number>
  ) {
    const isa = isaTempAtAlt(paFt)
    const delta = oatC - isa
    const todStd = interpAlt(paFt, ALT_GRID, stdArr)
    const todHot = interpAlt(paFt, ALT_GRID, hotArr)

    const t = delta / 15
    let tod = todStd + (todHot - todStd) * t
    if (t < 0) {
      tod = todStd + (todHot - todStd) * t
    } else if (t > 1) {
      tod = todHot + (todHot - todStd) * (t - 1)
    }
    tod = Math.round(tod * (packs ? 1.05 : 1))
    return Math.max(0, tod)
  }

  function heatPenalty(oatC: number) {
    if (oatC < 38) return 0
    if (oatC >= 47) return 10000
    const t = (oatC - 38) / (47 - 38)
    return Math.round(1000 + t * (10000 - 1000))
  }

  const b = {
    tod_900: 2300,
    tod_mx9: 2300,
    tod_ng: 2400,
    tod_mx: 2200,
    cl_900: 3.0,
    cl_mx9: 3.7,
    cl_ng: 3.2,
    cl_mx: 3.8,
    pay_900: 21000,
    pay_mx9: 23000,
    pay_ng: 20000,
    pay_mx: 22000,
    seats_900: 200,
    seats_mx9: 210,
    seats_ng: 189,
    seats_mx: 200,
  }

  const w = weight737(dist)

  const mtowPenalty = alt >= 0 && alt <= 2000 ? heatPenalty(temp) : 0

  const mtow_300 = Math.max(0, CLASSIC["300F"].mtow - mtowPenalty)
  const mtow_400 = Math.max(0, CLASSIC["400F"].mtow - mtowPenalty)
  const mtow_500 = Math.max(0, CLASSIC["500F"].mtow - mtowPenalty)

  const pay_300_raw = Math.max(0, CLASSIC["300F"].payload - mtowPenalty)
  const pay_400_raw = Math.max(0, CLASSIC["400F"].payload - mtowPenalty)
  const pay_500_raw = Math.max(0, CLASSIC["500F"].payload - mtowPenalty)

  const payDensity = Math.pow(r, 0.5)
  const pay_300 = Math.round(pay_300_raw * payDensity)
  const pay_400 = Math.round(pay_400_raw * payDensity)
  const pay_500 = Math.round(pay_500_raw * payDensity)

  const tod_300 = classicTodFromTables(alt, temp, CLASSIC["300F"].std, CLASSIC["300F"].hot)
  const tod_400 = classicTodFromTables(alt, temp, CLASSIC["400F"].std, CLASSIC["400F"].hot)
  const tod_500 = classicTodFromTables(alt, temp, CLASSIC["500F"].std, CLASSIC["500F"].hot)

  const cl_300 = Number((CLASSIC["300F"].climbBase * r).toFixed(2))
  const cl_400 = Number((CLASSIC["400F"].climbBase * r).toFixed(2))
  const cl_500 = Number((CLASSIC["500F"].climbBase * r).toFixed(2))

  const land_300 = Math.round(mtow_300 * 0.85)
  const land_400 = Math.round(mtow_400 * 0.85)
  const land_500 = Math.round(mtow_500 * 0.85)

  const zfw_300 = w.zfw_ng
  const zfw_400 = w.zfw_ng
  const zfw_500 = w.zfw_ng
  const fuel_300 = w.fuel_ng
  const fuel_400 = w.fuel_ng
  const fuel_500 = w.fuel_ng

  return {
    tod_900: Math.round(b.tod_900 * f),
    tod_mx9: Math.round(b.tod_mx9 * f),
    tod_ng: Math.round(b.tod_ng * f),
    tod_mx: Math.round(b.tod_mx * f),
    cl_900: Number((b.cl_900 * r).toFixed(2)),
    cl_mx9: Number((b.cl_mx9 * r).toFixed(2)),
    cl_ng: Number((b.cl_ng * r).toFixed(2)),
    cl_mx: Number((b.cl_mx * r).toFixed(2)),
    pay_900: Math.round(b.pay_900 * Math.pow(r, 0.7)),
    pay_mx9: Math.round(b.pay_mx9 * Math.pow(r, 0.7)),
    pay_ng: Math.round(b.pay_ng * Math.pow(r, 0.7)),
    pay_mx: Math.round(b.pay_mx * Math.pow(r, 0.7)),
    zfw_900: w.zfw_ng,
    mtow_900: 79015,
    land_900: 64500,
    fuel_900: w.fuel_ng,
    zfw_mx9: w.zfw_mx,
    mtow_mx9: 88300,
    land_mx9: 70000,
    fuel_mx9: w.fuel_mx,
    zfw_ng: w.zfw_ng,
    mtow_ng: w.mtow_ng,
    land_ng: w.land_ng,
    fuel_ng: w.fuel_ng,
    zfw_mx: w.zfw_mx,
    mtow_mx: w.mtow_mx,
    land_mx: w.land_mx,
    fuel_mx: w.fuel_mx,
    seats_900: b.seats_900,
    seats_mx9: b.seats_mx9,
    seats_ng: b.seats_ng,
    seats_mx: b.seats_mx,

    tod_300,
    cl_300,
    pay_300,
    zfw_300,
    mtow_300,
    land_300,
    fuel_300,
    seats_300: 0,

    tod_400,
    cl_400,
    pay_400,
    zfw_400,
    mtow_400,
    land_400,
    fuel_400,
    seats_400: 0,

    tod_500,
    cl_500,
    pay_500,
    zfw_500,
    mtow_500,
    land_500,
    fuel_500,
    seats_500: 0,
  }
}

export function perfAirbus(alt: number, temp: number, qnh: number, packs: boolean, dist: number) {
  const r = rho(alt, temp, qnh)
  const f = Math.pow(r, -1.5) * (packs ? 1.05 : 1)
  const b = {
    tod_320v25: 2190,
    tod_319ceo: 2350,
    tod_320ceo: 2400,
    tod_321ceo: 2550,
    tod_319neo: 2150,
    tod_320neo: 2200,
    tod_321neo: 2350,
    cl_ceo: 3,
    cl_neo: 3.6,
    pay_319: 19000,
    pay_320: 20000,
    pay_321: 22000,
    seats_320v25: 180,
    seats_319ceo: 160,
    seats_320ceo: 180,
    seats_321ceo: 236,
    seats_319neo: 160,
    seats_320neo: 180,
    seats_321neo: 236,
  }
  const w = weightAirbus(dist)
  return {
    tod_320v25: Math.round(b.tod_320v25 * f),
    tod_319ceo: Math.round(b.tod_319ceo * f),
    tod_320ceo: Math.round(b.tod_320ceo * f),
    tod_321ceo: Math.round(b.tod_321ceo * f),
    tod_319neo: Math.round(b.tod_319neo * f),
    tod_320neo: Math.round(b.tod_320neo * f),
    tod_321neo: Math.round(b.tod_321neo * f),
    cl_ceo: Number((b.cl_ceo * r).toFixed(2)),
    cl_neo: Number((b.cl_neo * r).toFixed(2)),
    pay_319: Math.round(b.pay_319 * Math.pow(r, 0.7)),
    pay_320: Math.round(b.pay_320 * Math.pow(r, 0.7)),
    pay_321: Math.round(b.pay_321 * Math.pow(r, 0.7)),
    zfw_320v25: w.zfw_320ceo,
    zfw_319ceo: w.zfw_319ceo,
    mtow_320v25: 77000,
    land_320v25: 64500,
    fuel_320v25: w.fuel_320ceo,
    mtow_319ceo: w.mtow_319ceo,
    land_319ceo: w.land_319ceo,
    fuel_319ceo: w.fuel_319ceo,
    zfw_320ceo: w.zfw_320ceo,
    mtow_320ceo: w.mtow_320ceo,
    land_320ceo: w.land_320ceo,
    fuel_320ceo: w.fuel_320ceo,
    zfw_321ceo: w.zfw_321ceo,
    mtow_321ceo: w.mtow_321ceo,
    land_321ceo: w.land_321ceo,
    fuel_321ceo: w.fuel_321ceo,
    zfw_319neo: w.zfw_319neo,
    mtow_319neo: w.mtow_319neo,
    land_319neo: w.land_319neo,
    fuel_319neo: w.fuel_319neo,
    zfw_320neo: w.zfw_320neo,
    mtow_320neo: w.mtow_320neo,
    land_320neo: w.land_320neo,
    fuel_320neo: w.fuel_320neo,
    zfw_321neo: w.zfw_321neo,
    mtow_321neo: w.mtow_321neo,
    land_321neo: w.land_321neo,
    fuel_321neo: w.fuel_321neo,
    seats_320v25: b.seats_320v25,
    seats_319ceo: b.seats_319ceo,
    seats_320ceo: b.seats_320ceo,
    seats_321ceo: b.seats_321ceo,
    seats_319neo: b.seats_319neo,
    seats_320neo: b.seats_320neo,
    seats_321neo: b.seats_321neo,
  }
}

export function perfPiston(alt: number, temp: number, qnh: number, antiIce: boolean, dist: number) {
  const r = rho(alt, temp, qnh)
  const f = Math.pow(r, -1.4) * (antiIce ? 1.05 : 1)
  const b = {
    tod_sen3: 1400,
    tod_sen4: 1350,
    tod_sen5: 1300,
    tod_c172s: 1000,
    cl_sen3: 2.8,
    cl_sen4: 2.9,
    cl_sen5: 3,
    cl_c172s: 2.2,
    pay_sen3: 625,
    pay_sen4: 612,
    pay_sen5: 604,
    pay_c172s: 408,
    seats_sen3: 6,
    seats_sen4: 6,
    seats_sen5: 6,
    seats_c172s: 4,
  }
  const w = weightPiston(dist)
  return {
    tod_sen3: Math.round(b.tod_sen3 * f),
    tod_sen4: Math.round(b.tod_sen4 * f),
    tod_sen5: Math.round(b.tod_sen5 * f),
    tod_c172s: Math.round(b.tod_c172s * f),
    cl_sen3: Number((b.cl_sen3 * r).toFixed(2)),
    cl_sen4: Number((b.cl_sen4 * r).toFixed(2)),
    cl_sen5: Number((b.cl_sen5 * r).toFixed(2)),
    cl_c172s: Number((b.cl_c172s * r).toFixed(2)),
    pay_sen3: Math.round(b.pay_sen3 * Math.pow(r, 0.7)),
    pay_sen4: Math.round(b.pay_sen4 * Math.pow(r, 0.7)),
    pay_sen5: Math.round(b.pay_sen5 * Math.pow(r, 0.7)),
    pay_c172s: Math.round(b.pay_c172s * Math.pow(r, 0.7)),
    zfw_sen3: w.zfw_sen3,
    mtow_sen3: w.mtow_sen3,
    land_sen3: w.land_sen3,
    fuel_sen3: w.fuel_sen3,
    zfw_sen4: w.zfw_sen4,
    mtow_sen4: w.mtow_sen4,
    land_sen4: w.land_sen4,
    fuel_sen4: w.fuel_sen4,
    zfw_sen5: w.zfw_sen5,
    mtow_sen5: w.mtow_sen5,
    land_sen5: w.land_sen5,
    fuel_sen5: w.fuel_sen5,
    zfw_c172s: w.zfw_c172s,
    mtow_c172s: w.mtow_c172s,
    land_c172s: w.land_c172s,
    fuel_c172s: w.fuel_c172s,
    seats_sen3: b.seats_sen3,
    seats_sen4: b.seats_sen4,
    seats_sen5: b.seats_sen5,
    seats_c172s: b.seats_c172s,
  }
}

export function perfTurboprop(alt: number, temp: number, qnh: number, antiIce: boolean, dist: number) {
  const r = rho(alt, temp, qnh)
  const f = Math.pow(r, -1.3) * (antiIce ? 1.05 : 1)

  const b = {
    tod_atr42: 1800,
    tod_atr72: 2000,
    tod_ka350: 1200, 
    cl_atr42: 2.8,
    cl_atr72: 3,
    cl_ka350: 2.5,
    pay_atr42: 5500,
    pay_atr72: 8400,
    pay_ka350: 2600, 
    seats_atr42: 50,
    seats_atr72: 78,
    seats_ka350: 9, 
  }

  const w = weightTurboprop(dist)

  return {
    tod_atr42: Math.round(b.tod_atr42 * f),
    cl_atr42: Number((b.cl_atr42 * r).toFixed(2)),
    pay_atr42: Math.round(b.pay_atr42 * Math.pow(r, 0.7)),
    zfw_atr42: w.zfw_atr42,
    mtow_atr42: w.mtow_atr42,
    land_atr42: w.land_atr42,
    fuel_atr42: w.fuel_atr42,
    seats_atr42: b.seats_atr42,

    tod_atr72: Math.round(b.tod_atr72 * f),
    cl_atr72: Number((b.cl_atr72 * r).toFixed(2)),
    pay_atr72: Math.round(b.pay_atr72 * Math.pow(r, 0.7)),
    zfw_atr72: w.zfw_atr72,
    mtow_atr72: w.mtow_atr72,
    land_atr72: w.land_atr72,
    fuel_atr72: w.fuel_atr72,
    seats_atr72: b.seats_atr72,

    tod_ka350: Math.round(b.tod_ka350 * f),
    cl_ka350: Number((b.cl_ka350 * r).toFixed(2)),
    pay_ka350: Math.round(b.pay_ka350 * Math.pow(r, 0.7)),
    zfw_ka350: 6800, 
    mtow_ka350: 6804, 
    land_ka350: 6350, 
    fuel_ka350: 900, 
    seats_ka350: b.seats_ka350,
  }
}

export function perfHelicopter(
  alt: number,
  temp: number,
  qnh: number,
  antiIce: boolean,
  dist: number
) {
  const r = rho(alt, temp, qnh)
  const f = Math.pow(r, -1.4) * (antiIce ? 1.05 : 1)

  const base = {
    aw139: {
      tod: 1200,
      cl: 10.9,
      payload: 2500,
      seats: 16,
    },
    aw109: {
      tod: 1100,
      cl: 9.8,   
      payload: 1100,
      seats: 7,
    },
  }

  const w = weightHelicopter(dist)

  return {
    aw139: {
      tod: Math.round(base.aw139.tod * f),
      cl: Number((base.aw139.cl * r).toFixed(2)),
      payload: Math.round(base.aw139.payload * Math.pow(r, 0.7)),
      zfw: w.zfw,
      mtow: w.mtow,
      land: w.land,
      fuel: w.fuel,
      seats: base.aw139.seats,
    },
    aw109: {
      tod: Math.round(base.aw109.tod * f),
      cl: Number((base.aw109.cl * r).toFixed(2)),
      payload: Math.round(base.aw109.payload * Math.pow(r, 0.7)),
      zfw: 1590,
      mtow: 2850,
      land: 2700,
      fuel: 300, 
      seats: base.aw109.seats,
    },
  }
}

// Factor functions
export function flapFactor(brand: string, flap: string): number {
  if (brand === "airbus") {
    const map: { [key: string]: number } = { "1+F": 1.0, "2": 0.97, "3": 0.94, FULL: 0.9 }
    return map[flap] ?? 1.0
  } else {
    const map: { [key: string]: number } = { "1": 1.15, "5": 1.0, "15": 0.94, "25": 0.9 }
    return map[flap] ?? 1.0
  }
}

export function thrustFactor(mode: string): number {
  const map: { [key: string]: number } = { full: 1.0, d10: 1.12, d20: 1.28 }
  return map[mode] ?? 1.0
}

export function windFactor(kn: number): number {
  // kn should be headwind component (positive = headwind, negative = tailwind)
  if (kn >= 0) {
    return Math.max(0.8, 1 - 0.005 * kn)
  } else {
    const tw = Math.abs(kn)
    return Math.min(1.35, 1 + 0.01 * tw)
  }
}

export function slopeFactor(pct: number): number {
  return Math.max(0.7, 1 + 0.1 * pct)
}

export function antiIceFactor(on: boolean): number {
  return on ? 1.03 : 1.0
}

export function packsFactor(on: boolean): number {
  return on ? 1.03 : 1.0
}

export function tempFactor(isaC: number): number {
  const dev = isaC - 15
  return 1 + 0.003 * dev
}

export function altitudeFactor(pAltFt: number): number {
  return 1 + (pAltFt / 1000) * 0.006
}

export function weightFactor(tow: number, refTow: number): number {
  const ratio = Math.max(0.6, Math.min(1.4, tow / refTow))
  return Math.pow(ratio, 1.2)
}

export function adjustDistance(base: number, params: CalculationParams): number {
  const conditionFactor =
    RUNWAY_CONDITION_FACTORS[params.condition as keyof typeof RUNWAY_CONDITION_FACTORS]?.takeoff || 1.0

  const factor =
    tempFactor(params.isa) *
    altitudeFactor(params.pAlt) *
    conditionFactor *
    windFactor(params.wind) *  // This now uses the headwind component correctly
    slopeFactor(params.slope) *
    antiIceFactor(params.antiice) *
    flapFactor(params.brand, params.flaps) *
    packsFactor(params.packs) *
    thrustFactor(params.thrust) *
    weightFactor(params.tow, params.refTow)

  return Math.round(base * factor)
}

// Comprehensive TORA/TODA calculation functions
export interface ToraTodaParams {
  // Aircraft parameters
  tow: number
  refTow: number
  brand: string
  flaps: string
  thrust: string
  
  // Environmental parameters
  pAlt: number
  isa: number
  qnh: number
  wind: number
  windDir: number
  runwayHeading: number
  slope: number
  condition: string
  antiice: boolean
  packs: boolean
  
  // Runway parameters
  runwayLength: number
  clearway: number
  
  // Base performance parameters
  baseTora: number
  baseToda: number
}

export interface ToraTodaResults {
  // Required distances
  requiredTakeoffRun: number
  requiredTakeoffDistance: number
  requiredAccelerateStop: number
  
  // Available distances
  availableTora: number
  availableToda: number
  availableAsda: number
  
  // Safety margins
  toraMargin: number
  todaMargin: number
  asdaMargin: number
  
  // Performance factors
  densityAltitude: number
  windComponent: number
  crosswindComponent: number
  tailwindComponent: number
  
  // Safety status
  isSafe: boolean
  warnings: string[]
}

// Improved ASDA calculation
export function calculateASDA(requiredTakeoffRun: number, condition: string, headwind: number): number {
  let factor = 1.1; // Base factor
  
  // Adjust for conditions
  const conditionFactors = {
    dry: 1.0,
    wet: 1.15,
    slush: 1.25,
    snow: 1.3,
    ice: 1.4
  }
  
  factor *= conditionFactors[condition as keyof typeof conditionFactors] || 1.0
  
  // Adjust for wind (tailwind increases ASDA requirement)
  if (headwind < 0) {
    factor *= (1 + Math.abs(headwind) * 0.02) // 2% increase per knot of tailwind
  }
  
  return Math.round(requiredTakeoffRun * factor)
}

// Parameter validation
export function validateToraTodaParams(params: ToraTodaParams): string[] {
  const errors: string[] = []
  
  if (params.runwayLength <= 0) errors.push("Runway length must be positive")
  if (params.clearway < 0) errors.push("Clearway cannot be negative")
  if (params.clearway > params.runwayLength * 0.5) errors.push("Clearway should not exceed 50% of runway length")
  if (params.tow > params.refTow * 1.1) errors.push("Takeoff weight exceeds safe limits")
  if (Math.abs(params.wind) > 50) errors.push("Wind speed appears unrealistic")
  if (params.pAlt < -1000 || params.pAlt > 15000) errors.push("Pressure altitude outside realistic range")
  if (params.isa < -50 || params.isa > 50) errors.push("Temperature outside realistic range")
  
  return errors
}

export function calculateWindComponents(
  windDir: number, 
  windSpeed: number, 
  runwayHeading: number
): { headwind: number; crosswind: number; tailwind: number } {
  // Normalize angles to 0-360 range
  const normalizedWindDir = ((windDir % 360) + 360) % 360
  const normalizedRunwayHeading = ((runwayHeading % 360) + 360) % 360
  
  const windAngle = normalizedWindDir - normalizedRunwayHeading
  const windAngleRad = (windAngle * Math.PI) / 180
  
  const headwind = Math.cos(windAngleRad) * windSpeed
  const crosswind = Math.sin(windAngleRad) * windSpeed
  const tailwind = -headwind
  
  return {
    headwind: Math.round(headwind * 10) / 10,
    crosswind: Math.round(Math.abs(crosswind) * 10) / 10,
    tailwind: Math.round(tailwind * 10) / 10
  }
}

export function calculateDensityAltitude(pAlt: number, isa: number, qnh: number): number {
  // Correct pressure altitude calculation (feet)
  const pressureAltitude = pAlt + (1013 - qnh) * 30
  
  // Standard atmosphere temperature at pressure altitude
  const standardTemp = 15 - (pressureAltitude / 1000) * 1.98
  
  // Density altitude formula (feet)
  const densityAltitude = pressureAltitude + (118.6 * (isa - standardTemp))
  
  return Math.round(densityAltitude)
}

export function calculateToraToda(params: ToraTodaParams): ToraTodaResults {
  const warnings: string[] = []
  
  // Calculate wind components CORRECTLY - this is the key fix
  const windComponents = calculateWindComponents(params.windDir, Math.abs(params.wind), params.runwayHeading)
  const effectiveWind = windComponents.headwind
  
  // Calculate density altitude
  const densityAltitude = calculateDensityAltitude(params.pAlt, params.isa, params.qnh)
  
  // Use effectiveWind instead of params.wind - THIS IS THE CRITICAL FIX
  const calculationParams: CalculationParams = {
    isa: params.isa,
    pAlt: params.pAlt,
    condition: params.condition,
    contaminated: ["wet", "snow", "slush", "ice"].includes(params.condition),
    wind: effectiveWind,  // ✅ FIXED: Use computed headwind component
    slope: params.slope,
    antiice: params.antiice,
    packs: params.packs,
    reverser: false, // Not used in TORA/TODA calculation
    brand: params.brand,
    flaps: params.flaps,
    thrust: params.thrust,
    tow: params.tow,
    refTow: params.refTow,
    // ADD THE MISSING PARAMETERS
    windDir: params.windDir,
    runwayHeading: params.runwayHeading,
    runwayLength: params.runwayLength,
    clearway: params.clearway,
    qnh: params.qnh
  }
  
  // Calculate required distances using your existing adjustDistance function
  const requiredTakeoffRun = adjustDistance(params.baseTora, calculationParams)
  const requiredTakeoffDistance = adjustDistance(params.baseToda, calculationParams)
  
  // Improved ASDA calculation
  const requiredAccelerateStop = calculateASDA(requiredTakeoffRun, params.condition, effectiveWind)
  
  // Available distances
  const availableTora = params.runwayLength
  const availableToda = params.runwayLength + params.clearway
  const availableAsda = params.runwayLength // ASDA = TORA (no stopway)
  
  // Calculate margins
  const toraMargin = availableTora - requiredTakeoffRun
  const todaMargin = availableToda - requiredTakeoffDistance
  const asdaMargin = availableAsda - requiredAccelerateStop
  
  // Safety checks
  const isSafe = toraMargin >= 0 && todaMargin >= 0 && asdaMargin >= 0
  
  // Generate warnings using your existing logic
  if (toraMargin < 0) warnings.push(`Insufficient TORA: Required ${requiredTakeoffRun}m, Available ${availableTora}m`)
  if (todaMargin < 0) warnings.push(`Insufficient TODA: Required ${requiredTakeoffDistance}m, Available ${availableToda}m`)
  if (asdaMargin < 0) warnings.push(`Insufficient ASDA: Required ${requiredAccelerateStop}m, Available ${availableAsda}m`)
  if (windComponents.tailwind > 5) warnings.push(`Tailwind component: ${windComponents.tailwind.toFixed(1)} kt (limit: 5 kt)`)
  if (windComponents.crosswind > 20) warnings.push(`Crosswind component: ${windComponents.crosswind.toFixed(1)} kt (limit: 20 kt)`)
  if (densityAltitude > 8000) warnings.push(`High density altitude: ${densityAltitude} ft`)
  if (params.slope > 2) warnings.push(`Uphill slope: ${params.slope}%`)
  if (params.condition !== 'dry') warnings.push(`Contaminated runway: ${params.condition}`)
  
  return {
    requiredTakeoffRun,
    requiredTakeoffDistance,
    requiredAccelerateStop,
    availableTora,
    availableToda,
    availableAsda,
    toraMargin,
    todaMargin,
    asdaMargin,
    densityAltitude,
    windComponent: effectiveWind,
    crosswindComponent: windComponents.crosswind,
    tailwindComponent: windComponents.tailwind,
    isSafe,
    warnings
  }
}