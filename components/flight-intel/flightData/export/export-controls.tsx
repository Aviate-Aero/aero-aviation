"use client"

import { useState } from "react"
import { Button } from "@/components/buttons/Standard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card/Standard"
import { Separator } from "@/components/ui/seperator/Standard"
import { Download, FileText, Share2 } from "lucide-react"
import { useToast } from "@/components/hooks/use-toast"
import { exportToPDF } from "@/components/lib/flightData/pdf-export"
import type { AircraftData, CalculationParams } from "@/components/types/flightData/aircraft"

interface VSpeedsData {
  V1: number
  VR: number
  V2: number
  status: "normal" | "warning" | "critical"
  limitingFactor?: string
}

interface ExportControlsProps {
  aircraft: AircraftData
  params: CalculationParams
  results: {
    toraAdjusted: number
    todaAdjusted: number
    toraBase: number
    todaBase: number
  }
  vspeeds: VSpeedsData
}

export function ExportControls({ aircraft, params, results, vspeeds }: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handlePDFExport = async () => {
    setIsExporting(true)
    try {
      await exportToPDF({
        aircraft,
        params,
        results,
        vspeeds,
        timestamp: new Date().toLocaleString(),
      })

      toast({
        title: "PDF exported successfully",
        description: "Performance report has been downloaded to your device.",
      })
    } catch {
      toast({
        title: "Export failed",
        description: "Unable to generate PDF report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleDataExport = () => {
    const exportData = {
      aircraft,
      parameters: params,
      results,
      vspeeds,
      timestamp: new Date().toISOString(),
      version: "1.0",
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `aero-data-pro-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Data exported successfully",
      description: "Configuration data has been saved as JSON file.",
    })
  }

  const handleShareData = async () => {
    const shareData = {
      aircraft: aircraft.name,
      tow: params.tow,
      condition: params.condition,
      tora: results.toraAdjusted,
      toda: results.todaAdjusted,
      v1: vspeeds.V1,
      vr: vspeeds.VR,
      v2: vspeeds.V2,
      timestamp: new Date().toLocaleString(),
    }

    const shareText = `Aero Data Pro Performance Report
Aircraft: ${shareData.aircraft}
TOW: ${shareData.tow.toLocaleString()} kg
Condition: ${shareData.condition}
TORA: ${shareData.tora.toLocaleString()} m
TODA: ${shareData.toda.toLocaleString()} m
V-Speeds: V1=${shareData.v1}kt VR=${shareData.vr}kt V2=${shareData.v2}kt
Generated: ${shareData.timestamp}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Aero Data Pro Performance Report",
          text: shareText,
        })
      } catch {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText)
        toast({
          title: "Copied to clipboard",
          description: "Performance summary has been copied to your clipboard.",
        })
      } catch {
        toast({
          title: "Share failed",
          description: "Unable to share or copy data. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-sky-400" />
          Export & Share
        </CardTitle>
        <div className="text-sm text-zinc-400">
          Export performance data and share results
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PDF Export */}
        <div className="space-y-2">
          <Button
            onClick={handlePDFExport}
            disabled={isExporting}
            variant="outline"
            className="w-full gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <FileText className="w-4 h-4" />
            {isExporting ? "Generating PDF..." : "Export PDF Report"}
          </Button>
          <div className="text-xs text-zinc-500">
            Generate a comprehensive PDF report with all performance calculations and parameters.
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Data Export */}
        <div className="space-y-2">
          <Button
            onClick={handleDataExport}
            variant="outline"
            className="w-full gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <Download className="w-4 h-4" />
            Export Configuration Data
          </Button>
          <div className="text-xs text-zinc-500">
            Save current configuration as JSON file for backup or sharing with other users.
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Share */}
        <div className="space-y-2">
          <Button
            onClick={handleShareData}
            variant="outline"
            className="w-full gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <Share2 className="w-4 h-4" />
            Share Performance Summary
          </Button>
          <div className="text-xs text-zinc-500">
            Share key performance metrics via system share dialog or clipboard.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}