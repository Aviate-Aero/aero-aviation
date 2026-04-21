"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select/Standard"
import { Label } from "@/components/label/Standard"
import { Input } from "@/components/input/Standard"
import { Switch } from "@/components/ui/switch/Standard"
import { Slider } from "@/components/ui/slider/Standard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card/Standard"
import { Separator } from "@/components/ui/seperator/Standard"

interface FlightConfigurationProps {
  brand: string
  flaps: string
  onFlapsChange: (flaps: string) => void
  thrust: string
  onThrustChange: (thrust: string) => void
  tow: number
  onTowChange: (tow: number) => void
  maxTow: number
  refTow: number
  pax: number
  onPaxChange: (pax: number) => void
  seat: number
  onSeatChange: (seat: number) => void
  cargo: number
  onCargoChange: (cargo: number) => void
  antiice: boolean
  onAntiiceChange: (antiice: boolean) => void
  packs: boolean
  onPacksChange: (packs: boolean) => void
  reverser: boolean
  onReverserChange: (reverser: boolean) => void
}

export function FlightConfiguration({
  brand,
  flaps,
  onFlapsChange,
  thrust,
  onThrustChange,
  tow,
  onTowChange,
  maxTow,
  refTow,
  pax,
  onPaxChange,
  seat,
  onSeatChange,
  cargo,
  onCargoChange,
  antiice,
  onAntiiceChange,
  packs,
  onPacksChange,
  reverser,
  onReverserChange,
}: FlightConfigurationProps) {
  const flapOptions = brand === "airbus" ? ["1+F", "2", "3", "FULL"] : ["1", "5", "15", "25"]

  const thrustOptions = [
    { value: "full", label: "Full / TOGA (100%)" },
    { value: "d10", label: "Derate 10% (TO-1 / FLEX)" },
    { value: "d20", label: "Derate 20% (TO-2 / Deep FLEX)" },
  ]

  return (
    <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-white">Flight Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Flaps and Thrust */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="flaps-select" className="text-sm font-medium text-zinc-300">
              Flaps / Config
            </Label>
            <Select value={flaps} onValueChange={onFlapsChange}>
              <SelectTrigger id="flaps-select" className="bg-zinc-950 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                {flapOptions.map((option) => (
                  <SelectItem key={option} value={option} className="">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thrust-select" className="text-sm font-medium text-zinc-300">
              Thrust Rating
            </Label>
            <Select value={thrust} onValueChange={onThrustChange}>
              <SelectTrigger id="thrust-select" className="bg-zinc-950 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                {thrustOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Weight Configuration */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-zinc-300">Takeoff Weight (TOW)</Label>
              <div className="text-sm text-zinc-400">{tow.toLocaleString()} kg</div>
            </div>
            <Slider
              value={[tow]}
              onValueChange={(value) => onTowChange(value[0])}
              min={30000}
              max={maxTow}
              step={100}
              className="w-full [&_[role=slider]]:bg-sky-500 [&_[role=slider]]:border-sky-500 [&_[class*=track]]:bg-zinc-700 [&_[class*=range]]:bg-sky-500"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>30,000 kg</span>
              <span>Ref: {refTow.toLocaleString()} kg</span>
              <span>Max: {maxTow.toLocaleString()} kg</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pax-input" className="text-sm font-medium text-zinc-300">
                Passengers (PAX)
              </Label>
              <Input
                id="pax-input"
                type="number"
                value={pax}
                onChange={(e) => onPaxChange(Number(e.target.value))}
                className="bg-zinc-950 border-zinc-700 text-white"
                min="0"
                max="650"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seat-input" className="text-sm font-medium text-zinc-300">
                Seating Config
              </Label>
              <Input
                id="seat-input"
                type="number"
                value={seat}
                onChange={(e) => onSeatChange(Number(e.target.value))}
                className="bg-zinc-950 border-zinc-700 text-white"
                min="0"
                max="650"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-zinc-300">Cargo Weight</Label>
              <div className="text-sm text-zinc-400">{cargo.toLocaleString()} kg</div>
            </div>
            <Slider
              value={[cargo]}
              onValueChange={(value) => onCargoChange(value[0])}
              min={0}
              max={60000}
              step={100}
              className="w-full [&_[role=slider]]:bg-sky-500 [&_[role=slider]]:border-sky-500 [&_[class*=track]]:bg-zinc-700 [&_[class*=range]]:bg-sky-500"
            />
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* System Configuration */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-zinc-300">System Configuration</div>

<div className="space-y-3">
  <div className="flex items-center justify-between">
    <Label htmlFor="antiice-switch" className="text-sm text-zinc-300">
      Anti-ice Required
    </Label>
    <Switch
      id="antiice-switch"
      checked={antiice}
      onCheckedChange={onAntiiceChange}
      className="data-[state=checked]:bg-sky-500 data-[state=unchecked]:bg-zinc-700"
    />
  </div>

  <div className="flex items-center justify-between">
    <Label htmlFor="packs-switch" className="text-sm text-zinc-300">
      Packs ON
    </Label>
    <Switch
      id="packs-switch"
      checked={packs}
      onCheckedChange={onPacksChange}
      className="data-[state=checked]:bg-sky-500 data-[state=unchecked]:bg-zinc-700"
    />
  </div>

  <div className="flex items-center justify-between">
    <Label htmlFor="reverser-switch" className="text-sm text-zinc-300">
      Reverser Credit
    </Label>
    <Switch
      id="reverser-switch"
      checked={reverser}
      onCheckedChange={onReverserChange}
      className="data-[state=checked]:bg-sky-500 data-[state=unchecked]:bg-zinc-700"
    />
  </div>
</div>
        </div>
      </CardContent>
    </Card>
  )
}