import { createSupabaseClient } from "./supabase/supbase-client"

export interface UserCredential {
  id: string
  username: string
  password: string
  email?: string
}

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