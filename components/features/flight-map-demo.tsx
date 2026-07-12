"use client"

import { motion } from "framer-motion"
import Image from "next/image"

const FlightMapDemo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      viewport={{ once: true }}
    >
      <div className="h-full min-h-96 overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">
            Flight Map - UAL123
          </h3>
        </div>

        <div className="relative h-80 overflow-hidden rounded-lg border border-slate-700 bg-slate-950 shadow-inner">
          <Image
            src="/misc/flightmap.webp"
            alt="Live aircraft flight tracking map"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
          />

          {/* Optional dark overlay for better contrast */}
          <div className="pointer-events-none absolute inset-0 bg-black/10" />

          {/* Bottom legend */}
          <div className="absolute bottom-4 right-4 space-y-2 rounded-lg border border-slate-600 bg-slate-900/90 p-4 text-xs shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-medium text-slate-200">Departure</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="font-medium text-slate-200">Aircraft</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <span className="font-medium text-slate-200">Destination</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default FlightMapDemo