"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select/Standard"
import { Label } from "@/components/label/Standard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card/Standard"
import { Slider } from "@/components/ui/slider/Standard"

interface EnvironmentalConditionsProps {
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
  runwayLength: number
  onRunwayLengthChange: (runwayLength: number) => void
  clearway: number
  onClearwayChange: (clearway: number) => void
  runwayHeading: number
  onRunwayHeadingChange: (runwayHeading: number) => void
  qnh: number
  onQnhChange: (qnh: number) => void
}

export function EnvironmentalConditions({
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
  runwayLength,
  onRunwayLengthChange,
  clearway,
  onClearwayChange,
  runwayHeading,
  onRunwayHeadingChange,
  qnh,
  onQnhChange,
}: EnvironmentalConditionsProps) {
  const conditionOptions = [
    { value: "dry", label: "Dry" },
    { value: "wet", label: "Wet" },
    { value: "ice", label: "Ice" },
    { value: "snow", label: "Snow" },
    { value: "slush", label: "Slush" },
  ]

  return (
    <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-white">Environmental Conditions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pressure Altitude */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-zinc-300">Pressure Altitude</Label>
            <div className="text-sm text-zinc-400">{pAlt.toLocaleString()} ft</div>
          </div>
          <Slider
            value={[pAlt]}
            onValueChange={(value) => onPAltChange(value[0])}
            min={-1000}
            max={12000}
            step={500}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>-1,000 ft</span>
            <span>12,000 ft</span>
          </div>
        </div>

        {/* Wind Component */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-zinc-300">Wind Component</Label>
            <div className="text-sm text-zinc-400">
              {wind >= 0 ? "HW" : "TW"} {Math.abs(wind)} kt
            </div>
          </div>
          <Slider
            value={[wind]}
            onValueChange={(value) => onWindChange(value[0])}
            min={-20}
            max={50}
            step={1}
            className="w-full [&_[role=slider]]:bg-sky-500 [&_[role=slider]]:border-sky-500 [&_[class*=track]]:bg-zinc-700 [&_[class*=range]]:bg-sky-500"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>TW 20 kt</span>
            <span>Calm</span>
            <span>HW 50 kt</span>
          </div>
        </div>

        {/* Runway Slope */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-zinc-300">Runway Slope</Label>
            <div className="text-sm text-zinc-400">
              {slope > 0 ? "Up" : slope < 0 ? "Down" : "Level"} {Math.abs(slope).toFixed(1)}%
            </div>
          </div>
          <Slider
            value={[slope]}
            onValueChange={(value) => onSlopeChange(value[0])}
            min={-2}
            max={2}
            step={0.1}
            className="w-full [&_[role=slider]]:bg-sky-500 [&_[role=slider]]:border-sky-500 [&_[class*=track]]:bg-zinc-700 [&_[class*=range]]:bg-sky-500"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Down 2%</span>
            <span>Level</span>
            <span>Up 2%</span>
          </div>
        </div>

        {/* ISA Temperature */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-zinc-300">ISA Temperature</Label>
            <div className="text-sm text-zinc-400">{isa}°C</div>
          </div>
          <Slider
            value={[isa]}
            onValueChange={(value) => onIsaChange(value[0])}
            min={-20}
            max={40}
            step={1}
            className="w-full [&_[role=slider]]:bg-sky-500 [&_[role=slider]]:border-sky-500 [&_[class*=track]]:bg-zinc-700 [&_[class*=range]]:bg-sky-500"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>-20°C</span>
            <span>ISA +15°C</span>
            <span>40°C</span>
          </div>
        </div>

        {/* Runway Condition */}
        <div className="space-y-2">
          <Label htmlFor="condition-select" className="text-sm font-medium text-zinc-300">
            Normal braking action expected
          </Label>
          <Select value={condition} onValueChange={onConditionChange}>
            <SelectTrigger id="condition-select" className="bg-zinc-950 border-zinc-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
              {conditionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Wind Direction */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-zinc-300">Wind Direction</Label>
            <div className="text-sm text-zinc-400">{windDir}°</div>
          </div>
          <Slider
            value={[windDir]}
            onValueChange={(value) => onWindDirChange(value[0])}
            min={0}
            max={360}
            step={10}
            className="w-full [&_[role=slider]]:bg-sky-500 [&_[role=slider]]:border-sky-500 [&_[class*=track]]:bg-zinc-700 [&_[class*=range]]:bg-sky-500"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>0°</span>
            <span>180°</span>
            <span>360°</span>
          </div>
        </div>

        {/* Runway Heading */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-zinc-300">Runway Heading</Label>
            <div className="text-sm text-zinc-400">{runwayHeading}°</div>
          </div>
          <Slider
            value={[runwayHeading]}
            onValueChange={(value) => onRunwayHeadingChange(value[0])}
            min={0}
            max={360}
            step={10}
            className="w-full [&_[role=slider]]:bg-sky-500 [&_[role=slider]]:border-sky-500 [&_[class*=track]]:bg-zinc-700 [&_[class*=range]]:bg-sky-500"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>0°</span>
            <span>180°</span>
            <span>360°</span>
          </div>
        </div>

        {/* Runway Length */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-zinc-300">Runway Length (TORA)</Label>
            <div className="text-sm text-zinc-400">{runwayLength.toLocaleString()} m</div>
          </div>
          <Slider
            value={[runwayLength]}
            onValueChange={(value) => onRunwayLengthChange(value[0])}
            min={1000}
            max={5000}
            step={50}
            className="w-full [&_[role=slider]]:bg-sky-500 [&_[role=slider]]:border-sky-500 [&_[class*=track]]:bg-zinc-700 [&_[class*=range]]:bg-sky-500"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>1,000 m</span>
            <span>3,000 m</span>
            <span>5,000 m</span>
          </div>
        </div>

        {/* Clearway */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-zinc-300">Clearway (CWAY)</Label>
            <div className="text-sm text-zinc-400">{clearway} m</div>
          </div>
          <Slider
            value={[clearway]}
            onValueChange={(value) => onClearwayChange(value[0])}
            min={0}
            max={300}
            step={10}
            className="w-full [&_[role=slider]]:bg-sky-500 [&_[role=slider]]:border-sky-500 [&_[class*=track]]:bg-zinc-700 [&_[class*=range]]:bg-sky-500"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>0 m</span>
            <span>150 m</span>
            <span>300 m</span>
          </div>
        </div>

        {/* QNH Pressure */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-zinc-300">QNH Pressure</Label>
            <div className="text-sm text-zinc-400">{qnh} hPa</div>
          </div>
          <Slider
            value={[qnh]}
            onValueChange={(value) => onQnhChange(value[0])}
            min={950}
            max={1050}
            step={1}
            className="w-full [&_[role=slider]]:bg-sky-500 [&_[role=slider]]:border-sky-500 [&_[class*=track]]:bg-zinc-700 [&_[class*=range]]:bg-sky-500"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>950 hPa</span>
            <span>1013 hPa</span>
            <span>1050 hPa</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}