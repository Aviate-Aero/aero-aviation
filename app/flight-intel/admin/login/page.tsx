"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/buttons/Standard"
import { Input } from "@/components/input/Standard"
import { Label } from "@/components/label/Standard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card/Standard"
import { Shield, Lock, ArrowRight, AlertCircle } from "lucide-react"
import { ADMIN_CREDENTIALS } from "@/components/lib/constants"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    setTimeout(() => {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem("admin_authenticated", "true")
        router.push("/flight-intel/admin")
      } else {
        setError("Invalid admin credentials")
        setIsLoading(false)
      }
    }, 800)
  }

  return (
    <main className="relative bg-black text-white overflow-hidden">
      {/* Background image with blur overlay - only behind the login card area */}
      <div className="fixed inset-0 z-10">
        <Image
          src="/Images/fleetManagementLogin.webp"
          alt="Background"
          fill
          className="object-cover blur-sm"
          priority
        />
        <div className="absolute inset-0" />
      </div>

      <section className="relative z-20 min-h-screen flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10 ring-1 ring-sky-500/30"
            >
              <Shield className="h-8 w-8 text-sky-400" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-3xl md:text-4xl font-light text-white"
            >
              Admin Portal
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mt-2 text-sm text-zinc-300"
            >
              Secure access to Aero Aviation management
            </motion.p>
          </div>

          {/* Login Card */}
          <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            <CardHeader className="space-y-1 border-b border-zinc-800/50 pb-6">
              <CardTitle className="text-2xl font-light text-white">Admin Login</CardTitle>
              <CardDescription className="text-zinc-400">
                Enter your admin credentials to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Username Field */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="admin-username" className="text-zinc-300 text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="admin-username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full px-4 py-5 text-base"
                  />
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="admin-password" className="text-zinc-300 text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      id="admin-password"
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
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-full border border-red-500/30 bg-red-500/10 p-3 flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                    <span className="text-sm text-red-300">{error}</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.3 }}
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
                        Access Admin Panel
                        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </main>
  )
}