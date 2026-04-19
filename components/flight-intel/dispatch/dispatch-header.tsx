"use client"

import { Clock, Plane } from "lucide-react"
import { useState, useEffect } from "react"
import { Badge } from "@/components/badge/Standard"

interface DispatchHeaderProps {
  status: string
  networkStatus: string
}

export function DispatchHeader({ status, networkStatus }: DispatchHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <header className="dispatch-card p-6 mb-8 bg-gradient-to-r from-card via-aviation-surface-elevated to-card border-2 border-aviation-border-light">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-aviation-blue to-aviation-sky rounded-xl flex items-center justify-center shadow-md">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-aviation-text-primary tracking-tight">Aero Data Pro Dispatch</h1>
            <p className="text-sm text-aviation-text-secondary font-medium">Flight Operations Center</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-aviation-surface rounded-lg border border-aviation-border-light">
            <Clock className="w-4 h-4 text-aviation-blue" />
            <span className="font-mono text-sm font-semibold text-aviation-text-primary">
              {currentTime.toLocaleTimeString("en-US", {
                hour12: false,
                timeZone: "UTC",
              })}{" "}
              <span className="text-aviation-text-muted">UTC</span>
            </span>
          </div>

          <div className="flex gap-2">
            <Badge className="bg-aviation-blue/10 text-aviation-blue border border-aviation-blue/20 px-3 py-1 font-medium">
              System Ready
            </Badge>
            <Badge className="bg-aviation-green/10 text-aviation-green border border-aviation-green/20 px-3 py-1 font-medium">
              {networkStatus}
            </Badge>
          </div>
        </div>
      </div>

      {status && status !== "Ready — live via Worker" && (
        <div className="mt-4 pt-4 border-t border-aviation-border-light">
          <p className="text-sm text-aviation-text-secondary">{status}</p>
        </div>
      )}
    </header>
  )
}
