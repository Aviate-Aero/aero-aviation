"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card/Standard"
import { Badge } from "@/components/badge/Standard"
import { Separator } from "@/components/ui/seperator/Standard"
import { Activity, Gauge, Thermometer, Wind, Mountain, Ruler } from "lucide-react"

interface MetricItem {
  label: string
  value: string | number
  unit?: string
  status?: "normal" | "warning" | "critical" | "info"
  icon?: React.ReactNode
  description?: string
}

interface MetricsSectionProps {
  title: string
  metrics: MetricItem[]
  icon?: React.ReactNode
}

function MetricsSection({ title, metrics, icon }: MetricsSectionProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "critical":
        return "text-rose-400"
      case "warning":
        return "text-amber-400"
      case "info":
        return "text-sky-400"
      case "normal":
      default:
        return "text-emerald-400"
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "critical":
        return "destructive"
      case "warning":
        return "outline"
      case "info":
        return "secondary"
      case "normal":
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-medium text-white">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">{metric.label}</span>
              {metric.status && <Badge variant={getStatusBadge(metric.status)} className="text-xs h-5" />}
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold ${getStatusColor(metric.status)}`}>
                {typeof metric.value === "number" ? metric.value.toLocaleString() : metric.value}
              </span>
              {metric.unit && <span className="text-xs text-zinc-500">{metric.unit}</span>}
            </div>
            {metric.description && <div className="text-xs text-zinc-500">{metric.description}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

interface MetricsDashboardProps {
  aircraftMetrics: MetricItem[]
  environmentalMetrics: MetricItem[]
  runwayInfrastructureMetrics: MetricItem[]
  performanceMetrics: MetricItem[]
  operationalMetrics: MetricItem[]
}

export function MetricsDashboard({
  aircraftMetrics,
  environmentalMetrics,
  runwayInfrastructureMetrics,
  performanceMetrics,
  operationalMetrics,
}: MetricsDashboardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-400" />
          Performance Factors and Metrics Dashboard
        </CardTitle>
        <div className="text-sm text-zinc-400">
          Comprehensive operational parameters and status indicators
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <MetricsSection
          title="Aircraft Configuration"
          metrics={aircraftMetrics}
          icon={<Gauge className="w-4 h-4 text-sky-400" />}
        />

        <Separator className="bg-zinc-800" />

        <MetricsSection
          title="Environmental Conditions"
          metrics={environmentalMetrics}
          icon={<Thermometer className="w-4 h-4 text-amber-400" />}
        />

        <Separator className="bg-zinc-800" />

        <MetricsSection
          title="Runway Infrastructure"
          metrics={runwayInfrastructureMetrics}
          icon={<Ruler className="w-4 h-4 text-sky-400" />}
        />

        <Separator className="bg-zinc-800" />

        <MetricsSection
          title="Performance Results"
          metrics={performanceMetrics}
          icon={<Mountain className="w-4 h-4 text-emerald-400" />}
        />

        <Separator className="bg-zinc-800" />

        <MetricsSection
          title="Operational Status"
          metrics={operationalMetrics}
          icon={<Wind className="w-4 h-4 text-rose-400" />}
        />
      </CardContent>
    </Card>
  )
}