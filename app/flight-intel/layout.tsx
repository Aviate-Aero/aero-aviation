"use client"

import type React from "react"
import { AuthProvider } from "@/components/flight-intel/auth/auth-context"


export default function FlightIntelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
