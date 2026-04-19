import type { Airport, FuelPolicy } from "@/components/types/disaptch"

export const AIRPORT_DATABASE: Record<string, Airport> = {
  OPIS: {
    name: "Islamabad Int'l",
    elev: 1660,
    lat: 33.56,
    lon: 72.851,
    runways: [{ up: "12", down: "30", hdgUp: 120 }],
  },
  EGLL: {
    name: "London Heathrow",
    elev: 83,
    lat: 51.4775,
    lon: -0.4614,
    runways: [
      { up: "09L", down: "27R", hdgUp: 90 },
      { up: "09R", down: "27L", hdgUp: 90 },
    ],
  },
  OPKC: {
    name: "Karachi Jinnah",
    elev: 100,
    lat: 24.9065,
    lon: 67.1608,
    runways: [
      { up: "07L", down: "25R", hdgUp: 70 },
      { up: "07R", down: "25L", hdgUp: 70 },
    ],
  },
  EGSS: {
    name: "Stansted",
    elev: 348,
    lat: 51.884,
    lon: 0.235,
    runways: [{ up: "04", down: "22", hdgUp: 40 }],
  },
  OMDB: {
    name: "Dubai Int'l",
    elev: 62,
    lat: 25.253,
    lon: 55.365,
    runways: [
      { up: "12L", down: "30R", hdgUp: 120 },
      { up: "12R", down: "30L", hdgUp: 120 },
    ],
  },
  EDDF: {
    name: "Frankfurt",
    elev: 364,
    lat: 50.033,
    lon: 8.5706,
    runways: [
      { up: "07C", down: "25C", hdgUp: 70 },
      { up: "07L", down: "25R", hdgUp: 70 },
      { up: "18", down: "36", hdgUp: 180 },
    ],
  },
}

export const FUEL_POLICIES: Record<string, FuelPolicy> = {
  easa5: { name: "EASA 5% / Final 30", contPct: 5, finalMin: 30 },
  easa3: { name: "EASA 3% (ERA) / Final 30", contPct: 3, finalMin: 30 },
  faa45: { name: "FAA Reserve 45", contPct: 0, finalMin: 45 },
  company: { name: "Company custom", contPct: 5, finalMin: 45 },
}

export const DISPATCH_API_BASE = "https://icao.masoodsaad03.workers.dev"

export const FLIGHT_CATEGORIES = {
  VFR: { color: "aviation-green", priority: 0 },
  MVFR: { color: "aviation-amber", priority: 1 },
  IFR: { color: "aviation-amber", priority: 2 },
  LIFR: { color: "aviation-red", priority: 3 },
}

export const NOTAM_KEYWORDS = [
  ["Runway", "RWY|RUNWAY"],
  ["Taxiway", "TWY|TAXIWAY"],
  ["ILS/NAVAID", "ILS|VOR|NDB|DME|VORTAC"],
  ["Airspace", "TSA|TRA|RESTRICTED|DANGER|PROHIBITED"],
  ["Fuel", "FUEL|AVGAS|JET *A|JETA1"],
  ["Lighting", "PAPI|ALS|REIL|HIRL|MIRL|LIRL"],
  ["WIP", "WIP|WORK IN PROGRESS"],
  ["Closed", "CLSD|CLOSED"],
]
