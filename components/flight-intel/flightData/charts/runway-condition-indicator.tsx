"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/card/Standard"
import { Badge } from "@/components/badge/Standard"
import { RUNWAY_CONDITION_COLORS } from "@/components/lib/constants"
import { Droplets, Snowflake, AlertTriangle } from "lucide-react"

interface RunwayConditionIndicatorProps {
  condition: string
  contaminated: boolean
}

export function RunwayConditionIndicator({ condition, contaminated }: RunwayConditionIndicatorProps) {
  const getConditionIcon = (cond: string) => {
    switch (cond) {
      case "wet":
      case "slush":
        return <Droplets className="w-4 h-4" />
      case "snow":
      case "ice":
        return <Snowflake className="w-4 h-4" />
      default:
        return null
    }
  }

  const getConditionDescription = (cond: string) => {
    switch (cond) {
      case "dry":
        return "Normal braking action expected"
      case "wet":
        return "Reduced braking effectiveness"
      case "slush":
        return "Significant performance degradation"
      case "snow":
        return "Poor braking action, increased distances"
      case "ice":
        return "Minimal braking action, maximum distances"
      default:
        return "Unknown condition"
    }
  }

  const conditionColor = RUNWAY_CONDITION_COLORS[condition as keyof typeof RUNWAY_CONDITION_COLORS] || "#4b5563"

  return (
    <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-white flex items-center gap-2">
          {contaminated && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          Runway Condition
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white capitalize">{condition}</span>
            <Badge variant={contaminated ? "destructive" : "secondary"} className="gap-1">
              {getConditionIcon(condition)}
              {contaminated ? "Contaminated" : "Normal"}
            </Badge>
          </div>

          <div
            className="w-full h-8 rounded-lg border border-zinc-700"
            style={{ backgroundColor: conditionColor }}
          />

          <div className="text-xs text-zinc-400">{getConditionDescription(condition)}</div>
        </div>

        {/* Performance Impact */}
        {contaminated && (
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span className="text-xs font-medium text-amber-400">Performance Impact</span>
            </div>
            <div className="text-xs text-zinc-400">
              Contaminated runway conditions result in increased takeoff distances and reduced braking effectiveness.
              Review performance calculations carefully.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}