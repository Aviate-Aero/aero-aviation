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
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm overflow-hidden h-full min-h-96 hover:border-white/20 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-light text-white">Flight Map - UAL123</h3>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors text-zinc-400 hover:text-white font-light">
              Manual refresh
            </button>
            <button className="text-xs px-3 py-1 rounded border border-sky-400/50 bg-sky-400/10 text-sky-400 hover:bg-sky-400/20 transition-colors font-light">
              Show Performance
            </button>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-sky-400/10 via-sky-300/5 to-sky-200/5 rounded-lg h-80 border border-white/10 overflow-hidden">
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
          <div className="absolute bottom-3 right-4 bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/10 text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-white font-light">Departure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-400"></div>
              <span className="text-white font-light">Aircraft</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <span className="text-white font-light">Destination</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default FlightMapDemo
