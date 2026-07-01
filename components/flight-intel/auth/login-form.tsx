"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/buttons/Standard"
import { Input } from "@/components/input/Standard"
import { Label } from "@/components/label/Standard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card/Standard"
import { useAuth, validateCredentials, fetchSubscriptionStatus } from "./auth-context"
import { Lock, User, ArrowRight, AlertCircle, Plane } from "lucide-react"

const sanitizeInput = (input: string) => input.trim()

interface LoginFormProps {
  onLoginSuccess?: () => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setIsLoading(true)

    const sanitizedUsername = sanitizeInput(username)
    const sanitizedPassword = sanitizeInput(password)

    if (!sanitizedUsername || !sanitizedPassword) {
      setErrorMessage("Please enter username and password")
      setIsLoading(false)
      return
    }

    try {
      const isValid = await validateCredentials(sanitizedUsername, sanitizedPassword)

      if (isValid) {
        const status = await fetchSubscriptionStatus(sanitizedUsername)
        setTimeout(() => {
          login(sanitizedUsername, status)
          onLoginSuccess?.()
          setIsLoading(false)
        }, 1000)
      } else {
        setErrorMessage("Invalid username or password")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Login error:", error)
      setErrorMessage("Error validating credentials. Please try again.")
      setIsLoading(false)
    }
  }

  const titleText = "Flight Core Intelligence"
  const descriptionText =
    "Empowering Aviators to compute optimal Aircraft performance, review METAR, track flights, and determine precise fuel loads."

  return (
    <main className="relative bg-black text-white overflow-hidden">
      <section className="relative z-20 min-h-screen flex items-center justify-center py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            {/* Left Column - Branding */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center lg:text-left mb-10 lg:mb-0"
            >
              <div className="flex justify-center lg:justify-start mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                  className="w-16 h-16 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center"
                >
                  <Plane className="w-8 h-8 text-sky-400" />
                </motion.div>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-5xl md:text-6xl lg:text-7xl font-light mb-6 leading-[1.1] text-balance"
              >
                {titleText.split("").map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.03, duration: 0.3 }}
                    className="inline-block"
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="text-lg text-zinc-400 max-w-xl mx-auto lg:mx-0"
              >
                {descriptionText}
              </motion.p>

              {/* Decorative animated elements */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl"
              />
            </motion.div>

            {/* Right Column - Login Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full max-w-md mx-auto lg:mx-0"
            >
              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                <CardHeader className="space-y-1 border-b border-zinc-800/50 pb-6">
                  <CardTitle className="text-2xl font-light text-white">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* Username Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="username" className="text-zinc-300 text-sm font-medium">
                        Username
                      </Label>

                      <div className="relative">
                        <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <Input
                          id="username"
                          type="text"
                          placeholder="john.doe"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full pl-11 pr-4 py-5 text-base"
                        />
                      </div>
                    </motion.div>

                    {/* Password Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="password" className="text-zinc-300 text-sm font-medium">
                        Password
                      </Label>

                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full pl-11 pr-4 py-5 text-base"
                        />
                      </div>
                    </motion.div>

                    {/* Error Message */}
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-full border border-red-500/30 bg-red-500/10 p-3 flex items-center gap-2"
                      >
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                        <span className="text-sm text-red-300">{errorMessage}</span>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                      className="pt-2"
                    >
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="group w-full bg-sky-500 hover:bg-sky-600 text-white rounded-full py-6 text-base font-medium transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-sky-500/20"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Authenticating...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            Login
                            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  {/* Mobile App Download Section */}
                  <div className="mt-7 border-t border-zinc-800/60 pt-6">
                    <h4 className="font-heading text-sm font-semibold text-zinc-100 text-center">
                      Want to use Flight Core Intelligence on mobile?
                    </h4>

                    <p className="mt-2 text-center text-xs text-zinc-500">
                      Download our mobile app for quick access on your device.
                    </p>

                    <div className="mt-4 flex items-center justify-center gap-2">
                      {/* iOS - Coming Soon */}
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-black/40 cursor-not-allowed select-none">
                        <svg
                          className="w-4 h-4 shrink-0 text-zinc-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>

                        <span className="text-xs text-zinc-500">iOS</span>

                        <span className="text-[10px] px-1.5 py-px rounded-full bg-sky-200/15 border border-sky-500/25 text-sky-500 leading-none">
                          Soon
                        </span>
                      </div>

                      {/* Android - Linked */}
                      <Link
                        href="https://play.google.com/store/apps/details?id=com.flightcoreintelligence.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Download Flight Core Intelligence Android app on Google Play"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sky-500/30 bg-sky-500/10 transition-colors hover:bg-sky-500/20"
                      >
                        <svg
                          className="w-4 h-4 shrink-0 text-sky-400"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M3.18 23.76c.3.17.64.22.99.14l12.12-6.99-2.55-2.55-10.56 9.4zm-1.1-20.4C2.03 3.6 2 3.85 2 4.12v15.76c0 .27.03.52.08.76l.06.06 8.83-8.83v-.2L2.08 3.3l-.06.06zM20.06 10.5l-2.5-1.44-2.85 2.85 2.85 2.85 2.5-1.44c.72-.41.72-1.4.05-1.81l-.05-.01zM3.18.24L15.3 7.23l-2.55 2.55L2.17.38C2.47.3 2.82.07 3.18.24z" />
                        </svg>

                        <span className="text-xs text-sky-300">Android</span>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}