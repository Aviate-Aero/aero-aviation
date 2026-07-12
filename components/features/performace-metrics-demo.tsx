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
    { label: 'GROUND SPEED', value: '290 kt', icon: '📊', color: '#1d9eef' },
    { label: 'ALTITUDE', value: '9,950 ft', icon: '🚀', color: '#8b5cf6' },
    { label: 'VERTICAL SPEED', value: '1024 fpm', icon: '⬆️', color: '#f59e0b' },
    { label: 'TRACK DURATION', value: '434.5 min', icon: '⏱️', color: '#1d9eef' },
    { label: 'MAX ALTITUDE', value: '38,000 ft', icon: '📈', color: '#1d9eef' },
    { label: 'AVG SPEED', value: '350 kt', icon: '➡️', color: '#10b981' },
    { label: 'MAX CLIMB', value: '3136 fpm', icon: '📊', color: '#10b981' },
    { label: 'MAX DESCENT', value: '3456 fpm', icon: '📉', color: '#ef4444' },
  ]

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="space-y-6"
    >
      {/* Header with status */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-light text-white">UAL123 Performance</h3>
          <p className="text-sm text-zinc-400">B789 · N22995</p>
        </div>
        <div className="px-4 py-2 rounded-full border border-amber-400/50 bg-amber-400/10 text-amber-400 text-sm font-light">
          Descending
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 gap-3"
      >
        {metrics.map((metric, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <div className="bg-white/5 border border-white/10 p-4 backdrop-blur-sm hover:border-sky-400/30 transition-colors rounded-lg">
              <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wider font-light">{metric.label}</p>
              <p className="text-2xl font-light text-white">{metric.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Altitude Profile */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/5 border border-white/10 p-4 backdrop-blur-sm rounded-lg">
            <h4 className="text-sm font-light mb-4 text-white">Altitude Profile</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={altitudeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis
                  dataKey="time"
                  stroke="#71717a"
                  tick={{ fontSize: 12 }}
                  interval={1}
                />
                <YAxis
                  stroke="#71717a"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Altitude (ft)', angle: -90, position: 'insideLeft' }}
                />
                <Line
                  type="monotone"
                  dataKey="altitude"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Ground Speed */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/5 border border-white/10 p-4 backdrop-blur-sm rounded-lg">
            <h4 className="text-sm font-light mb-4 text-white">Ground Speed</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={speedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis
                  dataKey="time"
                  stroke="#71717a"
                  tick={{ fontSize: 12 }}
                  interval={1}
                />
                <YAxis
                  stroke="#71717a"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Speed (kt)', angle: -90, position: 'insideLeft' }}
                />
                <Line
                  type="monotone"
                  dataKey="speed"
                  stroke="#10b981"
                  strokeWidth={3}
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
