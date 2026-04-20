"use client"
import { Separator } from "@radix-ui/react-select"
import { AircraftSelector } from "../aircraft/aircraft-selector"
import { FlightConfiguration } from "../aircraft/flight-configuration"
import { EnvironmentalConditions } from "../aircraft/enviromental-conditions"
import type { AircraftData } from "@/components/types/flightData/aircraft"

interface SidebarProps {
  aircraftData: AircraftData[]
  selectedAircraft: string
  onAircraftChange: (aircraft: string) => void
  flaps: string
  onFlapsChange: (flaps: string) => void
  thrust: string
  onThrustChange: (thrust: string) => void
  tow: number
  onTowChange: (tow: number) => void
  pax: number
  onPaxChange: (pax: number) => void
  pAlt: number
  onPAltChange: (pAlt: number) => void
  wind: number
  onWindChange: (wind: number) => void
  windDir: number
  onWindDirChange: (windDir: number) => void
  slope: number
  onSlopeChange: (slope: number) => void
  isa: number
  onIsaChange: (isa: number) => void
  condition: string
  onConditionChange: (condition: string) => void
  antiice: boolean
  onAntiiceChange: (antiice: boolean) => void
  packs: boolean
  onPacksChange: (packs: boolean) => void
  reverser: boolean
  onReverserChange: (reverser: boolean) => void
  seat: number
  onSeatChange: (seat: number) => void
  cargo: number
  onCargoChange: (cargo: number) => void
  runwayLength: number
  onRunwayLengthChange: (runwayLength: number) => void
  clearway: number
  onClearwayChange: (clearway: number) => void
  runwayHeading: number
  onRunwayHeadingChange: (runwayHeading: number) => void
  qnh: number
  onQnhChange: (qnh: number) => void
  onDataImport: (data: AircraftData[]) => void
  onClose?: () => void // Add this optional prop
}

export function Sidebar({
  aircraftData,
  selectedAircraft,
  onAircraftChange,
  flaps,
  onFlapsChange,
  thrust,
  onThrustChange,
  tow,
  onTowChange,
  pax,
  onPaxChange,
  pAlt,
  onPAltChange,
  wind,
  onWindChange,
  windDir,
  onWindDirChange,
  slope,
  onSlopeChange,
  isa,
  onIsaChange,
  condition,
  onConditionChange,
  antiice,
  onAntiiceChange,
  packs,
  onPacksChange,
  reverser,
  onReverserChange,
  seat,
  onSeatChange,
  cargo,
  onCargoChange,
  runwayLength,
  onRunwayLengthChange,
  clearway,
  onClearwayChange,
  runwayHeading,
  onRunwayHeadingChange,
  qnh,
  onQnhChange,
  onClose, 
}: SidebarProps) {
  const currentAircraft = aircraftData.find((x) => x.key === selectedAircraft) || aircraftData[0]
  const brand = selectedAircraft.startsWith("A3") ? "airbus" : "boeing"

  return (
    <aside className="w-full bg-card border-r border-border overflow-y-auto">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Close button for mobile */}
        {onClose && (
          <div className="lg:hidden flex justify-between items-center">
            <h2 className="text-lg font-semibold">Aircraft Configuration</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className={onClose ? "lg:block" : ""}>
          <h2 className="text-lg font-semibold mb-2 hidden lg:block">Aircraft Configuration</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Configure aircraft parameters and environmental conditions for performance calculations.
          </p>
        </div>

        <AircraftSelector
          aircraftData={aircraftData}
          selectedAircraft={selectedAircraft}
          onAircraftChange={onAircraftChange}
        />

        <Separator />

        <FlightConfiguration
          brand={brand}
          flaps={flaps}
          onFlapsChange={onFlapsChange}
          thrust={thrust}
          onThrustChange={onThrustChange}
          tow={tow}
          onTowChange={onTowChange}
          maxTow={currentAircraft.mtow}
          refTow={currentAircraft.refTow}
          pax={pax}
          onPaxChange={onPaxChange}
          seat={seat}
          onSeatChange={onSeatChange}
          cargo={cargo}
          onCargoChange={onCargoChange}
          antiice={antiice}
          onAntiiceChange={onAntiiceChange}
          packs={packs}
          onPacksChange={onPacksChange}
          reverser={reverser}
          onReverserChange={onReverserChange}
        />

        <Separator />

        <EnvironmentalConditions
          pAlt={pAlt}
          onPAltChange={onPAltChange}
          wind={wind}
          onWindChange={onWindChange}
          windDir={windDir}
          onWindDirChange={onWindDirChange}
          slope={slope}
          onSlopeChange={onSlopeChange}
          isa={isa}
          onIsaChange={onIsaChange}
          condition={condition}
          onConditionChange={onConditionChange}
          runwayLength={runwayLength}
          onRunwayLengthChange={onRunwayLengthChange}
          clearway={clearway}
          onClearwayChange={onClearwayChange}
          runwayHeading={runwayHeading}
          onRunwayHeadingChange={onRunwayHeadingChange}
          qnh={qnh}
          onQnhChange={onQnhChange}
        />

        <Separator />

        {/* <DataImport onDataImport={onDataImport} /> */}
      </div>
    </aside>
  )
}