export interface AircraftData {
  key: string
  name: string
  seats: number
  cargo: number
  tora: number
  toda: number
  refTow: number
  mtow: number
}

export interface CalculationParams {
  isa: number
  pAlt: number
  condition: string
  contaminated: boolean
  wind: number
  slope: number
  antiice: boolean
  packs: boolean
  reverser: boolean
  brand: string
  flaps: string
  thrust: string
  tow: number
  refTow: number
  windDir: number
  runwayHeading: number
  runwayLength: number
  clearway: number
  qnh: number
}

export interface WindCalculation {
  headwind: number
  crosswind: number
  tailwind: number
  crosswindOK: boolean
  tailwindOK: boolean
}

export interface FDPCalculation {
  fdpLimit: number
  fdpRemaining: number
  status: "OK" | "TIGHT" | "EXCEED"
}
