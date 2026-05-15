"use client"

import { motion } from "framer-motion"
import { Plane, HeartPulse, FileText, Users, PlaneLanding, PlaneTakeoff, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/card/Standard"

const charterServices = [
  {
    icon: Plane,
    title: "Charter Aircraft",
    description:
      "On-demand charter solutions for corporate, government, and private clients. Access to a curated global fleet with end-to-end operational management.",
    highlights: ["Global fleet access", "Vetted operators", "Safety & discretion"],
  },
  {
    icon: HeartPulse,
    title: "MediVac Charters",
    description:
      "Rapid-response medical air transport with certified aeromedical teams. Fully equipped aircraft for critical care, repatriation, and inter-facility transfers.",
    highlights: ["ICU-capable aircraft", "Regulatory clearances", "24/7 coordination"],
  },
  {
    icon: FileText,
    title: "Dry Lease",
    description:
      "Flexible, cost-efficient aircraft leasing without crew, maintenance, or insurance. Ideal for operators with their own AOC seeking full operational control.",
    highlights: ["AOC holder ready", "Competitive terms", "Broad type availability"],
  },
  {
    icon: Users,
    title: "Wet Lease (ACMI)",
    description:
      "Turnkey operational solution including Aircraft, Crew, Maintenance, and Insurance. Seamless integration for seasonal demand or fleet transitions.",
    highlights: ["Fully crewed", "Regulatory compliance", "Operational continuity"],
  },
  {
    icon: PlaneLanding,
    title: "Narrow Body Aircraft",
    description:
      "Single-aisle efficiency for short to medium-haul missions. Airbus A320 and Boeing 737 families—ideal for point-to-point charters and group travel.",
    highlights: ["Capacity & efficiency", "Domestic/regional", "Cargo options"],
  },
  {
    icon: PlaneTakeoff,
    title: "Wide Body Aircraft",
    description:
      "Long-haul, high-capacity solutions including A330, A350, B777, and B787. VIP, humanitarian, and heavy cargo deployments managed globally.",
    highlights: ["Transoceanic range", "Large groups/cargo", "Full logistics support"],
  },
]

export default function CharterPage() {
  const scrollToServices = () => {
    document.getElementById("charter-services")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="relative text-white overflow-hidden">

      {/* Services Section */}
      <section id="charter-services" className="relative z-20 pt-8 pb-24 mt-40">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
              Charter & Leasing Solutions
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-zinc-100 mb-4">
              Precision aviation,<br />tailored to your mission.
            </h2>
            <p className="text-zinc-400 max-w-2xl text-balance text-lg">
              From on-demand charters to long-term ACMI leases, Aero Aviation delivers
              operational excellence across every segment of the aviation spectrum.
            </p>
          </motion.div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {charterServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group h-full overflow-hidden border-zinc-800/50 bg-zinc-900/50 hover:border-sky-800/40 transition-all duration-300 rounded-2xl">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                        <service.icon className="w-5 h-5 text-sky-400 group-hover:text-sky-300 transition-colors" />
                      </div>
                      <p className="font-light text-zinc-100 text-lg">{service.title}</p>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4 flex-grow">{service.description}</p>
                    <ul className="space-y-2">
                      {service.highlights.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-zinc-500">
                          <span className="w-1 h-1 rounded-full bg-sky-500/60" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-16 relative rounded-2xl border border-zinc-800/50 bg-zinc-900/40 overflow-hidden px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative text-center md:text-left max-w-xl">
              <p className="text-sm font-medium text-sky-400 uppercase tracking-wider mb-3">
                24/7 Mission Support
              </p>
              <h3 className="text-3xl md:text-4xl font-light text-zinc-100 mb-3 text-balance">
                Ready to discuss your charter or lease requirements?
              </h3>
              <p className="text-zinc-400 text-base text-balance">
                Contact our operations team at{" "}
                <a href="mailto:info@aeroaviation.me" className="text-sky-400 hover:text-sky-300 underline-offset-4 hover:underline">
                  info@aeroaviation.me
                </a>{" "}
                — available across multiple time zones for mission‑critical requests.
              </p>
            </div>

            <div className="relative flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <a
                href="mailto:info@aeroaviation.me"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-all duration-300 hover:scale-[1.03] shadow-lg shadow-sky-500/20"
              >
                <Mail className="w-4 h-4" />
                Contact Operations
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 text-sm font-medium transition-all duration-300"
              >
                More Details
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