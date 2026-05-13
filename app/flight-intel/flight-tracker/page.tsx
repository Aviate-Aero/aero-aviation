"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs/Standard"
import { Plane, Building, Radar, History, CloudSun, Gauge, Crosshair, Battery } from "lucide-react"
import { Button } from "@/components/buttons/Standard"
import { useRouter } from "next/navigation"
import FlightInformation from "@/components/flight-intel/flight-tracker/flightDetails/Standard"
import AirportInformation from "@/components/flight-intel/flight-tracker/airportInfo/Standard"
import FlightTracker from "@/components/flight-intel/flight-tracker/flightSearch/main/Standard"
import HistoricEvents from "@/components/flight-intel/flight-tracker/flightHistory/Standard"
import WeatherTracker from "@/components/flight-intel/flight-tracker/weather/Standard"

interface Flight {
  fr24_id: string
  flight: string
  callsign: string
  operating_as: string
  painted_as: string
  type: string
  reg: string
  orig_icao: string
  orig_iata: string
  datetime_takeoff: string
  runway_takeoff: string
  dest_icao: string
  dest_iata: string
  dest_icao_actual: string
  dest_iata_actual: string
  datetime_landed: string
  runway_landed: string
  flight_time: number
  actual_distance: number
  circle_distance: number
  category: string | null
  hex: string
  first_seen: string
  last_seen: string
  flight_ended: boolean
}

interface Airport {
  iata: string
  icao: string
  name: string
  city?: string
  country?: string
  country_code?: string
  elevation?: number
  latitude?: number
  longitude?: number
  timezone?: string
}

export default function FlightTrackerPage() {
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null)
  const router = useRouter()

  return (
    <main className="relative bg-black text-white overflow-hidden mt-10">

      <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="relative z-20 mx-auto max-w-7xl px-6 lg:px-12 pt-28"
>
  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50">
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75 animate-ping" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border border-emerald-400/50" />
      </div>
      <span className="text-xs text-emerald-400 font-mono uppercase tracking-wider">
        All Systems Active
      </span>
    </div>

    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 font-mono">UTC</span>
        <span className="text-sm text-sky-400 font-mono tabular-nums">
          {new Date().toISOString().slice(11, 19)}
        </span>
      </div>
      <Button
        onClick={() => router.push('/flight-intel/admin')}
        variant="outline"
        size="sm"
        className="border-zinc-700 bg-black/40 text-zinc-300 hover:bg-sky-500/10 hover:text-sky-400 hover:border-sky-500/50 rounded-full px-4 py-1.5 text-xs"
      >
        Back to Main
      </Button>
    </div>
  </div>
</motion.div>

      <section className="relative z-20 pt-8 pb-24 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                <Plane className="w-6 h-6 text-sky-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-light text-zinc-100">
                Flight & Airport Tracker
              </h1>
            </div>
            <p className="text-lg text-zinc-400 max-w-2xl">
              Search for flight information, airport details, and real‑time flight tracking
            </p>
          </motion.div>

          {/* Main Tabs */}
          <Tabs defaultValue="flights" className="w-full">
            <TabsList className="flex items-center justify-start sm:justify-center gap-2 p-1.5 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-full overflow-x-auto overflow-y-hidden">
  <TabsTrigger
    value="flights"
    className="flex items-center justify-center gap-2 py-3 px-5 rounded-full text-base font-medium text-zinc-400 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-400 data-[state=active]:border data-[state=active]:border-sky-500/30 transition-all duration-300"
  >
    <Plane className="w-5 h-5" />
    <span className="hidden sm:inline">Flight Info</span>
  </TabsTrigger>
  <TabsTrigger
    value="airports"
    className="flex items-center justify-center gap-2 py-3 px-5 rounded-full text-base font-medium text-zinc-400 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-400 data-[state=active]:border data-[state=active]:border-sky-500/30 transition-all duration-300"
  >
    <Building className="w-5 h-5" />
    <span className="hidden sm:inline">Airport Info</span>
  </TabsTrigger>
  <TabsTrigger
    value="tracker"
    className="flex items-center justify-center gap-2 py-3 px-5 rounded-full text-base font-medium text-zinc-400 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-400 data-[state=active]:border data-[state=active]:border-sky-500/30 transition-all duration-300"
  >
    <Radar className="w-5 h-5" />
    <span className="hidden sm:inline">Live Tracker</span>
  </TabsTrigger>
  <TabsTrigger
    value="historic"
    className="flex items-center justify-center gap-2 py-3 px-5 rounded-full text-base font-medium text-zinc-400 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-400 data-[state=active]:border data-[state=active]:border-sky-500/30 transition-all duration-300"
  >
    <History className="w-5 h-5" />
    <span className="hidden sm:inline">History</span>
  </TabsTrigger>
  <TabsTrigger
    value="weather"
    className="flex items-center justify-center gap-2 py-3 px-5 rounded-full text-base font-medium text-zinc-400 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-400 data-[state=active]:border data-[state=active]:border-sky-500/30 transition-all duration-300"
  >
    <CloudSun className="w-5 h-5" />
    <span className="hidden sm:inline">Weather</span>
  </TabsTrigger>
</TabsList>

            <TabsContent value="flights" className="space-y-6">
              <FlightInformation onFlightSelect={setSelectedFlight} initialSearchType="flights" />
            </TabsContent>

            <TabsContent value="airports" className="space-y-6">
              <AirportInformation onAirportSelect={setSelectedAirport} />
            </TabsContent>

            <TabsContent value="tracker" className="space-y-6">
              <FlightTracker />
            </TabsContent>

            <TabsContent value="historic" className="space-y-6">
              <HistoricEvents />
            </TabsContent>

            <TabsContent value="weather" className="space-y-6">
              <WeatherTracker />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  )
}