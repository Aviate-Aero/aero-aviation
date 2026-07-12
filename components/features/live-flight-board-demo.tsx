'use client'

import { motion } from 'framer-motion'

const LiveFlightBoardDemo = () => {
  const flights = [
    {
      flight: 'BR 619',
      airline: 'EVA Air',
      destination: 'Taipei',
      code: 'TPE',
      scheduled: '11 Jul, 16:15',
      updated: '11 Jul, 16:50',
      status: 'DEPARTED',
      gate: '--',
    },
    {
      flight: '5X 5901',
      airline: 'UPS',
      destination: 'Louisville',
      code: 'SDF',
      scheduled: '11 Jul, 16:45',
      updated: '11 Jul, 16:58',
      status: 'DEPARTED',
      gate: '--',
    },
    {
      flight: 'UA 1010',
      airline: 'United',
      destination: 'Denver',
      code: 'DEN',
      scheduled: '11 Jul, 17:00',
      updated: '11 Jul, 17:12',
      status: 'DEPARTED',
      gate: '7',
    },
    {
      flight: 'WN 899',
      airline: 'Southwest',
      destination: 'Baltimore',
      code: 'BWI',
      scheduled: '11 Jul, 17:00',
      updated: '11 Jul, 17:20',
      status: 'DEPARTED',
      gate: '1',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <h3 className="font-light text-lg text-white">Departures</h3>
            <span className="text-xs text-zinc-400">495 Flights</span>
          </div>
          <div className="px-3 py-1 rounded border border-green-500/50 bg-green-500/10 text-green-400 text-xs font-light">
            LIVE BOARD
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid md:grid-cols-8 gap-4 px-6 py-3 bg-white/5 border-b border-white/10 text-xs font-light text-zinc-400 uppercase tracking-wider">
          <div>Flight</div>
          <div>Airline</div>
          <div>Destination</div>
          <div>Scheduled</div>
          <div>Updated</div>
          <div>Gate</div>
          <div> Status</div>
        </div>

        {/* Table Rows */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="divide-y divide-white/10"
        >
          {flights.map((flight, idx) => (
            <motion.div
              key={idx}
              variants={rowVariants}
              className="px-6 py-4 hover:bg-white/5 transition-colors grid grid-cols-2 md:grid-cols-8 gap-4 items-center text-sm"
            >
              {/* Flight Number */}
              <div className="md:col-span-1">
                <div className="font-light text-white">{flight.flight}</div>
                <div className="text-xs text-zinc-400">{flight.code}</div>
              </div>

              {/* Airline - hidden on mobile */}
              <div className="hidden md:block text-white font-light">{flight.airline}</div>

              {/* Destination */}
              <div className="md:col-span-1">
                <div className="font-light text-white">{flight.destination}</div>
                <div className="text-xs text-zinc-400">{flight.code}</div>
              </div>

              {/* Scheduled - hidden on mobile */}
              <div className="hidden md:block text-zinc-400 font-light">{flight.scheduled}</div>

              {/* Updated - hidden on mobile */}
              <div className="hidden md:block text-zinc-400 font-light">{flight.updated}</div>

              {/* Gate - hidden on mobile */}
              <div className="hidden md:block text-white font-light">{flight.gate}</div>

              {/* Status Badge */}
              <div className="md:col-span-2 flex justify-end">
                <span className="px-3 py-1 rounded-full border border-green-500/50 bg-green-500/10 text-green-400 text-xs font-light">
                  {flight.status}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white/5 border-t border-white/10 text-xs text-zinc-400 font-light">
          Last updated: 11 Jul 2026, 17:25 UTC • Real-time updates enabled
        </div>
      </div>
    </motion.div>
  )
}

export default LiveFlightBoardDemo
