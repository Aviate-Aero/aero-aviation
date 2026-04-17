"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/buttons/Standard"
import { Starfield } from "@/components/ui/starfield/Standard"
import { Navbar } from "@/components/ui/navbar/Standard"
import { FooterSection } from "@/components/ui/footer/Standard"
import { CircleArrowRight, Fuel, Shield, Globe, FileCheck, Droplets, ThermometerSnowflake, MapPin, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/card/Standard"

const specificationHighlights = [
  {
    icon: ThermometerSnowflake,
    label: "Freeze Point",
    value: "-47°C",
    description: "Suitable for long‑haul, cold‑weather operations",
  },
  {
    icon: FileCheck,
    label: "Standards",
    value: "ASTM D1655",
    description: "DEF STAN 91-091 compliant",
  },
  {
    icon: Globe,
    label: "Global Recognition",
    value: "JET A-1",
    description: "Kerosene‑type aviation turbine fuel",
  },
]

const serviceFeatures = [
  {
    title: "Spot Uplift Coordination",
    description:
      "On‑demand fuel arrangements at airports worldwide. We manage supplier liaison, pricing, and logistics for single missions or ad‑hoc requirements.",
  },
  {
    title: "Into‑Plane Agreements",
    description:
      "Long‑term fuelling contracts with fixed pricing structures and guaranteed supply. Ideal for scheduled operators and FBO partners.",
  },
  {
    title: "Bonded Fuel Supply",
    description:
      "Duty‑free fuel for international transit operations. We handle bonded storage documentation and customs clearance coordination.",
  },
  {
    title: "Quality & Compliance",
    description:
      "Full release documentation, test certifications, and chain‑of‑custody records in accordance with IATA and ICAO guidelines.",
  },
]

const coverageRegions = [
  { name: "Middle East", airports: "50+ airports served" },
  { name: "South Asia", airports: "30+ airports served" },
  { name: "Europe & CIS", airports: "Expanding network" },
  { name: "Africa", airports: "Select locations" },
]

export default function JetFuelPage() {
  const scrollToServices = () => {
    document.getElementById("fuel-services")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="relative bg-black text-white overflow-hidden">
      {/* Fuel Services Section */}
      <section id="fuel-services" className="relative z-20 pt-8 pb-24 mt-40">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Intro & Specifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
              Fuel Supply & Logistics
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-zinc-100 mb-4">
              JET A-1. The global standard.
            </h2>
            <p className="text-zinc-400 max-w-2xl text-balance text-lg">
              Manufactured to ASTM D1655 and DEF STAN 91-091 specifications, JET A-1 is the kerosene‑type fuel trusted for all turbine‑powered aircraft — from business jets to long‑haul wide‑bodies.
            </p>
          </motion.div>

          {/* Spec Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
            {specificationHighlights.map((spec, index) => (
              <motion.div
                key={spec.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group h-full overflow-hidden border-zinc-800/50 bg-zinc-900/50 hover:border-sky-800/40 transition-all duration-300 rounded-2xl">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                        <spec.icon className="w-5 h-5 text-sky-400 group-hover:text-sky-300 transition-colors" />
                      </div>
                      <p className="font-light text-zinc-100">{spec.label}</p>
                    </div>
                    <div className="text-3xl font-light text-sky-400 mb-2">{spec.value}</div>
                    <p className="text-zinc-500 text-sm">{spec.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Service Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-16"
          >
            <h3 className="text-2xl md:text-3xl font-light text-zinc-100 mb-6">Fuel Procurement & Coordination</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {serviceFeatures.map((feature, index) => (
                <Card
                  key={feature.title}
                  className="group overflow-hidden border-zinc-800/50 bg-zinc-900/50 hover:border-sky-800/40 transition-all duration-300 rounded-2xl"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Fuel className="w-4 h-4 text-sky-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-zinc-100 mb-2">{feature.title}</h4>
                        <p className="text-zinc-400 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Coverage & Compliance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="h-full border-zinc-800/50 bg-zinc-900/50 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-sky-400" />
                    </div>
                    <p className="font-light text-zinc-100 text-lg">Network Coverage</p>
                  </div>
                  <p className="text-zinc-400 text-sm mb-6">
                    Trusted suppliers and into‑plane partners across key aviation markets.
                  </p>
                  <div className="space-y-3">
                    {coverageRegions.map((region, i) => (
                      <div key={region.name} className="flex items-center justify-between border-b border-zinc-800/60 pb-3 last:border-0">
                        <span className="text-zinc-300">{region.name}</span>
                        <span className="text-zinc-500 text-sm">{region.airports}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="h-full border-zinc-800/50 bg-zinc-900/50 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-sky-400" />
                    </div>
                    <p className="font-light text-zinc-100 text-lg">Safety & Compliance</p>
                  </div>
                  <p className="text-zinc-400 text-sm mb-6">
                    Every fuel arrangement backed by rigorous documentation and quality assurance.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <FileCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <span className="text-zinc-300 text-sm">Quality release documentation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <span className="text-zinc-300 text-sm">Fuel test certifications</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <span className="text-zinc-300 text-sm">Chain‑of‑custody records (IATA/ICAO)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <span className="text-zinc-300 text-sm">Cost transparency & audit trails</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative rounded-2xl border border-zinc-800/50 bg-zinc-900/40 overflow-hidden px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative text-center md:text-left max-w-xl">
              <p className="text-sm font-medium text-sky-400 uppercase tracking-wider mb-3">
                24/7 Fuel Desk
              </p>
              <h3 className="text-3xl md:text-4xl font-light text-zinc-100 mb-3 text-balance">
                Keep your fleet moving.
              </h3>
              <p className="text-zinc-400 text-base text-balance">
                Contact our fuel coordination team at{" "}
                <a href="mailto:info@aeroaviation.me" className="text-sky-400 hover:text-sky-300 underline-offset-4 hover:underline">
                  info@aeroaviation.me
                </a>{" "}
                for spot uplifts, into‑plane agreements, or bonded supply arrangements.
              </p>
            </div>

            <div className="relative flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <a
                href="mailto:info@aeroaviation.me"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-all duration-300 hover:scale-[1.03] shadow-lg shadow-sky-500/20"
              >
                <Mail className="w-4 h-4" />
                Request Quote
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 text-sm font-medium transition-all duration-300"
              >
                Fuel Specifications
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}