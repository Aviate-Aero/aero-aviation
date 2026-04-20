"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/card/Standard"
import { Badge } from "@/components/badge/Standard"
import { Progress } from "@/components/ui/progress/Standard"
import { Separator } from "@/components/ui/seperator/Standard"
import {
  flapFactor,
  thrustFactor,
  windFactor,
  slopeFactor,
  antiIceFactor,
  packsFactor,
  tempFactor,
  altitudeFactor,
  weightFactor,
} from "@/components/lib/flightData/performance-models"
import type { CalculationParams } from "@/components/types/flightData/aircraft"

interface PerformanceFactorsProps {
  params: CalculationParams
}

export function PerformanceFactors({ params }: PerformanceFactorsProps) {
  const factors = [
    {
      name: "Temperature",
      value: tempFactor(params.isa),
      description: `ISA ${params.isa}°C`,
      impact: params.isa > 15 ? "increases" : params.isa < 15 ? "decreases" : "neutral",
    },
    {
      name: "Altitude",
      value: altitudeFactor(params.pAlt),
      description: `${params.pAlt.toLocaleString()} ft`,
      impact: params.pAlt > 0 ? "increases" : "neutral",
    },
    {
      name: "Weight",
      value: weightFactor(params.tow, params.refTow),
      description: `${((params.tow / params.refTow) * 100).toFixed(0)}% of ref TOW`,
      impact: params.tow > params.refTow ? "increases" : params.tow < params.refTow ? "decreases" : "neutral",
    },
    {
      name: "Wind",
      value: windFactor(params.wind),
      description: `${Math.abs(params.wind)} kt ${params.wind >= 0 ? "headwind" : "tailwind"}`,
      impact: params.wind >= 0 ? "decreases" : "increases",
    },
    {
      name: "Slope",
      value: slopeFactor(params.slope),
      description: `${Math.abs(params.slope).toFixed(1)}% ${params.slope > 0 ? "upslope" : params.slope < 0 ? "downslope" : "level"}`,
      impact: params.slope > 0 ? "increases" : params.slope < 0 ? "decreases" : "neutral",
    },
    {
      name: "Flaps",
      value: flapFactor(params.brand, params.flaps),
      description: `${params.flaps} configuration`,
      impact: flapFactor(params.brand, params.flaps) > 1 ? "increases" : "decreases",
    },
    {
      name: "Thrust",
      value: thrustFactor(params.thrust),
      description: params.thrust === "full" ? "Full thrust" : `${params.thrust === "d10" ? "10%" : "20%"} derate`,
      impact: params.thrust !== "full" ? "increases" : "neutral",
    },
    {
      name: "Anti-ice",
      value: antiIceFactor(params.antiice),
      description: params.antiice ? "Required" : "Not required",
      impact: params.antiice ? "increases" : "neutral",
    },
    {
      name: "Packs",
      value: packsFactor(params.packs),
      description: params.packs ? "ON" : "OFF",
      impact: params.packs ? "increases" : "decreases",
    },
  ]

  const overallFactor = factors.reduce((acc, factor) => acc * factor.value, 1)

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "increases":
        return "destructive"
      case "decreases":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getFactorProgress = (value: number) => {
    // Convert factor to percentage for progress bar (0.8 to 1.4 range)
    const min = 0.8
    const max = 1.4
    const normalized = ((value - min) / (max - min)) * 100
    return Math.max(0, Math.min(100, normalized))
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-white">Performance Factors</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Overall Factor:</span>
          <Badge variant={overallFactor > 1.1 ? "destructive" : overallFactor < 0.95 ? "secondary" : "outline"}>
            {overallFactor.toFixed(3)}x
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {factors.map((factor, index) => (
          <div key={factor.name}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-300">{factor.name}</span>
                <Badge variant={getImpactColor(factor.impact)} className="text-xs">
                  {factor.value.toFixed(3)}x
                </Badge>
              </div>
              <span className="text-xs text-zinc-400">{factor.description}</span>
            </div>
            <Progress
              value={getFactorProgress(factor.value)}
              className="h-2 bg-zinc-800 [&>div]:bg-sky-500"
            />
            {index < factors.length - 1 && <Separator className="mt-4 bg-zinc-800" />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}