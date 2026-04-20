"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    description: "For independent pilots and small operators getting started with aviation intelligence.",
    price: "$0",
    period: "forever",
    features: [
      "Up to 3 users",
      "Basic flight data access",
      "Standard route analytics",
      "Community support",
      "7-day data history",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For growing aviation teams that need deeper insight and real-time intelligence.",
    price: "$49",
    period: "/month",
    features: [
      "Unlimited users",
      "Real-time flight tracking",
      "Advanced fleet analytics",
      "Priority support",
      "90-day data history",
      "API access",
      "Custom alerts & reports",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For airlines and large operators requiring bespoke solutions at scale.",
    price: "Custom",
    period: "",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom SLA",
      "On-premise deployment",
      "Unlimited data history",
      "Advanced security & compliance",
      "Onboarding & training",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <main className="relative bg-black text-white min-h-screen">

      <section className="pt-40 pb-24">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Pricing</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-zinc-100 mb-6 leading-[1]">
              Simple, transparent pricing
            </h1>
            <p className="text-zinc-400 max-w-xl text-lg">
              No hidden fees. No surprises. Choose the plan that fits your operation.
            </p>
          </motion.div>

          {/* Pricing Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                className={`relative p-8 rounded-2xl border flex flex-col h-full transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-sky-500/5 border-sky-500/40 hover:border-sky-500/70"
                    : "bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700/50"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-medium">
                    Most Popular
                  </span>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-light text-zinc-100 mb-2">{plan.name}</h3>
                  <p className="text-sm text-zinc-500">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <span className="text-4xl font-light text-zinc-100">{plan.price}</span>
                  {plan.period && <span className="text-sm text-zinc-500 ml-1">{plan.period}</span>}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlighted ? "text-sky-400" : "text-zinc-500"}`}
                      />
                      <span className="text-sm text-zinc-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.name === "Enterprise" ? "/contact" : "#"}
                  className={`block w-full py-3 px-6 text-center rounded-full text-sm font-medium transition-all duration-300 mt-auto ${
                    plan.highlighted
                      ? "bg-sky-500 text-white hover:bg-sky-600"
                      : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
