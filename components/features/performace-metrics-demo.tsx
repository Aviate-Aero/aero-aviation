'use client'

import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

const PerformanceMetricsDemo = () => {
  // Altitude profile data
  const altitudeData = [
    { time: '11:33 AM', altitude: 100 },
    { time: '11:45 AM', altitude: 3500 },
    { time: '11:58 AM', altitude: 8200 },
    { time: '12:07 PM', altitude: 23000 },
    { time: '12:32 PM', altitude: 38000 },
    { time: '04:30 PM', altitude: 35000 },
    { time: '05:27 PM', altitude: 9500 },
    { time: '06:48 PM', altitude: 2000 },
  ]

  // Ground speed profile data
  const speedData = [
    { time: '11:33 AM', speed: 0 },
    { time: '11:58 AM', speed: 150 },
    { time: '12:07 PM', speed: 280 },
    { time: '12:32 PM', speed: 450 },
    { time: '04:30 PM', speed: 480 },
    { time: '05:27 PM', speed: 420 },
    { time: '06:48 PM', speed: 150 },
  ]

  const metrics = [
    { label: 'GROUND SPEED', value: '290 kt', color: 'from-blue-600 to-cyan-500' },
    { label: 'ALTITUDE', value: '9,950 ft', color: 'from-purple-600 to-pink-500' },
    { label: 'VERTICAL SPEED', value: '1024 fpm', color: 'from-amber-600 to-orange-500' },
    { label: 'TRACK DURATION', value: '434.5 min', color: 'from-blue-600 to-cyan-500' },
    { label: 'MAX ALTITUDE', value: '38,000 ft', color: 'from-emerald-600 to-teal-500' },
    { label: 'AVG SPEED', value: '350 kt', color: 'from-emerald-600 to-teal-500' },
    { label: 'MAX CLIMB', value: '3136 fpm', color: 'from-teal-600 to-cyan-500' },
    { label: 'MAX DESCENT', value: '3456 fpm', color: 'from-red-600 to-pink-500' },
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

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="space-y-8"
    >
      {/* Header with status */}
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-semibold text-white">UAL123 Performance</h3>
          <p className="text-sm text-zinc-400 mt-1">B789 · N22995</p>
        </div>
        <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium shadow-lg shadow-amber-500/20">
          Descending
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {metrics.map((metric, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <div className={`bg-gradient-to-br ${metric.color} p-0.5 rounded-lg`}>
              <div className="bg-slate-950 rounded-lg p-5 h-full">
                <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider font-semibold">{metric.label}</p>
                <p className="text-2xl md:text-3xl font-bold text-white">{metric.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Altitude Profile */}
        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
            <h4 className="text-base font-semibold mb-6 text-white">Altitude Profile</h4>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={altitudeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  interval={1}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Altitude (ft)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
                />
                <Line
                  type="monotone"
                  dataKey="altitude"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Ground Speed */}
        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
            <h4 className="text-base font-semibold mb-6 text-white">Ground Speed</h4>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={speedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  interval={1}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Speed (kt)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
                />
                <Line
                  type="monotone"
                  dataKey="speed"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default PerformanceMetricsDemo
