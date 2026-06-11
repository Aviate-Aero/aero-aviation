"use client"

import React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card/Standard"
import {
  Plane,
  FileText,
  Database,
  Bot,
  ArrowRight,
  Ticket,
  RadioTower,
  CloudAlert,
  Wind,
  Radar,
  Gauge,
  ClipboardList,
  MapPinned,
  Map,
  Building2,
  Activity,
  Rows3,
  Route,
  Clock,
  Ruler,
  TimerReset,
  PlaneLanding,
  PlaneTakeoff,
  Navigation,
  Satellite,
  ShieldAlert,
  CloudSun,
} from "lucide-react";
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
      "Calculate aircraft performance, trim data, and fuel loads with precision.",
    icon: <Gauge className="h-6 w-6" />,
    route: "/flight-intel/flightdata",
  },
  {
    title: "Dispatch",
    description:
      "Plan, review, and manage flight operations from one dispatch workspace.",
    icon: <ClipboardList className="h-6 w-6" />,
    route: "/flight-intel/dispatch",
  },
  {
    title: "Flight Tracker",
    description:
      "Track live flights and airport activity with real-time aviation data.",
    icon: <Plane className="h-6 w-6" />,
    route: "/flight-intel/flight-tracker",
  },
  {
    title: "Aviation Intelligence",
    description:
      "Generate AI-powered aviation reports on incidents, NOTAMs, closures, and more.",
    icon: <Bot className="h-6 w-6" />,
    route: "/flight-intel/aviation-report",
  },
  {
    title: "Arrivals & Departures",
    description:
      "View live arrival and departure boards for airports worldwide.",
    icon: <PlaneLanding className="h-6 w-6" />,
    route: "/flight-intel/flight-destinations",
  },
  {
    title: "Airport Information",
    description:
      "Explore essential airport details, codes, location, and operational data.",
    icon: <Building2 className="h-6 w-6" />,
    route: "/flight-intel/airport-info",
  },
  {
    title: "Flight Status",
    description:
      "Check live flight status, schedules, delays, and airline updates.",
    icon: <Activity className="h-6 w-6" />,
    route: "/flight-intel/flight-status",
  },
  {
    title: "Airline Fleet",
    description:
      "View aircraft fleets, registrations, and operator inventory by airline.",
    icon: <Rows3 className="h-6 w-6" />,
    route: "/flight-intel/airline-fleet",
  },
  {
    title: "Airport Distance",
    description:
      "Calculate approximate distance between two airports instantly.",
    icon: <Ruler className="h-6 w-6" />,
    route: "/flight-intel/airport-distance",
  },
  {
    title: "Airport Delays",
    description:
      "Monitor current and historical airport delays by location.",
    icon: <Clock className="h-6 w-6" />,
    route: "/flight-intel/airport-delays",
  },
  {
    title: "Airport Runways",
    description:
      "View runway lengths, headings, surfaces, and airport runway details.",
    icon: <Navigation className="h-6 w-6" />,
    route: "/flight-intel/airport-runways",
  },
  {
    title: "Aircraft Performance",
    description:
      "Compare aircraft range, speed, ceiling, MTOW, size, and capacity.",
    icon: <PlaneTakeoff className="h-6 w-6" />,
    route: "/flight-intel/aircraft-performance",
  },
  {
    title: "Ticket Search",
    description:
      "Find flight tickets by route, date, price, duration, stops, and airline.",
    icon: <Ticket className="h-6 w-6" />,
    route: "/flight-intel/ticket-search",
  },
  {
    title: "NOTAM Search",
    description:
      "Search airport NOTAMs with validity times, notices, and raw text.",
    icon: <RadioTower className="h-6 w-6" />,
    route: "/flight-intel/notams",
  },
  {
    title: "FAA Airport Delays",
    description:
      "Check FAA ground delays, stops, closures, and airport flow alerts.",
    icon: <CloudAlert className="h-6 w-6" />,
    route: "/flight-intel/delays/airport-delays",
  },
  {
    title: "FAA Delays",
    description:
      "Track nationwide FAA delay programs, ground stops, and airspace alerts.",
    icon: <TimerReset className="h-6 w-6" />,
    route: "/flight-intel/delays/faa-delays",
  },
  {
    title: "PIREPs",
    description:
      "View pilot reports for turbulence, icing, altitude, aircraft type, and remarks.",
    icon: <RadioTower className="h-6 w-6" />,
    route: "/flight-intel/pireps",
  },
  {
    title: "Winds Aloft",
    description:
      "Check winds aloft forecasts by station, altitude, time, speed, and direction.",
    icon: <Wind className="h-6 w-6" />,
    route: "/flight-intel/winds-aloft",
  },
  {
    title: "Airport Charts",
    description:
      "Access airport diagrams, SID, STAR, approach, and procedure charts.",
    icon: <Map className="h-6 w-6" />,
    route: "/flight-intel/aerodrome-charts",
  },
  {
    title: "ADS-B Statistics",
    description:
      "View ADS-B aircraft counts, tracking summaries, and feed-level statistics.",
    icon: <Radar className="h-6 w-6" />,
    route: "/flight-intel/adsb-tracking",
  },
  {
    title: "Airport Routes",
    description:
      "Explore airline routes, destinations, and airport connectivity data.",
    icon: <Route className="h-6 w-6" />,
    route: "/flight-intel/airport-routes",
  },
  {
    title: "FAA LADD",
    description:
      "Check aircraft privacy and FAA LADD visibility restriction data.",
    icon: <ShieldAlert className="h-6 w-6" />,
    route: "/flight-intel/faa-ladd",
  },
  {
    title: "AIRMET/SIGMET",
    description:
      "View active aviation weather advisories for hazards, turbulence, icing, and IFR.",
    icon: <CloudSun className="h-6 w-6" />,
    route: "/flight-intel/airmet",
  },
  {
    title: "Weather",
    description:
      "Check the current weather live on maps, including temperature, wind, pressure, etc.",
    icon: <CloudSun className="h-6 w-6" />,
    route: "/flight-intel/weather-maps",
  },
];

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