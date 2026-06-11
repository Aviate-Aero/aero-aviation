"use client"

import { useState, useEffect } from "react"
import type { ComponentType } from "react"
import { motion } from "framer-motion"
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet"
import {
  Cloud,
  CloudRain,
  Thermometer,
  Wind,
  Gauge,
  SlidersHorizontal,
  Layers,
  X,
  type LucideProps,
} from "lucide-react"
import "leaflet/dist/leaflet.css"

type WeatherLayer = {
  id: string
  label: string
  description: string
  opacity: number
  icon: ComponentType<LucideProps>
}

const weatherLayers: WeatherLayer[] = [
  {
    id: "clouds_new",
    label: "Clouds",
    description: "Live cloud coverage",
    opacity: 0.6,
    icon: Cloud,
  },
  {
    id: "precipitation_new",
    label: "Precipitation",
    description: "Rain and snowfall intensity",
    opacity: 0.65,
    icon: CloudRain,
  },
  {
    id: "temp_new",
    label: "Temperature",
    description: "Surface temperature overlay",
    opacity: 0.55,
    icon: Thermometer,
  },
  {
    id: "wind_new",
    label: "Wind",
    description: "Wind speed overlay",
    opacity: 0.55,
    icon: Wind,
  },
  {
    id: "pressure_new",
    label: "Pressure",
    description: "Sea level pressure",
    opacity: 0.55,
    icon: Gauge,
  },
]

export default function WeatherMap() {
  const position: [number, number] = [33.6844, 73.0479]

  const defaultLayer =
    weatherLayers.find((layer) => layer.id === "wind_new") ?? weatherLayers[0]

  const [activeLayer, setActiveLayer] = useState<WeatherLayer>(defaultLayer)
  const [opacity, setOpacity] = useState<number>(defaultLayer.opacity)
  const [panelOpen, setPanelOpen] = useState<boolean>(true)

  // Collapse the panel by default on small screens so it doesn't cover the map.
  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setPanelOpen(false)
    }
  }, [])

  function handleLayerChange(layer: WeatherLayer) {
    setActiveLayer(layer)
    setOpacity(layer.opacity)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white mt-40">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-sky-400/10 blur-[120px]" />
      </div>

      <section className="relative z-20 mx-auto w-full max-w-[1600px] px-5 py-8 lg:px-6">
        {/* Page Header */}
        <motion.div
          className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div>
            <h1 className="text-5xl font-light leading-none text-white md:text-6xl">
              Weather Map
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-6 text-zinc-300">
              OpenWeather visual overlays for aviation weather awareness, route
              monitoring, and flight planning.
            </p>
          </div>
        </motion.div>

        {/* Map Dashboard Card */}
        <motion.section
          className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-2xl shadow-black/50"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.65,
            delay: 0.1,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
            <div>
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-sky-400">
                Active Layer
              </p>

              <h2 className="text-2xl font-light text-white">
                {activeLayer.label}
              </h2>

              <p className="mt-2 text-xs text-zinc-400">
                {activeLayer.description}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="relative h-[600px] min-h-[600px] w-full overflow-hidden bg-black">
            <MapContainer
              center={position}
              zoom={7}
              scrollWheelZoom={true}
              zoomControl={false}
              style={{
                height: "600px",
                width: "100%",
                zIndex: 1,
              }}
            >
              <ZoomControl position="bottomright" />

              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <TileLayer
                key={activeLayer.id}
                url={`/api/openweather/weather-map/${activeLayer.id}/{z}/{x}/{y}`}
                opacity={opacity}
              />
            </MapContainer>

            {/* Collapsed toggle — keeps the map clear on mobile */}
            {!panelOpen && (
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className="pointer-events-auto absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-xl border border-zinc-800 bg-black/70 px-3 py-2.5 text-sm font-medium text-white shadow-2xl shadow-black/50 backdrop-blur-md"
              >
                <Layers className="h-4 w-4 text-sky-400" />
                <span>{activeLayer.label}</span>
              </button>
            )}

            {/* Floating layer panel on the left edge of the map */}
            {panelOpen && (
            <div className="pointer-events-auto absolute left-4 top-4 z-[1000] flex max-h-[calc(100%-2rem)] w-[200px] flex-col gap-3 overflow-y-auto rounded-2xl border border-zinc-800 bg-black/70 p-4 shadow-2xl shadow-black/50 backdrop-blur-md sm:w-[230px]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Weather Layers
                  </h2>
                  <p className="mt-1 text-[11px] leading-4 text-zinc-400">
                    Select a layer to overlay on the map.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  aria-label="Hide layers panel"
                  className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {weatherLayers.map((layer) => {
                  const Icon = layer.icon
                  const isActive = activeLayer.id === layer.id

                  return (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => handleLayerChange(layer)}
                      className={[
                        "group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-300",
                        isActive
                          ? "border-sky-400/70 bg-sky-400/15 shadow-[0_0_24px_rgba(56,189,248,0.12)]"
                          : "border-zinc-800 bg-zinc-950/70 hover:border-sky-400/40 hover:bg-sky-400/5",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-all duration-300",
                          isActive
                            ? "border-sky-400/60 bg-sky-400/15 text-sky-400"
                            : "border-zinc-800 bg-black text-zinc-500 group-hover:text-sky-400",
                        ].join(" ")}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <span
                        className={[
                          "text-sm font-medium transition-colors duration-300",
                          isActive ? "text-white" : "text-zinc-200",
                        ].join(" ")}
                      >
                        {layer.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Opacity Control */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
                <div className="mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-sky-400" />
                  <h3 className="text-xs font-semibold text-white">
                    Overlay Opacity
                  </h3>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(event) => setOpacity(Number(event.target.value))}
                  className="w-full accent-sky-400"
                />

                <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Min</span>
                  <span className="rounded-full bg-sky-400/20 px-2 py-0.5 text-sky-300">
                    {Math.round(opacity * 100)}%
                  </span>
                  <span>Max</span>
                </div>
              </div>
            </div>
            )}
          </div>
        </motion.section>
      </section>
    </main>
  )
}