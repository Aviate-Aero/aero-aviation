"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/card/Standard"
import { Label } from "@/components/label/Standard"
import { Input } from "@/components/input/Standard"
import { Badge } from "@/components/badge/Standard"
import { Separator } from "@/components/ui/seperator/Standard"
import { Wind, Navigation } from "lucide-react"
import { calculateWind } from "@/components/lib/flightData/pilot-calculations"

interface WindAnalysisProps {
  runwayHeading: number
  onRunwayHeadingChange: (heading: number) => void
  windDirection: number
  onWindDirectionChange: (direction: number) => void
  windSpeed: number
  onWindSpeedChange: (speed: number) => void
  crosswindLimit: number
  onCrosswindLimitChange: (limit: number) => void
  tailwindLimit: number
  onTailwindLimitChange: (limit: number) => void
  className?: string
}

export function WindAnalysis({
  runwayHeading,
  onRunwayHeadingChange,
  windDirection,
  onWindDirectionChange,
  windSpeed,
  onWindSpeedChange,
  crosswindLimit,
  onCrosswindLimitChange,
  tailwindLimit,
  onTailwindLimitChange,
  className = "",
}: WindAnalysisProps) {
  const windCalc = calculateWind(runwayHeading, windDirection, windSpeed, crosswindLimit, tailwindLimit)

  const getStatusVariant = (isOK: boolean) => {
    return isOK ? "secondary" : "destructive"
  }

  const getStatusText = (isOK: boolean, type: string) => {
    return isOK ? `${type} OK` : `${type} LIMIT`
  }

  return (
    <Card className={`bg-zinc-900 border-zinc-800 rounded-2xl ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-white flex items-center gap-2">
          <Wind className="w-4 h-4 text-sky-400" />
          Wind Analysis
        </CardTitle>
        <div className="text-sm text-zinc-400">
          Crosswind and tailwind component analysis
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Parameters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="runway-heading" className="text-sm font-medium text-zinc-300 flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              Runway Heading (°M)
            </Label>
            <Input
              id="runway-heading"
              type="number"
              value={runwayHeading}
              onChange={(e) => onRunwayHeadingChange(Number(e.target.value))}
              className="bg-zinc-950 border-zinc-700 text-white"
              min="0"
              max="360"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wind-direction" className="text-sm font-medium text-zinc-300">
              Wind Direction (°M)
            </Label>
            <Input
              id="wind-direction"
              type="number"
              value={windDirection}
              onChange={(e) => onWindDirectionChange(Number(e.target.value))}
              className="bg-zinc-950 border-zinc-700 text-white"
              min="0"
              max="360"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wind-speed" className="text-sm font-medium text-zinc-300">
              Wind Speed (kt)
            </Label>
            <Input
              id="wind-speed"
              type="number"
              value={windSpeed}
              onChange={(e) => onWindSpeedChange(Number(e.target.value))}
              className="bg-zinc-950 border-zinc-700 text-white"
              min="0"
              max="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crosswind-limit" className="text-sm font-medium text-zinc-300">
              Crosswind Limit (kt)
            </Label>
            <Input
              id="crosswind-limit"
              type="number"
              value={crosswindLimit}
              onChange={(e) => onCrosswindLimitChange(Number(e.target.value))}
              className="bg-zinc-950 border-zinc-700 text-white"
              min="0"
              max="50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tailwind-limit" className="text-sm font-medium text-zinc-300">
              Tailwind Limit (kt)
            </Label>
            <Input
              id="tailwind-limit"
              type="number"
              value={tailwindLimit}
              onChange={(e) => onTailwindLimitChange(Number(e.target.value))}
              className="bg-zinc-950 border-zinc-700 text-white"
              min="0"
              max="20"
            />
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Wind Components */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-white">Wind Components</div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="text-xs text-zinc-400">Headwind</div>
              <div className="text-lg font-bold text-sky-400">{Math.round(windCalc.headwind)} kt</div>
            </div>

            <div className="text-center space-y-2">
              <div className="text-xs text-zinc-400">Crosswind</div>
              <div className="text-lg font-bold text-amber-400">{Math.round(windCalc.crosswind)} kt</div>
            </div>

            <div className="text-center space-y-2">
              <div className="text-xs text-zinc-400">Tailwind</div>
              <div className="text-lg font-bold text-rose-400">{Math.round(windCalc.tailwind)} kt</div>
            </div>
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Status Indicators */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-white">Operational Limits</div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={getStatusVariant(windCalc.crosswindOK)} className="gap-1">
              <Wind className="w-3 h-3" />
              {getStatusText(windCalc.crosswindOK, "Crosswind")}
            </Badge>

            <Badge variant={getStatusVariant(windCalc.tailwindOK)} className="gap-1">
              <Navigation className="w-3 h-3" />
              {getStatusText(windCalc.tailwindOK, "Tailwind")}
            </Badge>

            <Badge variant={windCalc.crosswindOK && windCalc.tailwindOK ? "secondary" : "destructive"}>
              {windCalc.crosswindOK && windCalc.tailwindOK ? "All Limits OK" : "Limits Exceeded"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}