"use client"

import { motion, type Variants } from "framer-motion"
import { ArrowRight, Check, Cloud, Plane, Radio, TrendingUp } from "lucide-react"
import Link from "next/link"

import FlightMapDemo from "@/components/features/flight-map-demo"
import LiveFlightBoardDemo from "@/components/features/live-flight-board-demo"
import PerformanceMetricsDemo from "@/components/features/performace-metrics-demo"
import WeatherDemo from "@/components/features/weather-demo"

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1] },
  },
}

const features = [
  {
    eyebrow: "Weather intelligence",
    title: "Read the conditions before they shape the flight.",
    description:
      "Live METAR data and clear operational context give crews a faster, more complete view of conditions at departure and arrival.",
    points: ["Live METAR decoding", "Weather trend analysis", "Critical condition alerts"],
    icon: Cloud,
    demo: <WeatherDemo />,
  },
  {
    eyebrow: "Global tracking",
    title: "Follow every movement on one operational map.",
    description:
      "Track aircraft position, route progress, distance and estimated flight time in a focused interface built for active operations.",
    points: ["Interactive route tracking", "Great-circle distance", "Flight-time estimates"],
    icon: Plane,
    demo: <FlightMapDemo />,
  },
  {
    eyebrow: "Performance",
    title: "Turn live telemetry into useful decisions.",
    description:
      "Monitor altitude, speed, vertical rate and the complete flight profile without losing the details that matter to your team.",
    points: ["Real-time telemetry", "Interactive performance charts", "Flight-envelope analysis"],
    icon: TrendingUp,
    demo: <PerformanceMetricsDemo />,
  },
  {
    eyebrow: "Airport operations",
    title: "Keep the live board clear, current and actionable.",
    description:
      "See schedules, gates and status changes in a single live view so teams can respond quickly when airport operations shift.",
    points: ["Real-time updates", "Clear flight information", "Status tracking and alerts"],
    icon: Radio,
    demo: <LiveFlightBoardDemo />,
  },
]

export default function FeaturesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <section
        className="relative px-6 pb-24 lg:px-12 lg:pb-32"
        style={{ paddingTop: "11rem" }}
      >
        <div className="mx-auto max-w-7xl">
          <motion.div initial="hidden" animate="visible" className="max-w-4xl">
            <motion.p variants={reveal} className="mb-5 text-sm font-medium uppercase tracking-[0.22em] text-sky-400">
              Flight Core Intelligence
            </motion.p>
            <motion.h1 variants={reveal} className="max-w-4xl text-balance text-5xl font-light leading-[0.98] text-zinc-100 sm:text-6xl lg:text-8xl">
              Aviation intelligence, aligned around the operation.
            </motion.h1>
            <motion.p variants={reveal} className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400 md:text-xl">
              A connected view of weather, aircraft movement, performance and airport activity—designed to help aviation teams act with confidence.
            </motion.p>
            <motion.div variants={reveal} className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-7 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:bg-sky-600">
                Request a demo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/60 px-7 py-3.5 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-900">
                View pricing
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-zinc-900 bg-zinc-950/60 px-6 py-6 lg:px-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
          {["Live weather", "Global tracking", "Flight performance", "Airport status"].map((label, index) => (
            <div key={label} className="flex items-center gap-3 text-sm text-zinc-400">
              <span className="font-mono text-xs text-sky-500">0{index + 1}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-24 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-7xl space-y-28 lg:space-y-40">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.article
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={reveal}
                className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16"
              >
                <div className={`lg:col-span-5 ${index % 2 ? "lg:order-2" : ""}`}>
                  <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-xl border border-sky-500/25 bg-sky-500/10">
                    <Icon className="h-5 w-5 text-sky-400" />
                  </div>
                  <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-sky-400">{feature.eyebrow}</p>
                  <h2 className="text-balance text-3xl font-light leading-tight text-zinc-100 sm:text-4xl lg:text-5xl">{feature.title}</h2>
                  <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 md:text-lg md:leading-8">{feature.description}</p>
                  <ul className="mt-8 space-y-3">
                    {feature.points.map((point) => (
                      <li key={point} className="flex items-center gap-3 text-sm text-zinc-300">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/10">
                          <Check className="h-3 w-3 text-sky-400" />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`min-w-0 lg:col-span-7 ${index % 2 ? "lg:order-1" : ""}`}>
                  {feature.demo}
                </div>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section className="px-6 pb-24 lg:px-12 lg:pb-32">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-sky-500/20 bg-sky-500/[0.06] px-6 py-14 text-center sm:px-10 lg:py-20">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">Built for active operations</p>
          <h2 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-light leading-tight text-zinc-100 md:text-5xl">Bring your operational picture into focus.</h2>
          <p className="mx-auto mt-5 max-w-xl text-zinc-400">See how Flight Core Intelligence fits your flight department, dispatch team or aviation operation.</p>
          <Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-sky-500 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-sky-600">
            Talk to our team <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}
