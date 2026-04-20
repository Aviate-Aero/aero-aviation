"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/card/Standard"
import { Separator } from "@/components/ui/seperator/Standard"
import { WindAnalysis } from "./wind-analysis"
import { DutyTimeCalculator } from "./duty-time-calculator"
import { Users } from "lucide-react"

interface PilotOperationsProps {
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
  reportTime: string
  onReportTimeChange: (time: string) => void
  priorRest: number
  onPriorRestChange: (rest: number) => void
  sectors: number
  onSectorsChange: (sectors: number) => void
  plannedBlock: string
  onPlannedBlockChange: (block: string) => void
}

export function PilotOperations({
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
  reportTime,
  onReportTimeChange,
  priorRest,
  onPriorRestChange,
  sectors,
  onSectorsChange,
  plannedBlock,
  onPlannedBlockChange,
}: PilotOperationsProps) {
  return (
    <Card className="bg-aviation-surface-elevated border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-white" />
          Pilot Operations
        </CardTitle>
        <div className="text-sm text-muted-foreground">Operational planning tools for flight crew decision making</div>
      </CardHeader>
      <CardContent className="space-y-6">
        <WindAnalysis
          runwayHeading={runwayHeading}
          onRunwayHeadingChange={onRunwayHeadingChange}
          windDirection={windDirection}
          onWindDirectionChange={onWindDirectionChange}
          windSpeed={windSpeed}
          onWindSpeedChange={onWindSpeedChange}
          crosswindLimit={crosswindLimit}
          onCrosswindLimitChange={onCrosswindLimitChange}
          tailwindLimit={tailwindLimit}
          onTailwindLimitChange={onTailwindLimitChange}
        />

        <Separator />

        <DutyTimeCalculator
          reportTime={reportTime}
          onReportTimeChange={onReportTimeChange}
          priorRest={priorRest}
          onPriorRestChange={onPriorRestChange}
          sectors={sectors}
          onSectorsChange={onSectorsChange}
          plannedBlock={plannedBlock}
          onPlannedBlockChange={onPlannedBlockChange}
        />
      </CardContent>
    </Card>
  )
}
