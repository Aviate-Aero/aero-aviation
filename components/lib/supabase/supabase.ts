import { createSupabaseClient } from "./supbase-client"

// This will throw an error if used during SSR without proper env vars
export const supabase = createSupabaseClient()