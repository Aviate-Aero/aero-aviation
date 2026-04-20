"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/card/Standard"
import { Badge } from "@/components/badge/Standard"
import { Progress } from "@/components/ui/progress/Standard"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ComparisonData {
  label: string
  current: number
  baseline: number
  unit: string
  format?: (value: number) => string
}

interface ComparisonChartProps {
  title: string
  data: ComparisonData[]
}

export function ComparisonChart({ title, data }: ComparisonChartProps) {
  const getPercentageChange = (current: number, baseline: number) => {
    if (baseline === 0) return 0
    return ((current - baseline) / baseline) * 100
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />
    if (change < 0) return <TrendingDown className="w-3 h-3" />
    return <Minus className="w-3 h-3" />
  }

  const getTrendColor = (change: number) => {
    if (Math.abs(change) < 1) return "outline"
    return change > 0 ? "destructive" : "secondary"
  }

  const getProgressValue = (current: number, baseline: number) => {
    const max = Math.max(current, baseline)
    return max > 0 ? (current / max) * 100 : 0
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => {
          const change = getPercentageChange(item.current, item.baseline)
          const formatter = item.format || ((value: number) => value.toLocaleString())

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">{item.label}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={getTrendColor(change)} className="gap-1 text-xs">
                    {getTrendIcon(change)}
                    {change > 0 ? "+" : ""}
                    {change.toFixed(1)}%
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <Progress
                  value={getProgressValue(item.current, item.baseline)}
                  className="h-2 bg-zinc-800 [&>div]:bg-sky-500"
                />
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>
                    Current: {formatter(item.current)} {item.unit}
                  </span>
                  <span>
                    Baseline: {formatter(item.baseline)} {item.unit}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}