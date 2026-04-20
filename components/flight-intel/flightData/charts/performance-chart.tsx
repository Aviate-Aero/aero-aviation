"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card/Standard"
import { Chart, registerables } from "chart.js"
import { BarChart3 } from "lucide-react"

// Register Chart.js components
Chart.register(...registerables)

interface PerformanceChartProps {
  requiredTora: number
  requiredToda: number
  availableTora: number
  availableToda: number
  aircraftName: string
}

export function PerformanceChart({
  requiredTora,
  requiredToda,
  availableTora,
  availableToda,
  aircraftName,
}: PerformanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext("2d")
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["TORA Performance", "TODA Performance"],
            datasets: [
              {
                label: "Required Distance",
                data: [requiredTora, requiredToda],
                backgroundColor: "rgba(239, 68, 68, 0.8)", // Red
                borderColor: "rgba(239, 68, 68, 1)",
                borderWidth: 1,
                borderRadius: 4,
              },
              {
                label: "Available Distance",
                data: [availableTora, availableToda],
                backgroundColor: "rgba(34, 197, 94, 0.8)", // Green
                borderColor: "rgba(34, 197, 94, 1)",
                borderWidth: 1,
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  color: "#a1a1aa", // zinc-400
                  usePointStyle: true,
                },
              },
              tooltip: {
                backgroundColor: "rgba(24, 24, 27, 0.95)", // zinc-900
                titleColor: "#ffffff",
                bodyColor: "#d4d4d8", // zinc-300
                borderColor: "#3f3f46", // zinc-700
                borderWidth: 1,
                callbacks: {
                  label: (context) => {
                    const value = context.parsed.y ?? 0
                    return `${context.dataset.label}: ${value.toLocaleString()} m`
                  },
                },
              },
              title: {
                display: true,
                text: "Required vs Available Takeoff Distances",
                color: "#d4d4d8", // zinc-300
                font: {
                  size: 14,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Distance (meters)",
                  color: "#a1a1aa", // zinc-400
                },
                ticks: {
                  color: "#a1a1aa",
                  callback: function (value) {
                    const numValue = typeof value === "number" ? value : 0
                    return numValue.toLocaleString() + " m"
                  },
                },
                grid: {
                  color: "rgba(63, 63, 70, 0.5)", // zinc-700 with opacity
                },
              },
              x: {
                ticks: {
                  color: "#a1a1aa",
                },
                grid: {
                  display: false,
                },
              },
            },
            interaction: {
              intersect: false,
              mode: "index",
            },
          },
        })
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [requiredTora, requiredToda, availableTora, availableToda])

  // Calculate margins and utilization
  const toraMargin = availableTora - requiredTora
  const todaMargin = availableToda - requiredToda
  const toraUtilization = availableTora > 0 ? (requiredTora / availableTora) * 100 : 0
  const todaUtilization = availableToda > 0 ? (requiredToda / availableToda) * 100 : 0

  return (
    <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-sky-400" />
          Takeoff Performance Analysis
        </CardTitle>
        <div className="text-sm text-zinc-400">{aircraftName}</div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <canvas ref={chartRef} className="w-full h-full" />
        </div>

        {/* Performance Summary */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-400">TORA Margin:</span>
              <span
                className={
                  toraMargin >= 0
                    ? "text-emerald-400 font-medium"
                    : "text-rose-400 font-medium"
                }
              >
                {toraMargin >= 0 ? "+" : ""}
                {toraMargin.toLocaleString()} m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">TORA Utilization:</span>
              <span
                className={
                  toraUtilization > 80
                    ? "text-amber-400 font-medium"
                    : "text-emerald-400 font-medium"
                }
              >
                {toraUtilization.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-400">TODA Margin:</span>
              <span
                className={
                  todaMargin >= 0
                    ? "text-emerald-400 font-medium"
                    : "text-rose-400 font-medium"
                }
              >
                {todaMargin >= 0 ? "+" : ""}
                {todaMargin.toLocaleString()} m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">TODA Utilization:</span>
              <span
                className={
                  todaUtilization > 80
                    ? "text-amber-400 font-medium"
                    : "text-emerald-400 font-medium"
                }
              >
                {todaUtilization.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}