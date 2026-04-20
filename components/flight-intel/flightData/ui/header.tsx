"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/buttons/Standard"
import { Download } from "lucide-react"

interface HeaderProps {
  onExportPDF: () => void
}

export function Header({ onExportPDF }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState("--:--:--")

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date().toLocaleString())
    }

    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">AP</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Aero Data Pro</h1>
        </div>
        <div className="text-sm text-muted-foreground">Professional Aviation Performance Calculator</div>
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={onExportPDF} variant="outline" size="sm" className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
        <div className="text-sm text-muted-foreground font-mono">{currentTime}</div>
      </div>
    </header>
  )
}
