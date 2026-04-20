"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/card/Standard"
import { Label } from "@/components/label/Standard"
import { Input } from "@/components/input/Standard"
import { Badge } from "@/components/badge/Standard"
import { Separator } from "@/components/ui/seperator/Standard"
import { Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { calculateFDP, fmtHM } from "@/components/lib/flightData/pilot-calculations"

interface DutyTimeCalculatorProps {
  reportTime: string
  onReportTimeChange: (time: string) => void
  priorRest: number
  onPriorRestChange: (rest: number) => void
  sectors: number
  onSectorsChange: (sectors: number) => void
  plannedBlock: string
  onPlannedBlockChange: (block: string) => void
  className?: string
}

export function DutyTimeCalculator({
  reportTime,
  onReportTimeChange,
  priorRest,
  onPriorRestChange,
  sectors,
  onSectorsChange,
  plannedBlock,
  onPlannedBlockChange,
  className = "",
}: DutyTimeCalculatorProps) {
  const fdpCalc = calculateFDP(reportTime, priorRest, sectors, plannedBlock)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OK":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case "TIGHT":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />
      case "EXCEED":
        return <AlertTriangle className="w-4 h-4 text-rose-400" />
      default:
        return <Clock className="w-4 h-4 text-zinc-400" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "OK":
        return "secondary"
      case "TIGHT":
        return "outline"
      case "EXCEED":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OK":
        return "text-emerald-400"
      case "TIGHT":
        return "text-amber-400"
      case "EXCEED":
        return "text-rose-400"
      default:
        return "text-zinc-400"
    }
  }

  return (
    <Card className={`bg-zinc-900 border-zinc-800 rounded-2xl ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          Duty Time Calculator
        </CardTitle>
        <div className="text-sm text-zinc-400">
          Flight Duty Period (FDP) estimation for planning
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Parameters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="report-time" className="text-sm font-medium text-zinc-300">
              Report Time (Local)
            </Label>
            <Input
              id="report-time"
              type="time"
              value={reportTime}
              onChange={(e) => onReportTimeChange(e.target.value)}
              className="bg-zinc-950 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prior-rest" className="text-sm font-medium text-zinc-300">
              Prior Rest (hours)
            </Label>
            <Input
              id="prior-rest"
              type="number"
              value={priorRest}
              onChange={(e) => onPriorRestChange(Number(e.target.value))}
              className="bg-zinc-950 border-zinc-700 text-white"
              min="0"
              max="24"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sectors" className="text-sm font-medium text-zinc-300">
              Planned Sectors
            </Label>
            <Input
              id="sectors"
              type="number"
              value={sectors}
              onChange={(e) => onSectorsChange(Number(e.target.value))}
              className="bg-zinc-950 border-zinc-700 text-white"
              min="1"
              max="10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="planned-block" className="text-sm font-medium text-zinc-300">
              Planned Block (hh:mm)
            </Label>
            <Input
              id="planned-block"
              type="text"
              value={plannedBlock}
              onChange={(e) => onPlannedBlockChange(e.target.value)}
              placeholder="hh:mm"
              className="bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* FDP Analysis */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-white">FDP Analysis</div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="text-xs text-zinc-400">FDP Limit</div>
              <div className="text-2xl font-bold text-white">{fmtHM(fdpCalc.fdpLimit)}</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-zinc-400">FDP Remaining</div>
              <div className={`text-2xl font-bold ${getStatusColor(fdpCalc.status)}`}>
                {fmtHM(fdpCalc.fdpRemaining)}
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Status Indicators */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-white">Status</div>

          <div className="flex items-center gap-3">
            {getStatusIcon(fdpCalc.status)}
            <Badge variant={getStatusVariant(fdpCalc.status)} className="gap-1">
              {fdpCalc.status === "OK" && "FDP Within Limits"}
              {fdpCalc.status === "TIGHT" && "FDP Tight - Monitor"}
              {fdpCalc.status === "EXCEED" && "FDP Exceeded"}
            </Badge>
          </div>

          <div className="text-xs text-zinc-400 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <strong className="text-zinc-300">Note:</strong> This FDP calculation is a simplified estimator for planning purposes only. Always
            verify against your governing regulations and company policy for actual operations.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}