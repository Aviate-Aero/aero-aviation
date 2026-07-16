"use client"

import { motion, type Variants } from "framer-motion"
import { ArrowRight, Check, Cloud } from "lucide-react"
import Image from "next/image"
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
    
    title: "Follow every movement on one operational map.",
    description:
      "Track aircraft position, route progress, distance and estimated flight time in a focused interface built for active operations.",
    points: ["Interactive route tracking", "Great-circle distance", "Flight-time estimates"],
    demo: <FlightMapDemo />,
  },
  {
    eyebrow: "Performance",
    title: "Turn live telemetry into useful decisions.",
    description:
      "Monitor altitude, speed, vertical rate and the complete flight profile without losing the details that matter to your team.",
    points: ["Real-time telemetry", "Interactive performance charts", "Flight-envelope analysis"],
    demo: <PerformanceMetricsDemo />,
  },
  {
    eyebrow: "Airport operations",
    title: "Keep the live board clear, current and actionable.",
    description:
      "See schedules, gates and status changes in a single live view so teams can respond quickly when airport operations shift.",
    points: ["Real-time updates", "Clear flight information", "Status tracking and alerts"],
    demo: <LiveFlightBoardDemo />,
  },
]

const testDocuments = [
  { title: "GNSS Interference Over Doha", image: "/flight-core-system-testing/1.jpeg", width: 1044, height: 1600 },
  { title: "Polar Route Surveillance", image: "/flight-core-system-testing/2.jpeg", width: 888, height: 1600 },
  { title: "North Atlantic Oceanic Surveillance Trial", image: "/flight-core-system-testing/3.jpeg", width: 888, height: 1600 },
  { title: "Aireon Space-Based ADS-B Surveillance Test", image: "/flight-core-system-testing/4.jpeg", width: 888, height: 1600 },
  { title: "Oceanic NATS Testing Trial 2", image: "/flight-core-system-testing/5.jpeg", width: 888, height: 1600 },
  { title: "Mahe Island, Seychelles — African Testing Phase 2", image: "/flight-core-system-testing/6.jpeg", width: 800, height: 1600 },
  { title: "Aireon Satellite Transition Test", image: "/flight-core-system-testing/7.jpeg", width: 888, height: 1600 },
  { title: "Aireon Space-Based ADS-B Surveillance Test", image: "/flight-core-system-testing/8.jpeg", width: 888, height: 1600 },
  { title: "North Atlantic Oceanic Surveillance Trial", image: "/flight-core-system-testing/9.jpeg", width: 888, height: 1600 },
  { title: "Aireon Space-Based ADS-B Surveillance Test", image: "/flight-core-system-testing/10.jpeg", width: 888, height: 1600 },
  { title: "High Altitude Operational Certification", image: "/flight-core-system-testing/11.jpeg", width: 888, height: 1600 },
]

export default function FeaturesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <section
        className="relative px-6 pb-23 lg:px-10 lg:pb-30"
        style={{ paddingTop: "11rem" }}
      >
        <div className="mx-auto max-w-7xl">
          <motion.div initial="hidden" animate="visible" className="max-w-4xl">
            <motion.h1 variants={reveal} className="text-sky-400 max-w-4xl text-5xl font-light leading-[0.98] text-zinc-100 sm:text-6xl lg:text-8xl">
               Flight Core Intelligence
            </motion.h1>
            <motion.p variants={reveal} className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400 md:text-xl">
              Aviation intelligence, aligned around the operation.
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

      <section className="px-6 py-24 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-7xl space-y-28 lg:space-y-40">
          {features.map((feature, index) => {
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

      <section className="border-t border-zinc-900 px-6 py-24 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={reveal}
            className="max-w-3xl"
          >
            <h2 className="mt-4 text-balance text-4xl font-light leading-tight text-zinc-100 sm:text-5xl lg:text-6xl">
              Flight Core System Testing
            </h2>
            <p className="mt-6 max-w-2xl mb-6 text-base leading-7 text-zinc-400 md:text-lg md:leading-8">
              Review the operational trials, surveillance validations and live-flight testing that support Flight Core Intelligence.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {testDocuments.map((document) => (
              <motion.article
                key={document.image}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={reveal}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition duration-300 hover:-translate-y-1 hover:border-sky-500/40"
              >
                <a
                  href={document.image}
                  target="_blank"
                  rel="noreferrer"
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400"
                  aria-label={`Open ${document.title} in a new tab`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
                    <Image
                      src={document.image}
                      alt={`${document.title} document preview`}
                      width={document.width}
                      height={document.height}
                      sizes="(min-width: 1280px) 405px, (min-width: 640px) 50vw, 100vw"
                      className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </a>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
