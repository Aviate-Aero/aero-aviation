"use client"

import { Fuel } from "lucide-react"
import { motion } from "framer-motion"
import { Input } from "@/components/input/Standard"
import { Label } from "@/components/label/Standard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select/Standard"
import { FUEL_POLICIES } from "@/components/constants/dispatch/dispatch"
import { calculateFuelPlan } from "@/components/lib/dispatch/fuel-calculations"
import type { FuelCalculationParams } from "@/components/lib/dispatch/fuel-calculations"

interface FuelPlanningCardProps {
  policy: string
  tripKg: number
  taxiKg: number
  holdFlow: number
  cruiseFlow: number
  gsKt: number
  contPct: number
  finalMin: number
  altPlan: string
  altFuel: number
  arrIcao: string
  fuelPlan: string
  onPolicyChange: (value: string) => void
  onTripKgChange: (value: number) => void
  onTaxiKgChange: (value: number) => void
  onHoldFlowChange: (value: number) => void
  onCruiseFlowChange: (value: number) => void
  onGsKtChange: (value: number) => void
  onContPctChange: (value: number) => void
  onFinalMinChange: (value: number) => void
  onAltPlanChange: (value: string) => void
  onAltFuelChange: (value: number) => void
  onComputeFuel: () => void
  onCopyFuelPlan: () => void
}

export function FuelPlanningCard({
  policy,
  tripKg,
  taxiKg,
  holdFlow,
  cruiseFlow,
  gsKt,
  contPct,
  finalMin,
  altPlan,
  altFuel,
  arrIcao,
  onPolicyChange,
  onTripKgChange,
  onTaxiKgChange,
  onHoldFlowChange,
  onCruiseFlowChange,
  onGsKtChange,
  onContPctChange,
  onFinalMinChange,
  onAltFuelChange,
}: FuelPlanningCardProps) {
  const params: FuelCalculationParams = {
    policy,
    tripKg,
    taxiKg,
    holdFlow,
    cruiseFlow,
    gsKt,
    contPct,
    finalMin,
    altPlan,
    altFuel,
    arrIcao,
  }

  const fuelResult = calculateFuelPlan(params)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center border border-sky-500/30">
          <Fuel className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-white">Fuel Planning</h2>
          <p className="text-zinc-400 text-sm">Calculate required fuel based on policy</p>
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policy and Basic Inputs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-zinc-300">Fuel Policy</Label>
            <Select value={policy} onValueChange={onPolicyChange}>
              <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                {Object.entries(FUEL_POLICIES).map(([key, pol]) => (
                  <SelectItem key={key} value={key} className="focus:bg-sky-300 focus:text-white">
                    {pol.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-zinc-300">Trip Fuel (kg)</Label>
              <Input
                type="number"
                value={tripKg}
                onChange={(e) => onTripKgChange(Number(e.target.value))}
                className="bg-zinc-950 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-zinc-300">Taxi Fuel (kg)</Label>
              <Input
                type="number"
                value={taxiKg}
                onChange={(e) => onTaxiKgChange(Number(e.target.value))}
                className="bg-zinc-950 border-zinc-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* Flow Rates and Performance */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-zinc-300">Performance Parameters</Label>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-zinc-300">Holding Flow (kg/h)</Label>
              <Input
                type="number"
                value={holdFlow}
                onChange={(e) => onHoldFlowChange(Number(e.target.value))}
                className="bg-zinc-950 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-zinc-300">Cruise Flow (kg/h)</Label>
              <Input
                type="number"
                value={cruiseFlow}
                onChange={(e) => onCruiseFlowChange(Number(e.target.value))}
                className="bg-zinc-950 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-zinc-300">Ground Speed (kt)</Label>
              <Input
                type="number"
                value={gsKt}
                onChange={(e) => onGsKtChange(Number(e.target.value))}
                className="bg-zinc-950 border-zinc-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* Company Overrides */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-zinc-300">Company Overrides</Label>
            <p className="text-xs text-zinc-500">
              Only applies when &quot;Company custom&quot; is selected
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-zinc-300">Contingency %</Label>
              <Input
                type="number"
                value={contPct}
                onChange={(e) => onContPctChange(Number(e.target.value))}
                className="bg-zinc-950 border-zinc-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={policy !== "company"}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-zinc-300">Final Reserve (min)</Label>
              <Input
                type="number"
                value={finalMin}
                onChange={(e) => onFinalMinChange(Number(e.target.value))}
                className="bg-zinc-950 border-zinc-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={policy !== "company"}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-zinc-300">Alternate Fuel (kg)</Label>
              <Input
                type="number"
                value={altFuel}
                onChange={(e) => onAltFuelChange(Number(e.target.value))}
                className="bg-zinc-950 border-zinc-700 text-white"
                placeholder="Enter alternate fuel"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fuel Breakdown Summary */}
      <div className="pt-4 border-t border-zinc-800">
        <h3 className="text-md font-medium text-white mb-4">Fuel Breakdown</h3>
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Taxi:</span>
              <span className="font-mono text-white">{fuelResult.breakdown.taxi} kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Trip:</span>
              <span className="font-mono text-white">{fuelResult.breakdown.trip} kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">
                Contingency ({fuelResult.policy.contPct}%):
              </span>
              <span className="font-mono text-white">{fuelResult.breakdown.contingency} kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Alternate:</span>
              <span className="font-mono text-white">{fuelResult.breakdown.alternate} kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">
                Final ({fuelResult.policy.finalMin}m):
              </span>
              <span className="font-mono text-white">{fuelResult.breakdown.final} kg</span>
            </div>
            <div className="border-t border-zinc-700 pt-3 mt-3">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-zinc-200">MINIMUM FUEL:</span>
                <span className="font-mono text-sky-400">{fuelResult.breakdown.total} kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}