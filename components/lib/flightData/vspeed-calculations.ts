// lib/vspeeds-calculations.ts
export interface VSpeedsParams {
  brand: string
  flaps: string
  thrust: string
  tow: number
  refTow: number
  condition: string
  toraAdj?: number
}

export interface VSpeedsResult {
  V1: number
  VR: number
  V2: number
  status: "normal" | "warning" | "critical"
  limitingFactor?: string
}

export function computeVspeeds(params: VSpeedsParams): VSpeedsResult {
  const REF_BY_FAMILY: Record<string, { refTow: number; V1: number; VR: number; V2: number }> = {
    boeing: { refTow: 270, V1: 147, VR: 162, V2: 172 },
    airbus: { refTow: 60, V1: 130, VR: 140, V2: 150 },
  }

  const fam = params.brand
  const ref = params.refTow
    ? { 
        refTow: params.refTow, 
        V1: params.refTow > 100 ? 147 : 130, 
        VR: params.refTow > 100 ? 162 : 140, 
        V2: params.refTow > 100 ? 172 : 150 
      }
    : REF_BY_FAMILY[fam] || REF_BY_FAMILY['boeing']

  const W = Math.max(0.5, Number(params.tow || ref.refTow))
  const f = String(params.flaps || '20')
  const kW = Math.sqrt(W / ref.refTow)
  
  // Flap factors
  const flapFactors: Record<string, number> = { 
    '5': 1.05, '10': 1.02, '20': 1.0, '25': 0.98, 
    '1+F': 1.03, '2': 1.01, '3': 0.99, 'FULL': 0.97 
  }
  const kF = flapFactors[f] ?? 1.0
  
  // Thrust factors
  const thrustFactors: Record<string, number> = { full: 1.0, d10: 0.995, d20: 0.99 }
  const kT = thrustFactors[params.thrust] ?? 1.0
  
  // Condition factor
  const kC = params.condition === 'dry' ? 1.0 : 0.99
  
  // Short field factor
  const shortField = params.toraAdj && params.toraAdj < 2000 ? 0.98 : 1.0

  // Calculate base speeds
  const baseV1 = Math.round(ref.V1 * kW * kF * kT * kC * shortField)
  const baseVR = Math.round(ref.VR * kW * kF * kT)
  const baseV2 = Math.round(ref.V2 * kW * kF * 0.995)

  // Ensure logical relationship between speeds
  let V1 = baseV1
  let V2 = baseV2

  if (baseV1 > baseVR) V1 = Math.max(120, baseVR - 1)
  if (baseVR >= baseV2) V2 = baseVR + 2

  // Use const for VR since it's never reassigned
  const VR = baseVR

  // Determine status based on weight ratio and conditions
  const weightRatio = W / ref.refTow
  let status: "normal" | "warning" | "critical" = "normal"
  let limitingFactor = ""

  if (weightRatio > 1.1) {
    status = "warning"
    limitingFactor = "High Weight"
  } else if (weightRatio > 1.2) {
    status = "critical"
    limitingFactor = "Very High Weight"
  } else if (params.condition !== 'dry') {
    status = "warning"
    limitingFactor = "Contaminated RWY"
  } else if (params.thrust !== 'full') {
    status = "warning"
    limitingFactor = "Reduced Thrust"
  }

  return { V1, VR, V2, status, limitingFactor }
}