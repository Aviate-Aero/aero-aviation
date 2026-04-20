import type { AircraftData } from "../types/flightData/aircraft"
import { createSupabaseClient } from "./supabase/supbase-client"
import { aircraftService } from "./flightData/aircraftService"

export const PERFORMANCE_CONSTANTS = { T0: 288.15, L: -0.0065, R: 287.05, g: 9.80665 }

export const METRICS = [
  "TODA (m)",
  "Climb %",
  "Payload (kg)",
  "ZFW (kg)",
  "MTOW (kg)",
  "Landing Weight (kg)",
  "Fuel for Dest. (kg)",
  "Seat Capacity",
]
export const HELICOPTER_METRICS = [
  "TOD (m)",
  "Climb (m/s)",
  "Payload (kg)",
  "ZFW (kg)",
  "MTOW (kg)",
  "Landing Weight (kg)",
  "Fuel for Dest. (kg)",
  "Seat Capacity",
]

export const METRIC_TITLES: { [key: string]: string } = {
  tod: "TODA (m)",
  climb: "Climb %",
  payload: "Payload (kg)",
  zfw: "ZFW (kg)",
  mtow: "MTOW (kg)",
  land: "Landing Weight (kg)",
  fuel: "Fuel for Dest. (kg)",
  seats: "Seat Capacity",
}

export const getAircraftDataset = async (): Promise<AircraftData[]> => {
  return await aircraftService.getAircraft()
}

export const RUNWAY_CONDITION_FACTORS = {
  dry: { takeoff: 1.0, landing: 1.0, accelStop: 1.0 },
  wet: { takeoff: 1.1, landing: 1.15, accelStop: 1.15 },
  slush: { takeoff: 1.2, landing: 1.1, accelStop: 1.25 },
  snow: { takeoff: 1.25, landing: 1.15, accelStop: 1.3 },
  ice: { takeoff: 1.4, landing: 1.3, accelStop: 1.5 },
}

export const RUNWAY_CONDITION_COLORS = {
  dry: "#4b5563",
  wet: "#2563eb",
  snow: "#f9fafb",
  ice: "#60a5fa",
  slush: "#b45309",
}

export interface UserCredential {
  id: string
  username: string
  password: string
  email?: string
}

export const DEFAULT_USERS: UserCredential[] = [
  {
    id: "1",
    username: "Saad.r",
    password: "Boeing_737",
    email: "saad@example.com",
  },
]

export const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin@2025",
  email: "admin@aerodatapro.com",
}

export const getValidCredentials = async (): Promise<UserCredential[]> => {
  // Only run on client side
  if (typeof window === "undefined") {
    return []
  }

  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.from("users").select("*")

    if (error) {
      console.error("Failed to fetch valid credentials:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching credentials:", error)
    return []
  }
}

// For backward compatibility with login form
export const VALID_CREDENTIALS = DEFAULT_USERS.map((user) => ({
  username: user.username,
  password: user.password,
}))


