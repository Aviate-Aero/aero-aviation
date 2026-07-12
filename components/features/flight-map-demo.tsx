'use client'

import { motion } from 'framer-motion'

const FlightMapDemo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 overflow-hidden h-full min-h-96 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-semibold text-white">Flight Map - UAL123</h3>
          <div className="flex gap-2">
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 rounded-lg h-80 border border-slate-700 overflow-hidden shadow-inner">
          {/* Map background */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1000 600"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Simplified world map shapes */}
            <defs>
              <pattern id="gridPattern" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.1" />
              </pattern>
            </defs>

            <rect width="1000" height="600" fill="url(#gridPattern)" />

            {/* Continents simplified shapes */}
            {/* North America */}
            <path
              d="M 100 150 L 180 120 L 200 180 L 150 220 Z"
              fill="#1e293b"
              opacity="0.4"
              stroke="#334155"
              strokeWidth="1"
            />

            {/* Europe */}
            <path
              d="M 450 120 L 550 100 L 580 180 L 480 200 Z"
              fill="#1e293b"
              opacity="0.4"
              stroke="#334155"
              strokeWidth="1"
            />

            {/* Africa */}
            <path
              d="M 500 220 L 600 200 L 620 380 L 520 400 Z"
              fill="#1e293b"
              opacity="0.4"
              stroke="#334155"
              strokeWidth="1"
            />

            {/* Flight path with animation */}
            <motion.g
              initial={{ opacity: 0, pathLength: 0 }}
              whileInView={{ opacity: 1, pathLength: 1 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              viewport={{ once: true }}
            >
              <path
                d="M 120 160 Q 300 80 500 150"
                stroke="#f59e0b"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </motion.g>

            {/* Departure marker */}
            <motion.g
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <circle cx="120" cy="160" r="8" fill="#10b981" opacity="0.8" />
              <circle cx="120" cy="160" r="15" fill="#10b981" opacity="0.3" />
            </motion.g>

            {/* Aircraft marker with animation */}
            <motion.g
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              viewport={{ once: true }}
              animate={{ y: [0, -5, 0] }}
            >
              <circle cx="300" cy="140" r="10" fill="#0ea5e9" opacity="0.9" />
              <path
                d="M 300 130 L 295 145 L 305 145 Z"
                fill="#0ea5e9"
                opacity="0.6"
              />
            </motion.g>

            {/* Destination marker */}
            <motion.g
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 1.8, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <circle cx="500" cy="150" r="8" fill="#ef4444" opacity="0.8" />
              <circle cx="500" cy="150" r="15" fill="#ef4444" opacity="0.3" />
            </motion.g>
          </svg>

          {/* Bottom legend */}
          <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-lg p-4 border border-slate-600 text-xs space-y-2 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-slate-200 font-medium">Departure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              <span className="text-slate-200 font-medium">Aircraft</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <span className="text-slate-200 font-medium">Destination</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default FlightMapDemo
