"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/ui/sidebar/Standard"
import { PerformanceSummary } from "@/components/flight-intel/flightData/performance/performance-summary"
import { RunwayVisualization } from "@/components/flight-intel/flightData/performance/runway-visualization"
import { PerformanceFactors } from "@/components/flight-intel/flightData/performance/performance-factors"
import { PilotOperations } from "@/components/flight-intel/flightData/pilot/pilot-operations"
import { PerformanceChart } from "@/components/flight-intel/flightData/charts/performance-chart"
import { ComparisonChart } from "@/components/flight-intel/flightData/charts/comparison-chart"
import { MetricsDashboard } from "@/components/flight-intel/flightData/charts/metrics-dashboard"
import { RunwayConditionIndicator } from "@/components/flight-intel/flightData/charts/runway-condition-indicator"
import { ExportControls } from "@/components/flight-intel/flightData/export/export-controls"
import { VSpeedsTable } from "@/components/flight-intel/flightData/performance/vspeed-table"
import { computeVspeeds } from "@/components/lib/flightData/vspeed-calculations"
import { getAircraftDataset } from "@/components/lib/constants"
import { aircraftService } from "@/components/lib/flightData/aircraftService"
import {
  calculateToraToda,
  calculateDensityAltitude,
  calculateWindComponents,
  validateToraTodaParams,
} from "@/components/lib/flightData/performance-models"
import type { AircraftData, CalculationParams } from "@/components/types/flightData/aircraft"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet/Standard"
import { Button } from "@/components/buttons/Standard"
import { Menu, Loader2 } from "lucide-react"

export default function FlightDataPage() {
  // Aircraft and configuration state
  const [aircraftData, setAircraftData] = useState<AircraftData[]>([])
  const [selectedAircraft, setSelectedAircraft] = useState("A320-CEO")
  const [flaps, setFlaps] = useState("1+F")
  const [thrust, setThrust] = useState("full")
  const [tow, setTow] = useState(70000)
  const [pax, setPax] = useState(0)
  const [pAlt, setPAlt] = useState(0)
  const [wind, setWind] = useState(0)
  const [windDir, setWindDir] = useState(180)
  const [slope, setSlope] = useState(0)
  const [isa, setIsa] = useState(15)
  const [condition, setCondition] = useState("dry")
  const [runwayLength, setRunwayLength] = useState(3000)
  const [clearway, setClearway] = useState(0)
  const [runwayHeading, setRunwayHeading] = useState(180)
  const [qnh, setQnh] = useState(1013)
  const [antiice, setAntiice] = useState(false)
  const [packs, setPacks] = useState(true)
  const [reverser, setReverser] = useState(false)
  const [seat, setSeat] = useState(180)
  const [cargo, setCargo] = useState(19000)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Pilot modules state
  const [rwHeading, setRwHeading] = useState(180)
  const [pilotWindDir, setPilotWindDir] = useState(180)
  const [windSpd, setWindSpd] = useState(10)
  const [pilotXwMin, setPilotXwMin] = useState(25)
  const [pilotTwMin, setPilotTwMin] = useState(10)
  const [reportTime, setReportTime] = useState("07:00")
  const [priorRest, setPriorRest] = useState(12)
  const [sectors, setSectors] = useState(2)
  const [plannedBlock, setPlannedBlock] = useState("06:30")

  // Load aircraft data
  useEffect(() => {
    const loadAircraftData = async () => {
      try {
        setLoading(true)
        const data = await getAircraftDataset()
        setAircraftData(data)

        if (data.length > 0 && !data.find((x) => x.key === selectedAircraft)) {
          setSelectedAircraft(data[0].key)
        }
      } catch (error) {
        console.error("Failed to load aircraft data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAircraftData()
  }, [selectedAircraft])

  const currentAircraft = aircraftData.find((x) => x.key === selectedAircraft) || aircraftData[0]
  const brand = selectedAircraft.startsWith("A3") ? "airbus" : "boeing"

  const params: CalculationParams = {
    isa,
    pAlt,
    condition,
    contaminated: ["wet", "snow", "slush", "ice"].includes(condition),
    wind,
    slope,
    antiice,
    packs,
    reverser,
    brand,
    flaps,
    thrust,
    tow,
    refTow: currentAircraft?.refTow || 70000,
    windDir,
    runwayHeading,
    runwayLength,
    clearway,
    qnh,
  }

  const toraTodaParams = {
    tow,
    refTow: currentAircraft?.refTow || 70000,
    brand,
    flaps,
    thrust,
    pAlt,
    isa,
    qnh,
    wind,
    windDir,
    runwayHeading,
    slope,
    condition,
    antiice,
    packs,
    runwayLength,
    clearway,
    baseTora: currentAircraft?.tora || 2300,
    baseToda: currentAircraft?.toda || 2600,
  }

  const validationErrors = validateToraTodaParams(toraTodaParams)

  const toraTodaResults = calculateToraToda(toraTodaParams)
  const densityAltitude = calculateDensityAltitude(pAlt, isa, qnh)
  const windComponents = calculateWindComponents(windDir, Math.abs(wind), runwayHeading)

  if (validationErrors.length > 0) {
    toraTodaResults.warnings = [...toraTodaResults.warnings, ...validationErrors]
    toraTodaResults.isSafe = false
  }

  const handleDataImport = async (newData: AircraftData[]) => {
    try {
      for (const aircraft of newData) {
        const result = await aircraftService.addAircraft(aircraft)
        if (!result.success) {
          console.error(`Failed to import aircraft ${aircraft.name}:`, result.error)
        }
      }
      const updatedData = await getAircraftDataset()
      setAircraftData(updatedData)
    } catch (error) {
      console.error("Error importing aircraft data:", error)
    }
  }

  const aircraftMetrics = [
    { label: "Aircraft", value: currentAircraft?.name || "Loading...", status: "normal" as const },
    { label: "TOW", value: tow.toLocaleString(), unit: "kg", status: "normal" as const },
    { label: "Config", value: `${flaps} / ${thrust}`, status: "normal" as const },
    {
      label: "Weight Ratio",
      value: currentAircraft ? `${((tow / currentAircraft.refTow) * 100).toFixed(0)}%` : "N/A",
      status: currentAircraft && tow > currentAircraft.refTow ? "warning" as const : "normal" as const,
    },
  ]

  const environmentalMetrics = [
    { label: "Pressure Alt", value: pAlt.toLocaleString(), unit: "ft", status: "normal" as const },
    {
      label: "Density Alt",
      value: densityAltitude.toLocaleString(),
      unit: "ft",
      status: densityAltitude > 8000 ? "warning" as const : "normal" as const,
    },
    { label: "Temperature", value: isa, unit: "°C", status: isa > 30 ? "warning" as const : "normal" as const },
    { label: "Wind", value: `${Math.abs(wind)} kt ${wind >= 0 ? "HW" : "TW"}`, status: "normal" as const },
    {
      label: "Wind Direction",
      value: windDir,
      unit: "°",
      status: "normal" as const,
      description: `Magnetic: ${windDir}°`,
    },
    {
      label: "Headwind",
      value: `${windComponents.headwind.toFixed(1)} kt`,
      status: windComponents.headwind < 0 ? "warning" as const : "normal" as const,
    },
    {
      label: "Crosswind",
      value: `${windComponents.crosswind.toFixed(1)} kt`,
      status: windComponents.crosswind > 20 ? "warning" as const : "normal" as const,
    },
    {
      label: "Runway Heading",
      value: runwayHeading,
      unit: "°",
      status: "normal" as const,
      description: `Magnetic: ${runwayHeading}°`,
    },
    { label: "Runway", value: condition, status: params.contaminated ? "warning" as const : "normal" as const },
  ]

  const runwayInfrastructureMetrics = [
    {
      label: "Runway Length (TORA)",
      value: runwayLength.toLocaleString(),
      unit: "m",
      status: toraTodaResults.toraMargin >= 0 ? "normal" as const : "warning" as const,
      description: `Available TORA`,
    },
    {
      label: "Clearway (CWAY)",
      value: clearway,
      unit: "m",
      status: clearway > 0 ? "normal" as const : "info" as const,
      description: clearway > 0 ? "Clearway available" : "No clearway",
    },
    {
      label: "QNH Pressure",
      value: qnh,
      unit: "hPa",
      status: qnh < 980 || qnh > 1030 ? "warning" as const : "normal" as const,
      description: `Standard: 1013 hPa`,
    },
    {
      label: "TORA Utilization",
      value: `${((toraTodaResults.requiredTakeoffRun / runwayLength) * 100).toFixed(1)}%`,
      status: toraTodaResults.requiredTakeoffRun / runwayLength > 0.8 ? "warning" as const : "normal" as const,
      description: "Used vs Available",
    },
  ]

  const performanceMetrics = [
    {
      label: "Required TORA",
      value: toraTodaResults.requiredTakeoffRun.toLocaleString(),
      unit: "m",
      status: toraTodaResults.toraMargin >= 0 ? "normal" as const : "warning" as const,
    },
    {
      label: "Required TODA",
      value: toraTodaResults.requiredTakeoffDistance.toLocaleString(),
      unit: "m",
      status: toraTodaResults.todaMargin >= 0 ? "normal" as const : "warning" as const,
    },
    {
      label: "Available TORA",
      value: toraTodaResults.availableTora.toLocaleString(),
      unit: "m",
      status: "normal" as const,
    },
    {
      label: "Available TODA",
      value: toraTodaResults.availableToda.toLocaleString(),
      unit: "m",
      status: "normal" as const,
    },
    {
      label: "TORA Margin",
      value: `${toraTodaResults.toraMargin.toLocaleString()} m`,
      status: toraTodaResults.toraMargin >= 0 ? "normal" as const : "warning" as const,
    },
    {
      label: "TODA Margin",
      value: `${toraTodaResults.todaMargin.toLocaleString()} m`,
      status: toraTodaResults.todaMargin >= 0 ? "normal" as const : "warning" as const,
    },
  ]

  const operationalMetrics = [
    {
      label: "Takeoff Safety",
      value: toraTodaResults.isSafe ? "SAFE" : "UNSAFE",
      status: toraTodaResults.isSafe ? "normal" as const : "warning" as const,
    },
    {
      label: "Anti-ice",
      value: antiice ? "Required" : "Off",
      status: antiice ? "warning" as const : "normal" as const,
    },
    { label: "Packs", value: packs ? "ON" : "OFF", status: "normal" as const },
    {
      label: "Contaminated",
      value: params.contaminated ? "Yes" : "No",
      status: params.contaminated ? "warning" as const : "normal" as const,
    },
    {
      label: "Warnings",
      value: toraTodaResults.warnings.length.toString(),
      status: toraTodaResults.warnings.length > 0 ? "warning" as const : "normal" as const,
    },
  ]

  const comparisonData = [
    {
      label: "Required TORA",
      current: toraTodaResults.requiredTakeoffRun,
      baseline: toraTodaResults.availableTora,
      unit: "m",
    },
    {
      label: "Required TODA",
      current: toraTodaResults.requiredTakeoffDistance,
      baseline: toraTodaResults.availableToda,
      unit: "m",
    },
  ]

  const vspeeds = computeVspeeds({
    brand,
    flaps,
    thrust,
    tow,
    refTow: currentAircraft?.refTow || 70000,
    condition,
    toraAdj: toraTodaResults.requiredTakeoffRun,
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-sky-400 mx-auto" />
          <p className="text-zinc-400">Loading aircraft data...</p>
        </div>
      </div>
    )
  }

  if (!aircraftData.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-medium text-white">No Aircraft Data Available</h2>
          <p className="text-zinc-400">Unable to load aircraft data. Please check your connection.</p>
          <Button onClick={() => window.location.reload()} className="bg-sky-500 hover:bg-sky-600">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-20">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 bg-zinc-900 border-zinc-700 text-white shadow-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-md p-0 overflow-y-auto bg-zinc-900 border-zinc-800">
            <Sidebar
              aircraftData={aircraftData}
              selectedAircraft={selectedAircraft}
              onAircraftChange={setSelectedAircraft}
              flaps={flaps}
              onFlapsChange={setFlaps}
              thrust={thrust}
              onThrustChange={setThrust}
              tow={tow}
              onTowChange={setTow}
              pax={pax}
              onPaxChange={setPax}
              pAlt={pAlt}
              onPAltChange={setPAlt}
              wind={wind}
              onWindChange={setWind}
              windDir={windDir}
              onWindDirChange={setWindDir}
              slope={slope}
              onSlopeChange={setSlope}
              isa={isa}
              onIsaChange={setIsa}
              condition={condition}
              onConditionChange={setCondition}
              antiice={antiice}
              onAntiiceChange={setAntiice}
              packs={packs}
              onPacksChange={setPacks}
              reverser={reverser}
              onReverserChange={setReverser}
              seat={seat}
              onSeatChange={setSeat}
              cargo={cargo}
              onCargoChange={setCargo}
              runwayLength={runwayLength}
              onRunwayLengthChange={setRunwayLength}
              clearway={clearway}
              onClearwayChange={setClearway}
              runwayHeading={runwayHeading}
              onRunwayHeadingChange={setRunwayHeading}
              qnh={qnh}
              onQnhChange={setQnh}
              onDataImport={handleDataImport}
              onClose={() => setSidebarOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-80 xl:w-96">
          <Sidebar
            aircraftData={aircraftData}
            selectedAircraft={selectedAircraft}
            onAircraftChange={setSelectedAircraft}
            flaps={flaps}
            onFlapsChange={setFlaps}
            thrust={thrust}
            onThrustChange={setThrust}
            tow={tow}
            onTowChange={setTow}
            pax={pax}
            onPaxChange={setPax}
            pAlt={pAlt}
            onPAltChange={setPAlt}
            wind={wind}
            onWindChange={setWind}
            windDir={windDir}
            onWindDirChange={setWindDir}
            slope={slope}
            onSlopeChange={setSlope}
            isa={isa}
            onIsaChange={setIsa}
            condition={condition}
            onConditionChange={setCondition}
            antiice={antiice}
            onAntiiceChange={setAntiice}
            packs={packs}
            onPacksChange={setPacks}
            reverser={reverser}
            onReverserChange={setReverser}
            seat={seat}
            onSeatChange={setSeat}
            cargo={cargo}
            onCargoChange={setCargo}
            runwayLength={runwayLength}
            onRunwayLengthChange={setRunwayLength}
            clearway={clearway}
            onClearwayChange={setClearway}
            runwayHeading={runwayHeading}
            onRunwayHeadingChange={setRunwayHeading}
            qnh={qnh}
            onQnhChange={setQnh}
            onDataImport={handleDataImport}
          />
        </div>

        <main className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto lg:ml-0 pt-20 lg:pt-6 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-6"
          >
            {/* Performance Summary */}
            <PerformanceSummary
              aircraftName={currentAircraft?.name || "Unknown Aircraft"}
              toraAdjusted={toraTodaResults.requiredTakeoffRun}
              todaAdjusted={toraTodaResults.requiredTakeoffDistance}
              toraBase={toraTodaResults.availableTora}
              todaBase={toraTodaResults.availableToda}
              condition={condition}
              contaminated={params.contaminated}
              timestamp={new Date().toLocaleString()}
              isSafe={toraTodaResults.isSafe}
              warnings={toraTodaResults.warnings}
              densityAltitude={densityAltitude}
              windComponents={windComponents}
            />

            {/* Charts and Visualizations */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <PerformanceChart
                requiredTora={toraTodaResults.requiredTakeoffRun}
                requiredToda={toraTodaResults.requiredTakeoffDistance}
                availableTora={toraTodaResults.availableTora}
                availableToda={toraTodaResults.availableToda}
                aircraftName={currentAircraft?.name || "Unknown Aircraft"}
              />
              <ComparisonChart title="Performance Comparison" data={comparisonData} />
            </div>

            {/* Runway Visualization */}
            <RunwayVisualization
              tora={toraTodaResults.requiredTakeoffRun}
              toda={toraTodaResults.requiredTakeoffDistance}
              availableTora={toraTodaResults.availableTora}
              availableToda={toraTodaResults.availableToda}
              condition={condition}
              contaminated={params.contaminated}
              slope={slope}
              runwayLength={runwayLength}
              clearway={clearway}
              isSafe={toraTodaResults.isSafe}
              warnings={toraTodaResults.warnings}
            />

            {/* Performance Factors and Condition */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PerformanceFactors params={params} />
              </div>
              <RunwayConditionIndicator condition={condition} contaminated={params.contaminated} />
            </div>

            {/* Metrics Dashboard */}
            <MetricsDashboard
              aircraftMetrics={aircraftMetrics}
              environmentalMetrics={environmentalMetrics}
              runwayInfrastructureMetrics={runwayInfrastructureMetrics}
              performanceMetrics={performanceMetrics}
              operationalMetrics={operationalMetrics}
            />

            <VSpeedsTable
              vspeeds={vspeeds}
              aircraftName={currentAircraft?.name || "Unknown Aircraft"}
              tow={tow}
              refTow={currentAircraft?.refTow || 70000}
              flaps={flaps}
              thrust={thrust}
              condition={condition}
            />

            {/* Pilot Operations */}
            <PilotOperations
              runwayHeading={rwHeading}
              onRunwayHeadingChange={setRwHeading}
              windDirection={pilotWindDir}
              onWindDirectionChange={setPilotWindDir}
              windSpeed={windSpd}
              onWindSpeedChange={setWindSpd}
              crosswindLimit={pilotXwMin}
              onCrosswindLimitChange={setPilotXwMin}
              tailwindLimit={pilotTwMin}
              onTailwindLimitChange={setPilotTwMin}
              reportTime={reportTime}
              onReportTimeChange={setReportTime}
              priorRest={priorRest}
              onPriorRestChange={setPriorRest}
              sectors={sectors}
              onSectorsChange={setSectors}
              plannedBlock={plannedBlock}
              onPlannedBlockChange={setPlannedBlock}
            />

            {/* Export Controls */}
            <ExportControls
              aircraft={currentAircraft}
              params={params}
              results={{
                toraAdjusted: toraTodaResults.requiredTakeoffRun,
                todaAdjusted: toraTodaResults.requiredTakeoffDistance,
                toraBase: currentAircraft?.tora || 2300,
                todaBase: currentAircraft?.toda || 2600,
              }}
              vspeeds={vspeeds}
            />
          </motion.div>
        </main>
      </div>
    </div>
  )
}