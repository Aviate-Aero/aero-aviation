'use client'

import { motion } from 'framer-motion'

const WeatherDemo = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  }

  const departureMetar = 'METAR OPIS 111330Z 0901GKT 6000 FEW040 03/5KT TSRA FEW030CB'
  const arrivalMetar = 'METAR EGLL 111320Z AUTO 0801IKT 0501IIo 9999 NCD 29/12°C Q1021'

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="space-y-4"
    >
      {/* Departure Weather */}
      <motion.div variants={itemVariants}>
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm hover:border-sky-400/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-light text-sky-400">Departure Weather</h3>
              <p className="text-sm text-zinc-400">OPIS</p>
            </div>
            <div className="px-3 py-1 rounded-full border border-sky-400/50 bg-sky-400/10 text-sky-400 text-sm font-light">
              VFR
            </div>
          </div>

          <div className="bg-black/40 rounded-lg p-4 mb-4 border border-white/5 font-mono text-sm">
            <p className="text-emerald-400 truncate">{departureMetar}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xs text-zinc-400 mb-1">Wind</p>
              <p className="text-lg font-light text-white">090° / 16 kt</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xs text-zinc-400 mb-1">Visibility</p>
              <p className="text-lg font-light text-white">6000 m</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xs text-zinc-400 mb-1">Ceiling</p>
              <p className="text-lg font-light text-white">10,000 ft</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xs text-zinc-400 mb-1">Temp</p>
              <p className="text-lg font-light text-white">32°C / 24°C</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Arrival Weather */}
      <motion.div variants={itemVariants}>
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm hover:border-sky-400/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-light text-sky-400">Arrival Weather</h3>
              <p className="text-sm text-zinc-400">EGLL</p>
            </div>
            <div className="px-3 py-1 rounded-full border border-sky-400/50 bg-sky-400/10 text-sky-400 text-sm font-light">
              VFR
            </div>
          </div>

          <div className="bg-black/40 rounded-lg p-4 mb-4 border border-white/5 font-mono text-sm">
            <p className="text-emerald-400 truncate">{arrivalMetar}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xs text-zinc-400 mb-1">Wind</p>
              <p className="text-lg font-light text-white">080° / 11 kt</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xs text-zinc-400 mb-1">Visibility</p>
              <p className="text-lg font-light text-white">10 km+</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xs text-zinc-400 mb-1">Clouds</p>
              <p className="text-lg font-light text-white">Clear</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xs text-zinc-400 mb-1">Temp</p>
              <p className="text-lg font-light text-white">29°C / 12°C</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default WeatherDemo
