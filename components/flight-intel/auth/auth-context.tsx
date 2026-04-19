"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { getValidCredentials } from "@/components/lib/constants"

export type SubscriptionStatus = 'active' | 'inactive' | 'loading' | null

interface AuthContextType {
  isAuthenticated: boolean
  username: string | null
  subscriptionStatus: SubscriptionStatus
  login: (username: string, subscriptionStatus: SubscriptionStatus) => void
  logout: () => void
  refreshSubscription: (username: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated]       = useState(false)
  const [username, setUsername]                     = useState<string | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(null)

  const login = (u: string, status: SubscriptionStatus) => {
    setIsAuthenticated(true)
    setUsername(u)
    setSubscriptionStatus(status)
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUsername(null)
    setSubscriptionStatus(null)
  }

  const refreshSubscription = async (u: string) => {
    setSubscriptionStatus('loading')
    const status = await fetchSubscriptionStatus(u)
    setSubscriptionStatus(status)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, subscriptionStatus, login, logout, refreshSubscription }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider")
  return context
}

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  const credentials = await getValidCredentials()
  return credentials.some((c) => c.username === username && c.password === password)
}

// --- SaaS / Stripe subscription lookup (disabled) ---
export async function fetchSubscriptionStatus(_username: string): Promise<SubscriptionStatus> {
  return 'active'
  // if (typeof window === 'undefined') return null
  // try {
  //   const { createSupabaseClient } = await import('@components/lib/supbase-client')
  //   const supabase = createSupabaseClient()
  //   const { data } = await supabase
  //     .from('users')
  //     .select('subscription_status')
  //     .eq('username', _username)
  //     .single()
  //   return (data?.subscription_status === 'active') ? 'active' : 'inactive'
  // } catch {
  //   return 'inactive'
  // }
}
// --- end SaaS subscription lookup ---
