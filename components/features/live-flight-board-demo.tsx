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
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 overflow-hidden rounded-xl shadow-xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-700 bg-gradient-to-r from-slate-800 via-slate-800 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <h3 className="font-semibold text-lg text-white">Departures</h3>
            <span className="text-xs text-slate-400 font-medium">495 Flights</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20">
            LIVE
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid md:grid-cols-8 gap-4 px-6 py-3.5 bg-slate-950/50 border-b border-slate-700 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <div>Flight</div>
          <div>Airline</div>
          <div>Destination</div>
          <div>Scheduled</div>
          <div>Updated</div>
          <div>Gate</div>
          <div>Status</div>
        </div>

        {/* Table Rows */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="divide-y divide-slate-700"
        >
          {flights.map((flight, idx) => (
            <motion.div
              key={idx}
              variants={rowVariants}
              className="px-6 py-4 hover:bg-slate-700/50 transition-colors grid grid-cols-2 md:grid-cols-8 gap-4 items-center text-sm bg-slate-800/30"
            >
              {/* Flight Number */}
              <div className="md:col-span-1">
                <div className="font-bold text-white text-lg">{flight.flight}</div>
                <div className="text-xs text-slate-400 mt-1">{flight.code}</div>
              </div>

              {/* Airline - hidden on mobile */}
              <div className="hidden md:block text-white font-medium">{flight.airline}</div>

              {/* Destination */}
              <div className="md:col-span-1">
                <div className="font-semibold text-white">{flight.destination}</div>
                <div className="text-xs text-slate-400 mt-1">{flight.code}</div>
              </div>

              {/* Scheduled - hidden on mobile */}
              <div className="hidden md:block text-slate-300 text-sm">{flight.scheduled}</div>

              {/* Updated - hidden on mobile */}
              <div className="hidden md:block text-slate-300 text-sm">{flight.updated}</div>

              {/* Gate - hidden on mobile */}
              <div className="hidden md:block text-white font-semibold">{flight.gate}</div>

              {/* Status Badge */}
              <div className="md:col-span-2 flex justify-end">
                <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20">
                  {flight.status}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/50 border-t border-slate-700 text-xs text-slate-400 font-medium">
          Last updated: 11 Jul 2026, 17:25 UTC • Real-time updates enabled
        </div>
      </div>
    </motion.div>
  )
}

export default LiveFlightBoardDemo
