"use client"

import { useState } from "react"
import LoginForm from "@/components/flight-intel/auth/login-form"
import AppSelector from "@/components/flight-intel/auth/page-selector"
import { useAuth } from "@/components/flight-intel/auth/auth-context"

export default function AerodataHome() {
  const [showAppSelector, setShowAppSelector] = useState(false)
  const { isAuthenticated } = useAuth()

  const handleLoginSuccess = () => setShowAppSelector(true)

  if (isAuthenticated || showAppSelector) return <AppSelector />

  return <LoginForm onLoginSuccess={handleLoginSuccess} />
}
