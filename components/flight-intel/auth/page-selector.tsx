"use client"

import React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card/Standard"
import { Plane, FileText, Database, Bot, ArrowRight, Ticket, RadioTower, CloudAlert, Wind, Radar } from "lucide-react"
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
            <div className="text-sky-400 group-hover:text-sky-300 transition-colors">
              {icon}
            </div>
          </motion.div>

          <CardTitle className="text-xl font-light text-white">
            {title}
          </CardTitle>

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
  useAuth()

  const apps = [
    {
      title: "Flight Performance",
      description:
        "Compute optimal aircraft performance, generate trim sheets, and determine precise fuel loads",
      icon: <Database className="h-6 w-6" />,
      route: "/flight-intel/flightdata",
    },
    {
      title: "Dispatch",
      description:
        "Review and manage flight plans, coordinate operations, and ensure regulatory compliance",
      icon: <FileText className="h-6 w-6" />,
      route: "/flight-intel/dispatch",
    },
    {
      title: "Flight Tracker",
      description: "Track flights and Airport information in real-time.",
      icon: <Plane className="h-6 w-6" />,
      route: "/flight-intel/flight-tracker",
    },
    {
      title: "Aviation Intelligence",
      description:
        "Generate AI-powered aviation reports with real-time web search — incidents, NOTAMs, airspace closures, and more.",
      icon: <Bot className="h-6 w-6" />,
      route: "/flight-intel/aviation-report",
    },
    {
      title: "Arrivals & Departures",
      description: "Check flight arrivals and departures of any airport worldwide",
      icon: <Bot className="h-6 w-6" />,
      route: "/flight-intel/flight-destinations",
    },
    {
      title: "Airport Information",
      description: "Detailed information of any airport all over the globe",
      icon: <Bot className="h-6 w-6" />,
      route: "/flight-intel/airport-info",
    },
    {
      title: "Flight Status",
      description: "Detailed flight status information for airline operations",
      icon: <Bot className="h-6 w-6" />,
      route: "/flight-intel/flight-status",
    },
    {
      title: "Airline Fleet",
      description: "Check the aircraft inventory of any airline",
      icon: <Bot className="h-6 w-6" />,
      route: "/flight-intel/airline-fleet",
    },
    {
      title: "Airport Distance",
      description: "Check the aprrox distance between two airports",
      icon: <Bot className="h-6 w-6" />,
      route: "/flight-intel/airport-distance",
    },
    {
      title: "Airport Delays",
      description: "Check the airport flight delays, present or historical",
      icon: <Bot className="h-6 w-6" />,
      route: "/flight-intel/airport-delays",
    },
    {
      title: "Airport Runways",
      description: "Check the information related to airport runways",
      icon: <Bot className="h-6 w-6" />,
      route: "/flight-intel/airport-runways",
    },
    {
      title: "Aircraft Performance",
      description: "View aircraft performance data including range, cruise speed, service ceiling, MTOW, dimensions, and passenger capacity",
      icon: <Plane className="h-6 w-6" />,
      route: "/flight-intel/aircraft-performance",
    },
    {
      title: "Ticket Search",
      description: "Search ticket options by route, travel date, price, duration, stops, and airline legs",
      icon: <Ticket className="h-6 w-6" />,
      route: "/flight-intel/ticket-search",
    },
    {
      title: "NOTAM Search",
      description: "Search airport NOTAMs by ICAO code, including operational notices, effective times, expiry times, and raw NOTAM text",
      icon: <RadioTower className="h-6 w-6" />,
      route: "/flight-intel/notams",
    },
    {
      title: "FAA Airport Delays",
      description: "Check FAA airport delay alerts including ground delays, ground stops, closures, and airspace flow programs",
      icon: <CloudAlert className="h-6 w-6" />,
      route: "/flight-intel/delays/airport-delays",
    },
     {
      title: "FAA Delays",
      description: "Check FAA airport delay alerts including ground delays, ground stops, closures, and airspace flow programs",
      icon: <CloudAlert className="h-6 w-6" />,
      route: "/flight-intel/delays/faa-delays",
    },
    {
      title: "PIREPs",
      description: "View recent pilot reports including turbulence, altitude, aircraft type, location, remarks, and raw PIREP text",
      icon: <RadioTower className="h-6 w-6" />,
      route: "/flight-intel/pireps",
    },
    {
      title: "Winds Aloft",
      description: "View winds aloft forecast data by altitude, station, forecast hour, wind direction, speed, and raw forecast groups",
      icon: <Wind className="h-6 w-6" />,
      route: "/flight-intel/winds-aloft",
    },
    {
      title: "Airport Charts",
      description:"View airport diagrams, SID, STAR, approach, and other published procedure charts by ICAO code",
      icon: <FileText className="h-6 w-6" />,
      route: "/flight-intel/aerodrome-charts",  
    },
    {
      title: "ADS-B Statistics",
      description: "View ADS-B aircraft statistics and feed-level summaries from Skylink",
      icon: <Radar className="h-6 w-6" />,
      route: "/flight-intel/adsb-tracking",
    },
    {
      title: "Airport Routes",
      description: "View ADS-B aircraft statistics and feed-level summaries from Skylink",
      icon: <Radar className="h-6 w-6" />,
      route: "/flight-intel/airport-routes",
    },
        {
      title: "FAA LADD",
      description: "View ADS-B aircraft statistics and feed-level summaries from Skylink",
      icon: <Radar className="h-6 w-6" />,
      route: "/flight-intel/faa-ladd",
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
    <main className="relative bg-black text-white overflow-hidden mt-20">
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

          {/* Powered By Footer */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="relative z-10 mt-12 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 px-5 py-4 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-mono uppercase tracking-wider text-white">
                Powered by
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
                  FlightRadar API
                </span>

                <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
                  AeroDataBox API
                </span>

                <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
                  Skylink API
                </span>

                <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
                  Anthropic
                </span>
              </div>
            </div>
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