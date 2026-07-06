"use client";

import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import AirportInformation from "@/components/flight-intel/flight-tracker/airportInfo/Standard";

export default function AirportInfoPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white mt-40 mb-10">
      <section className="relative z-20 mx-auto w-full max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-8"
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10">
              <Building2 className="h-6 w-6 text-sky-400" />
            </div>
            <h1 className="text-3xl font-light text-zinc-100 md:text-4xl">
              Airport Information
            </h1>
          </div>
          <p className="max-w-2xl text-lg text-zinc-400">
            Search FlightRadar24 airport full profiles, including location,
            timezone, elevation, and runway details.
          </p>
        </motion.div>

        <AirportInformation />
      </section>
    </main>
  );
}
