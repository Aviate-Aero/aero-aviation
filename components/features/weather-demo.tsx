"use client"

import { motion } from "framer-motion"
import { CheckCircle, Cloud, Copy } from "lucide-react"
import { useState } from "react"

const stations = [
  {
    title: "Departure Weather",
    icao: "OPIS",
    category: "VFR",
    metar: "OPIS 111330Z 09016G24KT 6000 TSRA FEW030CB 32/24 Q1004",
    shade: "bg-sky-500/10",
    icon: "border-sky-500/30 bg-sky-500/20 text-sky-400",
    badge: "border-emerald-500/30 bg-emerald-500/20 text-emerald-400",
    rows: [
      ["Station", "OPIS", "font-mono text-sky-400"],
      ["Report Time", "Day 11 at 13:30Z"],
      ["Wind", "090° / 16 kt (gust 24 kt)", "font-mono"],
      ["Visibility", "6,000 meters"],
      ["Clouds", "Few at 3,000 ft (CB)"],
      ["Temp / Dewpoint", "32°C / 24°C", "font-mono"],
      ["Pressure", "1004 hPa"],
    ],
  },
  {
    title: "Arrival Weather",
    icao: "EGLL",
    category: "VFR",
    metar: "EGLL 111320Z AUTO 08011KT 9999 NCD 29/12 Q1021",
    shade: "bg-emerald-500/[0.08]",
    icon: "border-emerald-500/30 bg-emerald-500/20 text-emerald-400",
    badge: "border-emerald-500/30 bg-emerald-500/20 text-emerald-400",
    rows: [
      ["Station", "EGLL", "font-mono text-sky-400"],
      ["Report Time", "Day 11 at 13:20Z"],
      ["Wind", "080° / 11 kt", "font-mono"],
      ["Visibility", "10 km or more"],
      ["Clouds", "No cloud detected"],
      ["Temp / Dewpoint", "29°C / 12°C", "font-mono"],
      ["Pressure", "1021 hPa"],
    ],
  },
]

export default function WeatherDemo() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyMetar = async (icao: string, metar: string) => {
    await navigator.clipboard.writeText(metar)
    setCopied(icao)
    window.setTimeout(() => setCopied(null), 1600)
  }

  return (
    <div className="space-y-5">
      {stations.map((station, index) => (
        <motion.div
          key={station.icao}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="relative isolate"
        >
          <section className="overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl transition-all duration-300 hover:border-slate-600 hover:shadow-2xl">
            <header className="flex items-center justify-between gap-4 px-6 py-5 sm:px-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
                  <Cloud className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-white sm:text-lg">{station.title}</h3>
                  <p className="mt-0.5 font-mono text-sm text-slate-400">{station.icao}</p>
                </div>
              </div>

              <button onClick={() => copyMetar(station.icao, station.metar)} type="button" aria-label={`Copy ${station.title} METAR`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700/50 transition-colors hover:text-white">
                {copied === station.icao ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
              </button>
            </header>

            <div className="px-6 pb-6 sm:px-6 sm:pb-6 pt-6">
              <div className="rounded-lg border border-slate-700 bg-slate-950 p-4 shadow-inner">
                <code className="block break-words font-mono text-xs leading-6 text-emerald-400 sm:text-sm">{station.metar}</code>
              </div>

              <div className="mb-4 mt-6 flex items-center justify-between">
                <h4 className="text-base font-semibold text-white">Weather Analysis</h4>
                <span className="rounded-lg px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20">{station.category}</span>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-950/60">
                <table className="w-full text-left text-xs sm:text-sm">
                  <tbody>
                    {station.rows.map(([label, value, valueClass]) => (
                      <tr key={label} className="border-b border-slate-700/50 last:border-0 transition-colors hover:bg-slate-700/30">
                        <th scope="row" className="w-[42%] px-4 py-3 font-semibold text-slate-400 sm:w-40">{label}</th>
                        <td className={`px-4 py-3 text-slate-100 sm:px-4 ${valueClass ?? ""}`}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </motion.div>
      ))}
    </div>
  )
}
