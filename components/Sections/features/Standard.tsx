"use client"

import { motion, useInView } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { Cloud, Plane, Globe2, Navigation } from "lucide-react"
import { Card, CardContent } from "@/components/card/Standard"

const METAR_STRING = "XXXX 010900Z 27015KT 9999 FEW035 22/10 Q1013 NOSIG"

const weatherRows = [
  { label: "Station",     value: "XXXX",          color: "sky"   },
  { label: "Report Time", value: "Day 01 at 09:00Z", color: null },
  { label: "Wind",        value: "270° / 15 kt",  color: "sky"   },
  { label: "Visibility",  value: "10 km or more", color: null    },
  { label: "Clouds",      value: "Few at 3500 ft",color: null    },
  { label: "Temp / Dew",  value: "22°C / 10°C",   color: "sky"   },
  { label: "Pressure",    value: "1013 hPa",      color: "amber" },
  { label: "Trend",       value: "NOSIG",         color: "amber" },
] as const

const coverageStats = [
  { value: "50K+",   label: "Airports",      sub: "worldwide"     },
  { value: "100K+",  label: "Daily Flights", sub: "monitored"     },
  { value: "< 1 min",label: "Data Refresh",  sub: "METAR cycle"   },
  { value: "Global", label: "Coverage",      sub: "all ICAO FIRs" },
]

// Pre-calculated quadratic bezier keyframes for: M 50 65 Q 130 10 200 45
const planeKfX = [50, 89, 127, 164, 200]
const planeKfY = [65, 43, 32, 33, 45]

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" })
  const [typedMetar, setTypedMetar] = useState("")

  useEffect(() => {
    if (!isInView) return
    let i = 0
    const timer = setInterval(() => {
      i++
      setTypedMetar(METAR_STRING.slice(0, i))
      if (i >= METAR_STRING.length) clearInterval(timer)
    }, 52)
    return () => clearInterval(timer)
  }, [isInView])

  return (
    <section id="features" className="pt-8 pb-24">
      <div ref={sectionRef} className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
            Flight Core Intelligence
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-zinc-100 mb-4">
            Aviation intelligence,<br />redefined.
          </h2>
          <p className="text-zinc-400 max-w-xl text-balance text-lg">
            From live METAR decoding to real-time flight tracking — Flight Core Intelligence gives
            pilots, dispatchers, and enthusiasts a complete operational picture.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">

          {/* ── Card 1: METAR Decoder (3 cols) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-3"
          >
            <Card className="group h-full overflow-hidden border-zinc-800/50 bg-zinc-900/50 hover:border-sky-800/40 transition-all duration-300 rounded-2xl">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                    <Cloud className="w-5 h-5 text-sky-400 group-hover:text-sky-300 transition-colors" />
                  </div>
                  <p className="font-light text-zinc-100">METAR Decoder</p>
                  <span className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/15 border border-green-500/30 text-green-400 shrink-0">
                    VFR
                  </span>
                </div>
                <p className="text-zinc-500 text-sm mb-4">
                  Decode live METAR reports instantly — understand any airport&apos;s weather at a glance.
                </p>

                {/* METAR terminal */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 mb-4 font-mono">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    <span className="ml-2 text-xs text-zinc-600">METAR · EGLL</span>
                  </div>
                  <div className="text-sm leading-relaxed">
                    <span className="text-green-400">{typedMetar}</span>
                    <motion.span
                      className="inline-block w-0.5 h-4 bg-green-400 ml-0.5 align-middle"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                    />
                  </div>
                </div>

                {/* Decoded rows — 2-column grid */}
                <div className="grid grid-cols-2 gap-x-6">
                  {weatherRows.map((row, i) => (
                    <motion.div
                      key={row.label}
                      className="flex items-center justify-between py-[7px] border-b border-zinc-800/60 last:border-0"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.07 }}
                    >
                      <span className="text-zinc-600 text-xs">{row.label}</span>
                      <span
                        className={
                          row.color === "sky"
                            ? "text-sky-400 text-xs font-mono"
                            : row.color === "amber"
                            ? "text-amber-400 text-xs font-mono"
                            : "text-zinc-300 text-xs font-mono"
                        }
                      >
                        {row.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Card 2: Live Flight Tracking (2 cols) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-2"
          >
            <Card className="group h-full overflow-hidden border-zinc-800/50 bg-zinc-900/50 hover:border-sky-800/40 transition-all duration-300 rounded-2xl">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                    <Navigation className="w-5 h-5 text-sky-400 group-hover:text-sky-300 transition-colors" />
                  </div>
                  <p className="font-light text-zinc-100">Live Flight Tracking</p>
                </div>
                <p className="text-zinc-500 text-sm mb-4">
                  Real-time ADS-B position updates, altitude, heading, and speed — across the globe.
                </p>

                {/* Stylised map SVG */}
                <div className="mt-auto rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden relative">
                  <div className="absolute top-2.5 left-3 z-10 flex items-center gap-1.5">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-red-500"
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                    />
                    <span className="text-xs text-zinc-400 font-mono">LIVE</span>
                  </div>
                  <svg viewBox="0 0 280 172" className="w-full" aria-hidden="true">
                    <defs>
                      <pattern id="mapgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#27272a" strokeWidth="0.5" />
                      </pattern>
                      <filter id="planeglow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <rect width="280" height="172" fill="url(#mapgrid)" />

                    {/* Simplified landmass blobs */}
                    <path d="M 15 28 Q 42 18 64 34 Q 74 52 68 74 Q 52 82 34 74 Q 17 63 14 47 Z" fill="#1c1c1e" />
                    <path d="M 118 22 Q 157 15 172 43 Q 178 63 164 86 Q 148 97 129 86 Q 112 68 111 50 Z" fill="#1c1c1e" />
                    <path d="M 174 12 Q 240 7 258 37 Q 267 58 256 80 Q 238 91 210 83 Q 183 69 176 53 Q 167 35 174 20 Z" fill="#1c1c1e" />

                    {/* Dashed flight path */}
                    <motion.path
                      d="M 50 65 Q 130 10 200 45"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      opacity="0.5"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 2.2, delay: 0.5, ease: "easeInOut" }}
                    />

                    {/* Departure / Arrival dots */}
                    <circle cx="50" cy="65" r="3" fill="#38bdf8" opacity="0.85" />
                    <text x="55" y="77" fill="#71717a" fontSize="7" fontFamily="monospace">IAD</text>
                    <circle cx="200" cy="45" r="3" fill="#38bdf8" opacity="0.85" />
                    <text x="205" y="57" fill="#71717a" fontSize="7" fontFamily="monospace">EGLL</text>

                    {/* Animated plane (group translate) */}
                    <motion.g
                      filter="url(#planeglow)"
                      initial={{ x: planeKfX[0], y: planeKfY[0] }}
                      animate={{ x: planeKfX, y: planeKfY }}
                      transition={{
                        duration: 4,
                        delay: 1.2,
                        ease: "easeInOut",
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: 2,
                      }}
                    >
                      <circle r="5" fill="#7dd3fc" />
                      <circle r="10" fill="#38bdf8" opacity="0.2" />
                    </motion.g>

                    {/* Ambient flight dots */}
                    {[
                      { x: 92, y: 48 },
                      { x: 150, y: 30 },
                      { x: 222, y: 63 },
                      { x: 72, y: 92 },
                    ].map((dot, i) => (
                      <motion.circle
                        key={i}
                        cx={dot.x}
                        cy={dot.y}
                        r="2.5"
                        fill="#fbbf24"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{
                          duration: 1.8 + i * 0.35,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.4,
                        }}
                      />
                    ))}

                    {/* Region labels */}
                    <text x="30"  y="102" fill="#3f3f46" fontSize="7" fontFamily="monospace">KIAD Rwy 30</text>
                    <text x="180" y="38"  fill="#3f3f46" fontSize="7" fontFamily="monospace">EGLL Rwy 27L</text>
                  </svg>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Card 3: Flight Intelligence (2 cols) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2"
          >
            <Card className="group h-full overflow-hidden border-zinc-800/50 bg-zinc-900/50 hover:border-sky-800/40 transition-all duration-300 rounded-2xl">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                    <Plane className="w-5 h-5 text-sky-400 group-hover:text-sky-300 transition-colors" />
                  </div>
                  <p className="font-light text-zinc-100">Flight Intelligence</p>
                </div>
                <p className="text-zinc-500 text-sm mb-4">
                  Aircraft info, route, timing, and tracking history — unified in a single view.
                </p>

                <div className="mt-auto space-y-2.5">
                  {/* Flight card */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-zinc-100 font-mono text-sm font-semibold">XX0000</span>
                          <span className="text-xs text-zinc-600">/ Callsign</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400">
                            Passenger
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-1">Reg · Operated by: Airline</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sky-400 font-mono text-base font-semibold">B789</div>
                        <div className="text-xs text-zinc-600">Aircraft Type</div>
                      </div>
                    </div>

                    {/* Route strip */}
                    <div className="flex items-center gap-3 bg-zinc-900 rounded-lg px-3 py-2.5">
                      <div className="text-center">
                        <div className="text-zinc-100 font-mono font-bold text-xl leading-none">ORG</div>
                        <div className="text-xs text-zinc-600 mt-0.5">Origin</div>
                      </div>
                      <div className="flex-1 flex items-center gap-1 min-w-0">
                        <div className="flex-1 h-px bg-zinc-700" />
                        <motion.div
                          animate={{ x: [-2, 2, -2] }}
                          transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                        >
                          <Plane className="w-4 h-4 text-sky-400 shrink-0" />
                        </motion.div>
                        <div className="flex-1 h-px bg-zinc-700" />
                      </div>
                      <div className="text-center">
                        <div className="text-zinc-100 font-mono font-bold text-xl leading-none">DST</div>
                        <div className="text-xs text-zinc-600 mt-0.5">Destination</div>
                      </div>
                    </div>
                  </div>

                  {/* Timing / distance chips */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                      <div className="text-xs text-zinc-600 mb-1">Departure</div>
                      <div className="text-xs text-zinc-400 font-mono">Scheduled / actual</div>
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                      <div className="text-xs text-zinc-600 mb-1">Distance</div>
                      <div className="text-xs text-zinc-400 font-mono">GCD + actual route</div>
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                      <div className="text-xs text-zinc-600 mb-1">Aircraft</div>
                      <div className="text-xs text-zinc-400 font-mono">Type · Reg · Operator</div>
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                      <div className="text-xs text-zinc-600 mb-1">Flight History</div>
                      <div className="text-xs text-zinc-400 font-mono">Track + timeline</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Card 4: Global Aviation Coverage (3 cols) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-3"
          >
            <Card className="group h-full overflow-hidden border-zinc-800/50 bg-zinc-900/50 hover:border-sky-800/40 transition-all duration-300 rounded-2xl">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0"
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  >
                    <Globe2 className="w-5 h-5 text-sky-400 group-hover:text-sky-300 transition-colors" />
                  </motion.div>
                  <p className="font-light text-zinc-100">Global Aviation Coverage</p>
                </div>
                <p className="text-zinc-500 text-sm mb-5">
                  Comprehensive data across all ICAO regions — METARs, TAFs, SIGMETs, NOTAMs, and
                  live ADS-B feeds refreshed every 30 seconds.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-auto">
                  {coverageStats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="bg-zinc-900/80 rounded-xl border border-zinc-800/60 p-4"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      whileHover={{ borderColor: "rgba(56,189,248,0.3)", y: -2, transition: { duration: 0.2 } }}
                    >
                      <span className="block text-2xl font-light text-zinc-100 mb-0.5">{stat.value}</span>
                      <span className="block text-xs font-medium text-zinc-400">{stat.label}</span>
                      <span className="block text-xs text-zinc-600">{stat.sub}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4">
                  <span className="text-xs text-zinc-600 font-mono">TAF · METAR · SIGMET · NOTAM · ADS-B</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mt-16 relative rounded-2xl border border-zinc-800/50 bg-zinc-900/40 overflow-hidden px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          {/* Subtle sky glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative text-center md:text-left max-w-xl">
            <p className="text-sm font-medium text-sky-400 uppercase tracking-wider mb-3">
              Start today
            </p>
            <h3 className="text-3xl md:text-4xl font-light text-zinc-100 mb-3 text-balance">
              Your operational picture<br className="hidden md:block" /> starts here.
            </h3>
            <p className="text-zinc-400 text-base text-balance">
              Full METAR decoding, live flight tracking, and weather intelligence —
              no credit card required. Upgrade when your operation demands more.
            </p>
          </div>

          <div className="relative flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-3 shrink-0">
            <a
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-all duration-300 hover:scale-[1.03] shadow-lg shadow-sky-500/20"
            >
              Get Started Free
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 text-sm font-medium transition-all duration-300"
            >
              View Pricing
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
