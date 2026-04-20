"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select/Standard"
import { Label } from "@/components/label/Standard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card/Standard"
import type { AircraftData } from "@/components/types/flightData/aircraft"
import { Badge } from "@/components/badge/Standard"

interface AircraftSelectorProps {
  aircraftData: AircraftData[]
  selectedAircraft: string
  onAircraftChange: (aircraft: string) => void
}

export function AircraftSelector({ aircraftData, selectedAircraft, onAircraftChange }: AircraftSelectorProps) {
  const currentAircraft = aircraftData.find((x) => x.key === selectedAircraft) || aircraftData[0]
  const brand = selectedAircraft.startsWith("A3") ? "Airbus" : "Boeing"

  return (
    <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-white flex items-center gap-2">
          Aircraft Selection
          <Badge variant="outline" className="text-xs bg-sky-500/20 text-sky-400 border-sky-500/30">
            {brand}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="aircraft-select" className="text-sm font-medium text-zinc-300">
            Aircraft Type
          </Label>
          <Select value={selectedAircraft} onValueChange={onAircraftChange}>
            <SelectTrigger id="aircraft-select" className="bg-zinc-950 border-zinc-700 text-white">
              <SelectValue placeholder="Select aircraft" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
              {aircraftData.map((aircraft) => (
                <SelectItem key={aircraft.key} value={aircraft.key} className="">
                  {aircraft.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <div className="text-xs text-zinc-500">Max Seats</div>
            <div className="text-sm font-medium text-white">{currentAircraft.seats}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-zinc-500">Max Cargo</div>
            <div className="text-sm font-medium text-white">{currentAircraft.cargo.toLocaleString()} kg</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-zinc-500">MTOW</div>
            <div className="text-sm font-medium text-white">{currentAircraft.mtow.toLocaleString()} kg</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-zinc-500">Ref TOW</div>
            <div className="text-sm font-medium text-white">{currentAircraft.refTow.toLocaleString()} kg</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}