"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/card/Standard"
import { Badge } from "@/components/badge/Standard"
import { Gauge, AlertTriangle, CheckCircle } from "lucide-react"

interface VSpeedsData {
  V1: number
  VR: number
  V2: number
  status: "normal" | "warning" | "critical"
  limitingFactor?: string
}

interface VSpeedsTableProps {
  vspeeds: VSpeedsData
  aircraftName: string
  tow: number
  refTow: number
  flaps: string
  thrust: string
  condition: string
  className?: string
}

export function VSpeedsTable({
  vspeeds,
  aircraftName,
  tow,
  refTow,
  flaps,
  thrust,
  condition,
  className = "",
}: VSpeedsTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-rose-400" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />
      case "normal":
      default:
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "text-rose-400"
      case "warning":
        return "text-amber-400"
      case "normal":
      default:
        return "text-emerald-400"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return "destructive"
      case "warning":
        return "outline"
      case "normal":
      default:
        return "secondary"
    }
  }

  const weightRatio = ((tow / refTow) * 100).toFixed(1)

  return (
    <Card className={`bg-zinc-900 border-zinc-800 rounded-2xl ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
          <Gauge className="w-5 h-5 text-sky-400" />
          V-Speeds
        </CardTitle>
        <div className="text-sm text-zinc-400">
          Takeoff decision, rotation, and safety speeds
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Indicator */}
        <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center gap-2">
            {getStatusIcon(vspeeds.status)}
            <span className={`text-sm font-medium ${getStatusColor(vspeeds.status)}`}>
              {vspeeds.status === "normal"
                ? "Normal"
                : vspeeds.status === "warning"
                ? "Advisory"
                : "Critical"}
            </span>
          </div>
          {vspeeds.limitingFactor && (
            <Badge variant={getStatusBadge(vspeeds.status)} className="text-xs">
              {vspeeds.limitingFactor}
            </Badge>
          )}
        </div>

        {/* V-Speeds Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* V1 - Decision Speed */}
          <div className="text-center p-4 bg-sky-500/10 rounded-lg border border-sky-500/30">
            <div className="text-2xl font-bold text-sky-400">{vspeeds.V1}</div>
            <div className="text-sm font-medium text-sky-300 mt-1">V1</div>
            <div className="text-xs text-white mt-2">Decision Speed</div>
          </div>

          {/* VR - Rotation Speed */}
          <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
            <div className="text-2xl font-bold text-emerald-400">{vspeeds.VR}</div>
            <div className="text-sm font-medium text-emerald-300 mt-1">VR</div>
            <div className="text-xs text-white mt-2">Rotation Speed</div>
          </div>

          {/* V2 - Safety Speed */}
          <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <div className="text-2xl font-bold text-purple-400">{vspeeds.V2}</div>
            <div className="text-sm font-medium text-purple-300 mt-1">V2</div>
            <div className="text-xs text-white mt-2">Safety Speed</div>
          </div>
        </div>

        {/* Configuration Details */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Aircraft:</span>
              <span className="font-medium text-white">{aircraftName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Flaps:</span>
              <span className="font-medium text-white">{flaps}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Thrust:</span>
              <span className="font-medium text-white">
                {thrust === "full"
                  ? "TOGA"
                  : thrust === "d10"
                  ? "TO-1/FLEX"
                  : "TO-2/Deep FLEX"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Weight Ratio:</span>
              <span className="font-medium text-white">{weightRatio}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Runway:</span>
              <span className="font-medium capitalize text-white">{condition}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">TOW:</span>
              <span className="font-medium text-white">{tow.toLocaleString()} kg</span>
            </div>
          </div>
        </div>

        {/* Performance Notes */}
        <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">
          <div className="font-medium mb-1 text-zinc-400">Performance Notes:</div>
          <ul className="space-y-1">
            <li>• V1: Critical engine failure recognition speed</li>
            <li>• VR: Rotation speed for liftoff attitude</li>
            <li>• V2: Minimum climb speed after takeoff</li>
            <li>• All speeds in knots (KT)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}