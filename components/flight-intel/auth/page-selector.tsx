"use client"

import React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card/Standard"
import { Plane, FileText, Database, Bot, ArrowRight } from "lucide-react"
import { useAuth } from "./auth-context"

interface AppCardProps {
  title: string
  description: string
  icon: React.ReactNode
  route: string
  delay: number
}

function AppCard({ title, description, icon, route, delay }: AppCardProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -6 }}
      className="h-full"
    >
      <Card
        className="group relative h-full flex flex-col border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-500 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 cursor-pointer"
        onClick={() => router.push(route)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-sky-500/5 group-hover:to-transparent transition-all duration-500" />
        <CardHeader className="relative z-10 pb-4">
          <motion.div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/30 group-hover:scale-105 group-hover:bg-sky-500/20 transition-all duration-300"
            whileHover={{ rotate: 8 }}
          >
            <div className="text-sky-400 group-hover:text-sky-300 transition-colors">{icon}</div>
          </motion.div>
          <CardTitle className="text-xl font-light text-white">{title}</CardTitle>
          <CardDescription className="text-zinc-400 text-sm leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 pt-0 mt-auto">
          <div className="flex items-center text-sm font-medium text-sky-400 group-hover:text-sky-300 group-hover:gap-2 transition-all duration-300">
            <span>Launch App</span>
            <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function AppSelector() {
  useAuth() // keep context alive for auth

  const apps = [
    {
      title: "Flight Performance",
      description: "Compute optimal aircraft performance, generate trim sheets, and determine precise fuel loads",
      icon: <Database className="h-6 w-6" />,
      route: "/aerodata/flightdata",
    },
    {
      title: "Dispatch",
      description: "Review and manage flight plans, coordinate operations, and ensure regulatory compliance",
      icon: <FileText className="h-6 w-6" />,
      route: "/aerodata/dispatch",
    },
    {
      title: "Flight Tracker",
      description: "Track flights and Airport information in real-time.",
      icon: <Plane className="h-6 w-6" />,
      route: "/flight-intel/flight-tracker",
    },
    {
      title: "Aviation Intelligence",
      description: "Generate AI-powered aviation reports with real-time web search — incidents, NOTAMs, airspace closures, and more.",
      icon: <Bot className="h-6 w-6" />,
      route: "/aerodata/aviation-report",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  return (
    <main className="relative bg-black text-white overflow-hidden">

      <section className="relative z-20 min-h-screen flex flex-col justify-center py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-zinc-100 mb-4">
              Flight Operations Management
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Select an application to begin managing your aviation operations
            </p>
          </motion.div>

          {/* App Cards Grid */}
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {apps.map((app, index) => (
              <AppCard
                key={app.title}
                title={app.title}
                description={app.description}
                icon={app.icon}
                route={app.route}
                delay={index * 0.1}
              />
            ))}
          </motion.div>

          {/* Decorative element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-96 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"
          />
        </div>
      </section>
    </main>
  )
}