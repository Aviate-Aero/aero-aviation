"use client";

import { Button } from "@/components/buttons/Standard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card/Standard";
import {
  BadgeCheck,
  Building2,
  ChartNoAxesCombined,
  CircleDot,
  Fuel,
  Globe2,
  Mail,
  MapPin,
  Plane,
  Radar,
  ShieldCheck,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-40">
        <div className="space-y-8">
          {/* Hero */}
          <section className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-zinc-100 mb-4">
                About Us
              </h1>

              <p className="max-w-3xl text-base md:text-lg leading-8 text-zinc-400">
                Aero Aviation brings aviation intelligence, flight support, and
                commercial aviation services into one modern operational
                platform.
              </p>
            </motion.div>

            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6 md:p-10">
                <div className="max-w-4xl">
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-light leading-[1.05] text-zinc-100">
                    An aviation intelligence company, built for the modern
                    operator.
                  </h2>

                  <p className="mt-6 max-w-3xl text-base md:text-lg leading-8 text-zinc-400">
                    Aero Aviation is the operational and commercial brand
                    through which Aviate Pro ME LLC Group delivers aviation
                    intelligence, flight support, and aviation services to
                    operators, dispatchers, charter clients, and analytical
                    subscribers worldwide.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Intro Statement */}
          <section>
            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <Radar className="h-6 w-6 text-sky-400" />
                      <h2 className="text-2xl font-light text-zinc-100">
                        Why We Exist
                      </h2>
                    </div>

                    <p className="mt-3 text-sm leading-7 text-zinc-500">
                      Built to close the gap between fragmented aviation data
                      and real operational decision-making.
                    </p>
                  </div>

                  <p className="text-base leading-8 text-zinc-400">
                    The company was founded on a simple conviction: that the
                    modern operator deserves better than fragmented data feeds,
                    slow advisories, and brochureware dashboards that promise
                    insight but deliver checklists. Aero Aviation exists to
                    close that gap.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Quick Pillars */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatsCard
              icon={<Radar className="h-5 w-5 text-sky-400" />}
              label="Platform"
              value="Aviation Intelligence"
            />

            <StatsCard
              icon={<Fuel className="h-5 w-5 text-sky-400" />}
              label="Operations"
              value="Jet Fuel Desk"
            />

            <StatsCard
              icon={<Plane className="h-5 w-5 text-sky-400" />}
              label="Services"
              value="Charter Support"
            />

            <StatsCard
              icon={<Globe2 className="h-5 w-5 text-sky-400" />}
              label="Presence"
              value="3 Continents"
            />
          </section>

          {/* What We Do */}
          <section id="what-we-do">
            <SectionCard
              icon={<Plane className="h-7 w-7 text-sky-400" />}
              title="What We Do"
              description="A single operational picture for flight intelligence, support, and coordination."
            >
              <div className="space-y-5 text-zinc-400 leading-8">
                <p>
                  The platform unifies live flight tracking, weather decoding,
                  airspace status, fuel availability, and charter coordination
                  into a single operational picture, refreshed in near real time
                  and grounded in verified open and commercial data sources.
                </p>

                <p>
                  Whether the user is a pilot reviewing METAR conditions before
                  departure, a dispatcher routing around a closed airspace
                  corridor, or a corporate client requesting a charter quote,
                  the same underlying intelligence layer supports the decision.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <FeatureTile
                  icon={<Radar className="h-5 w-5 text-sky-400" />}
                  title="Live Operational Picture"
                  description="Flight tracking, weather, airspace, NOTAMs, and operational context in one view."
                />

                <FeatureTile
                  icon={<Fuel className="h-5 w-5 text-sky-400" />}
                  title="Jet Fuel Desk"
                  description="Jet A-1 supply, into-plane coordination, and bonded fuel uplift support."
                />

                <FeatureTile
                  icon={<Plane className="h-5 w-5 text-sky-400" />}
                  title="Charter Services"
                  description="Executive, MEDEVAC, and ad hoc cargo charters through the Group operator network."
                />
              </div>
            </SectionCard>
          </section>

          {/* Jet Fuel and Charter */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 border-b border-zinc-800/50">
                <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
                  <Fuel className="h-6 w-6 text-sky-400" />
                  Jet Fuel Desk
                </CardTitle>

                <CardDescription className="text-zinc-400">
                  Fuel coordination across regional and onward stations.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <p className="text-sm leading-7 text-zinc-400">
                  Through its Jet Fuel desk, the company arranges Jet A-1
                  supply, into-plane coordination, and bonded fuel uplift across
                  Pakistan, the Gulf, and onward stations, drawing on the
                  Group&apos;s established relationships with regional refiners
                  and fuel agents.
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 border-b border-zinc-800/50">
                <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
                  <Plane className="h-6 w-6 text-sky-400" />
                  Charter Services Desk
                </CardTitle>

                <CardDescription className="text-zinc-400">
                  Aircraft sourcing and coordination through the Group network.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <p className="text-sm leading-7 text-zinc-400">
                  Through its Charter Services desk, Aero Aviation arranges
                  executive, MEDEVAC, and ad hoc cargo charters on aircraft
                  sourced through the Group&apos;s operator network.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Flight Core Intelligence */}
          <section>
            <SectionCard
              icon={<ShieldCheck className="h-7 w-7 text-sky-400" />}
              title="Flight Core Intelligence"
              description="The analytical engine behind Aero Aviation’s intelligence products."
            >
              <div className="space-y-5 text-zinc-400 leading-8">
                <p>
                  Flight Core Intelligence is the analytical engine that sits
                  behind the platform. Operating under the Group&apos;s
                  intelligence and risk advisory function, FCI publishes
                  structured aviation intelligence bulletins on airspace
                  closures, conflict zone advisories, fuel disruptions, NOTAM
                  developments, and the wider geopolitical events that shape
                  commercial and operational flight planning.
                </p>

                <p>
                  Every FCI product is built to a disciplined house standard:
                  named open sources, dual verification of every claim, and a
                  confidence framework that distinguishes confirmed fact from
                  assessed judgement and from projected outcome.
                </p>

                <p>
                  Subscribers receive these bulletins as part of the platform
                  offering, and bespoke analytical work is delivered to
                  enterprise clients on retainer.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <FeatureTile
                  icon={<BadgeCheck className="h-5 w-5 text-emerald-400" />}
                  title="Named Open Sources"
                  description="Structured intelligence grounded in traceable source material."
                />

                <FeatureTile
                  icon={<ShieldCheck className="h-5 w-5 text-sky-400" />}
                  title="Dual Verification"
                  description="Every claim is checked before it enters a published product."
                />

                <FeatureTile
                  icon={
                    <ChartNoAxesCombined className="h-5 w-5 text-sky-400" />
                  }
                  title="Confidence Framework"
                  description="Clear separation between confirmed fact, assessment, and projection."
                />
              </div>
            </SectionCard>
          </section>

          {/* Group */}
          <section>
            <SectionCard
              icon={<Building2 className="h-7 w-7 text-sky-400" />}
              title="The Aviate Pro ME LLC Group"
              description="Aero Aviation operates within a wider global aviation services enterprise."
            >
              <p className="text-zinc-400 leading-8">
                Aero Aviation operates within the wider Aviate Pro ME LLC Group,
                a global aviation services enterprise active across fleet
                management, aircraft acquisitions and sales, MEDEVAC
                coordination, and aviation intelligence. The relationship
                between the Group&apos;s entities allows Aero Aviation to draw
                on real operational depth across aircraft, regulatory
                experience, and field intelligence, none of which can be
                replicated by a purely software-led competitor.
              </p>
            </SectionCard>
          </section>

          {/* Global Presence */}
          <section>
            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 border-b border-zinc-800/50">
                <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
                  <Globe2 className="h-7 w-7 text-sky-400" />
                  Global Presence
                </CardTitle>

                <CardDescription className="text-zinc-400">
                  Four offices across three continents.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <p className="mb-6 text-zinc-400 leading-8">
                  The Group operates from four offices across three continents:
                  Islamabad, Doha, Sherman Oaks in California, and Glasgow. This
                  footprint mirrors the geography of the markets the Group
                  serves, and it allows Aero Aviation to deliver timely
                  operational support across South Asia, the Gulf, North
                  America, and Europe without relying on a single time zone or a
                  single jurisdiction.
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <LocationCard city="Islamabad" region="South Asia" />
                  <LocationCard city="Doha" region="Gulf Region" />
                  <LocationCard city="Sherman Oaks" region="California" />
                  <LocationCard city="Glasgow" region="Europe" />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Leadership */}
          <section>
            <SectionCard
              icon={<Users className="h-7 w-7 text-sky-400" />}
              title="Leadership"
              description="A senior structure built around operations, intelligence, strategy, and engineering."
            >
              <p className="text-zinc-400 leading-8">
                Aero Aviation is led by Saad Masood, Founder of Aviate Pro ME
                LLC Group. The Group&apos;s senior structure brings together
                aviation operations, intelligence and geopolitical risk,
                commercial strategy, and engineering, supported by subject
                matter consultants drawn from civil aviation, defence aviation,
                and international flight operations.
              </p>
            </SectionCard>
          </section>

          {/* Future */}
          <section>
            <Card className="border-sky-500/20 bg-sky-500/5 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6 md:p-10">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-black/30 px-4 py-2 text-sm text-sky-400">
                      <CircleDot className="h-4 w-4" />
                      Where We Are Going
                    </div>

                    <h2 className="text-3xl md:text-4xl font-light text-zinc-100">
                      Building the operational picture aviation will need next.
                    </h2>
                  </div>

                  <div className="space-y-5 text-zinc-300 leading-8">
                    <p>
                      Aero Aviation is building the operational picture that the
                      next decade of aviation will require: faster, more
                      verified, more global, and more honest about uncertainty
                      than the legacy tools the industry has grown accustomed
                      to.
                    </p>

                    <p>
                      The platform will continue to expand its data coverage,
                      its intelligence cadence, and its commercial product
                      range, with mobile applications for iOS and Android
                      scheduled for release in due course.
                    </p>

                    <div className="pt-2">
                      <Button
                        asChild
                        className="h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300"
                      >
                        <a href="mailto:info@aeroaviation.me">
                          info@aeroaviation.me
                          <Mail className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-zinc-800/50">
        <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
          {icon}
          {title}
        </CardTitle>

        <CardDescription className="text-zinc-400">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}

function FeatureTile({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-black/20 p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10">
        {icon}
      </div>

      <h3 className="text-base font-medium text-zinc-100">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
    </div>
  );
}

function LocationCard({ city, region }: { city: string; region: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-black/20 p-5">
      <div className="mb-3 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-sky-400" />
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {region}
        </span>
      </div>

      <p className="text-xl font-light text-zinc-100">{city}</p>
    </div>
  );
}

function StatsCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          {icon}
          <p className="text-xs font-medium text-zinc-500">{label}</p>
        </div>

        <p className="text-xl font-light text-zinc-100 break-words">{value}</p>
      </CardContent>
    </Card>
  );
}