"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/buttons/Standard"
import { Input } from "@/components/input/Standard"
import { Label } from "@/components/label/Standard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card/Standard"
import { Starfield } from "@/components/ui/starfield/Standard"
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
                  <CardTitle className="text-2xl font-light text-white">Welcome Back</CardTitle>
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
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}