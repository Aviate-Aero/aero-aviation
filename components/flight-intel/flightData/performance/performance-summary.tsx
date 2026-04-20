"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/card/Standard"
import { Badge } from "@/components/badge/Standard"
import { Separator } from "@/components/ui/seperator/Standard"
import { Plane, Gauge, Wind, Mountain, AlertTriangle } from "lucide-react"

interface PerformanceSummaryProps {
  aircraftName: string
  toraAdjusted: number
  todaAdjusted: number
  toraBase: number
  todaBase: number
  condition: string
  contaminated: boolean
  timestamp: string
  isSafe: boolean
  warnings: string[]
  densityAltitude: number
  windComponents: {
    headwind: number
    crosswind: number
    tailwind: number
  }
}

export function PerformanceSummary({
  aircraftName,
  toraAdjusted,
  todaAdjusted,
  toraBase,
  todaBase,
  condition,
  contaminated,
  timestamp,
  isSafe,
  warnings,
  densityAltitude,
  windComponents,
}: PerformanceSummaryProps) {
  const toraIncrease = ((toraAdjusted - toraBase) / toraBase) * 100
  const todaIncrease = ((todaAdjusted - todaBase) / todaBase) * 100

  return (
    <Card className="bg-zinc-900 border-zinc-800 rounded-2xl mt-40">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <Plane className="w-5 h-5 text-sky-400" />
            Performance Summary
          </CardTitle>
          <div className="flex gap-2">
            <Badge
              variant={contaminated ? "destructive" : "secondary"}
              className="capitalize"
            >
              {condition}
            </Badge>
            <Badge variant={isSafe ? "secondary" : "destructive"}>
              {isSafe ? "SAFE" : "UNSAFE"}
            </Badge>
          </div>
        </div>
        <div className="text-sm text-zinc-400">{aircraftName}</div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Performance Metrics */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
              <span className="text-sm font-medium text-zinc-300">TORA (Takeoff Run Available)</span>
            </div>
            <div className="text-2xl font-bold text-white">{toraAdjusted.toLocaleString()} m</div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-500">Base: {toraBase.toLocaleString()} m</span>
              <Badge variant={toraIncrease > 0 ? "destructive" : "secondary"} className="text-xs">
                {toraIncrease > 0 ? "+" : ""}
                {toraIncrease.toFixed(1)}%
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-medium text-zinc-300">TODA (Takeoff Distance Available)</span>
            </div>
            <div className="text-2xl font-bold text-white">{todaAdjusted.toLocaleString()} m</div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-500">Base: {todaBase.toLocaleString()} m</span>
              <Badge variant={todaIncrease > 0 ? "destructive" : "secondary"} className="text-xs">
                {todaIncrease > 0 ? "+" : ""}
                {todaIncrease.toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Status Indicators */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-zinc-300">Performance Status</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-zinc-400">
                {contaminated ? "Contaminated Runway" : "Normal Operations"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-zinc-400">
                Headwind: {windComponents.headwind.toFixed(1)} kt
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mountain className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-zinc-400">
                Density Alt: {densityAltitude.toLocaleString()} ft
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-zinc-400">Warnings: {warnings.length}</span>
            </div>
          </div>
        </div>

        {/* Warnings Display */}
        {warnings.length > 0 && (
          <>
            <Separator className="bg-zinc-800" />
            <div className="space-y-2">
              <div className="text-sm font-medium text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Operational Warnings
              </div>
              <div className="space-y-1">
                {warnings.map((warning, index) => (
                  <div key={index} className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg">
                    • {warning}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator className="bg-zinc-800" />

        {/* Timestamp */}
        <div className="text-xs text-zinc-500">Calculated: {timestamp}</div>
      </CardContent>
    </Card>
  )
}