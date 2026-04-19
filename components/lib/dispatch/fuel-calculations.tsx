import { AIRPORT_DATABASE, FUEL_POLICIES } from "@/components/constants/dispatch/dispatch"
import type { Airport } from "@/components/types/disaptch"

export function calculateGreatCircleDistance(a: Airport, b: Airport): number | null {
  if (!a || !b) return null
  const toRad = Math.PI / 180
  const dlat = (b.lat - a.lat) * toRad
  const dlon = (b.lon - a.lon) * toRad
  const sa = Math.sin(dlat / 2) ** 2 + Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dlon / 2) ** 2
  const c = 2 * Math.asin(Math.sqrt(sa))
  const nm = 3440.065 * c
  return nm
}

export function minutesToHHMM(minutes: number): string {
  const m = Math.round(minutes)
  const h = Math.floor(m / 60)
  const mi = m % 60
  return (h < 10 ? "0" : "") + h + ":" + (mi < 10 ? "0" : "") + mi
}

export interface FuelCalculationParams {
  policy: string
  tripKg: number
  taxiKg: number
  holdFlow: number
  cruiseFlow: number
  gsKt: number
  contPct: number
  finalMin: number
  altPlan: string
  altFuel: number // NEW: Manual alternate fuel
  arrIcao: string
}

export interface FuelCalculationResult {
  breakdown: {
    taxi: number
    trip: number
    contingency: number
    alternate: number
    final: number
    total: number
  }
  alternateInfo: {
    icao: string
    distance: number | null
    time: number | null
    note: string
  }
  policy: {
    name: string
    contPct: number
    finalMin: number
  }
  summary: string[]
}

export function calculateFuelPlan(params: FuelCalculationParams): FuelCalculationResult {
  const policyData = FUEL_POLICIES[params.policy] || FUEL_POLICIES.company
  const contPctVal = params.policy === "company" ? params.contPct : policyData.contPct
  const finalMinVal = params.policy === "company" ? params.finalMin : policyData.finalMin

  const altIcao = params.altPlan.toUpperCase().trim()
  const arrIcao = params.arrIcao.toUpperCase().trim()

  const contingency = Math.round((params.tripKg * contPctVal) / 100)
  
  // Use manual alternate fuel instead of automatic calculation
  const alternateKg = params.altFuel || 0
  
  let alternateTimeMin: number | null = null
  let alternateNote = "Manual entry"

  // Only calculate alternate info for display purposes, not for fuel calculation
  const arrInfo = AIRPORT_DATABASE[arrIcao]
  const altInfo = AIRPORT_DATABASE[altIcao]

  if (altIcao && arrInfo && altInfo && params.gsKt > 0) {
    const nm = calculateGreatCircleDistance(arrInfo, altInfo)
    if (nm != null) {
      alternateTimeMin = (nm / params.gsKt) * 60
      // Note: We're NOT using this for fuel calculation anymore
      alternateNote = `${altIcao} ${Math.round(nm)}nm • ${minutesToHHMM(alternateTimeMin)} • Manual: ${alternateKg} kg`
    }
  } else if (altIcao) {
    alternateNote = `${altIcao} • Manual: ${alternateKg} kg`
  } else if (params.altFuel > 0) {
    alternateNote = `Manual: ${alternateKg} kg`
  }

  const final = Math.round((params.holdFlow / 60) * finalMinVal)
  const total = params.taxiKg + params.tripKg + contingency + alternateKg + final

  const summary = [
    `Fuel Policy: ${policyData.name}`,
    `Inputs: Trip ${params.tripKg} kg • Taxi ${params.taxiKg} kg • HoldFlow ${params.holdFlow} kg/h • CruiseFlow ${params.cruiseFlow} kg/h • GS ${params.gsKt} kt`,
    altIcao ? `Alternate: ${alternateNote}` : `Alternate: Manual ${alternateKg} kg`,
    "",
    "Breakdown (kg)",
    `  Taxi .......... ${params.taxiKg}`,
    `  Trip .......... ${params.tripKg}`,
    `  Cont (${contPctVal}%) ..... ${contingency}`,
    `  Alternate ..... ${alternateKg}${alternateTimeMin != null ? ` (${minutesToHHMM(alternateTimeMin)})` : ""}`,
    `  Final (${finalMinVal}m) ..... ${final}`,
    "---------------------------",
    `  MINIMUM FUEL .. ${total}`,
  ]

  return {
    breakdown: {
      taxi: params.taxiKg,
      trip: params.tripKg,
      contingency,
      alternate: alternateKg, // Now uses manual value
      final,
      total,
    },
    alternateInfo: {
      icao: altIcao,
      distance: altInfo && arrInfo ? calculateGreatCircleDistance(arrInfo, altInfo) : null,
      time: alternateTimeMin,
      note: alternateNote,
    },
    policy: {
      name: policyData.name,
      contPct: contPctVal,
      finalMin: finalMinVal,
    },
    summary,
  }
}