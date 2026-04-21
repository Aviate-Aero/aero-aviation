import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { AircraftData, CalculationParams } from "@/components/types/flightData/aircraft"

// ---------- Exported Interfaces ----------
export interface ExportData {
  aircraft: AircraftData
  params: CalculationParams & {
    windDir?: number
    runwayHeading?: number
    runwayLength?: number
    clearway?: number
    qnh?: number
  }
  results: {
    toraAdjusted: number
    todaAdjusted: number
    toraBase: number
    todaBase: number
  }
  vspeeds: VSpeedsData
  timestamp: string
}

export interface VSpeedsData {
  V1: number
  VR: number
  V2: number
  status: "normal" | "warning" | "critical"
  limitingFactor?: string
}

type AutoTableDoc = jsPDF & {
  lastAutoTable?: { finalY: number }
}

// ---------- Helper Functions ----------
function setDarkBackground(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFillColor(15, 23, 42) // slate-900
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
}

function addDarkPage(doc: AutoTableDoc) {
  doc.addPage()
  setDarkBackground(doc)
}

function getThrustLabel(thrust: string): string {
  switch (thrust) {
    case "full": return "Full / TOGA (100%)"
    case "d10": return "Derate 10% (TO-1 / FLEX)"
    case "d20": return "Derate 20% (TO-2 / Deep FLEX)"
    default: return thrust
  }
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

// ---------- Main Export Function ----------
export async function exportToPDF(data: ExportData): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" }) as AutoTableDoc
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 35
  let y = 40
  const footerHeight = 45

  // Dark Theme Colors
  const colors = {
    background: [15, 23, 42] as [number, number, number],
    surface: [30, 41, 59] as [number, number, number],
    primary: [14, 165, 233] as [number, number, number],      // sky-500
    accent: [56, 189, 248] as [number, number, number],       // sky-400
    success: [34, 197, 94] as [number, number, number],
    warning: [234, 179, 8] as [number, number, number],
    danger: [239, 68, 68] as [number, number, number],
    textPrimary: [241, 245, 249] as [number, number, number],
    textSecondary: [148, 163, 184] as [number, number, number],
    border: [51, 65, 85] as [number, number, number]
  }

  setDarkBackground(doc)

  // Header
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...colors.primary)
  doc.text("Flight Core Intelligence — Performance Report", margin, y)
  y += 28

  // Section creator with page break awareness
  const createSection = (title: string, body: string[][], columns: string[] = ["Parameter", "Value"]) => {
    // Estimate table height: header row + body rows + padding
    const estimatedHeight = 22 + body.length * 18
    if (y + estimatedHeight > pageHeight - footerHeight) {
      addDarkPage(doc)
      y = 40
    }

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...colors.accent)
    doc.text(title, margin, y)
    y += 16

    autoTable(doc, {
      head: [columns],
      body,
      startY: y,
      styles: {
        fontSize: 9,
        cellPadding: 5,
        textColor: colors.textPrimary,
        fillColor: colors.surface,
        lineColor: colors.border,
        lineWidth: 0.5,
      },
      headStyles: {
        fontSize: 10,
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [30, 41, 59],
      },
      margin: { left: margin, right: margin },
      tableWidth: 'auto',
      theme: 'grid',
    })

    y = (doc.lastAutoTable?.finalY ?? y) + 18
  }

  // Aircraft Configuration
  const aircraftInfo = [
    ["Aircraft Type", data.aircraft.name],
    ["Flaps Configuration", data.params.flaps],
    ["Thrust Rating", getThrustLabel(data.params.thrust)],
    ["Takeoff Weight", `${data.params.tow.toLocaleString()} kg`],
    ["Reference TOW", `${data.params.refTow.toLocaleString()} kg`],
    ["Weight Ratio", `${((data.params.tow / data.params.refTow) * 100).toFixed(1)}%`],
  ]
  createSection("Aircraft Configuration", aircraftInfo)

  // Environmental Conditions
  const environmentalInfo = [
    ["Pressure Altitude", `${data.params.pAlt.toLocaleString()} ft`],
    ["ISA Temperature", `${data.params.isa}°C`],
    ["Wind Component", `${data.params.wind >= 0 ? "Headwind" : "Tailwind"} ${Math.abs(data.params.wind)} kt`],
    ["Wind Direction", `${data.params.windDir || 180}°`],
    ["Runway Slope", `${data.params.slope > 0 ? "Uphill" : data.params.slope < 0 ? "Downhill" : "Level"} ${Math.abs(data.params.slope).toFixed(1)}%`],
    ["Runway Condition", capitalize(data.params.condition)],
    ["Contaminated", data.params.contaminated ? "Yes" : "No"],
    ["QNH Pressure", `${data.params.qnh || 1013} hPa`],
  ]
  createSection("Environmental Conditions", environmentalInfo)

  // Runway Infrastructure
  const runwayInfrastructureInfo = [
    ["Runway Length (TORA)", `${data.params.runwayLength || 3000} m`],
    ["Clearway (CWAY)", `${data.params.clearway || 0} m`],
    ["Runway Heading", `${data.params.runwayHeading || 180}°`],
  ]
  createSection("Runway Infrastructure", runwayInfrastructureInfo)

  // System Configuration
  const systemInfo = [
    ["Anti-ice", data.params.antiice ? "Required" : "Not Required"],
    ["Packs", data.params.packs ? "ON" : "OFF"],
    ["Reverser Credit", data.params.reverser ? "Applied" : "Not Applied"],
  ]
  createSection("System Configuration", systemInfo)

  // V-Speeds Basic
  const getVSpeedsStatusText = (status: string) => {
    switch (status) {
      case "critical": return "CRITICAL"
      case "warning": return "ADVISORY"
      default: return "NORMAL"
    }
  }

  const vspeedsInfo = [
    ["V1 - Decision Speed", `${data.vspeeds.V1} kt`],
    ["VR - Rotation Speed", `${data.vspeeds.VR} kt`],
    ["V2 - Safety Speed", `${data.vspeeds.V2} kt`],
    ["Status", getVSpeedsStatusText(data.vspeeds.status)],
    ["Limiting Factor", data.vspeeds.limitingFactor || "None"],
  ]
  createSection("V-Speeds", vspeedsInfo)

  // Performance Results
  const toraIncrease = ((data.results.toraAdjusted - data.results.toraBase) / data.results.toraBase) * 100
  const todaIncrease = ((data.results.todaAdjusted - data.results.todaBase) / data.results.todaBase) * 100

  const performanceInfo = [
    ["TORA (Base)", `${data.results.toraBase.toLocaleString()} m`],
    ["TORA (Adjusted)", `${data.results.toraAdjusted.toLocaleString()} m`],
    ["TORA Change", `${toraIncrease > 0 ? "+" : ""}${toraIncrease.toFixed(1)}%`],
    ["TODA (Base)", `${data.results.todaBase.toLocaleString()} m`],
    ["TODA (Adjusted)", `${data.results.todaAdjusted.toLocaleString()} m`],
    ["TODA Change", `${todaIncrease > 0 ? "+" : ""}${todaIncrease.toFixed(1)}%`],
  ]
  createSection("Performance Results", performanceInfo, ["Metric", "Value"])

  // V-Speeds Visual Summary
  if (y + 100 > pageHeight - footerHeight) {
    addDarkPage(doc)
    y = 40
  }

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...colors.accent)
  doc.text("V-Speeds Summary", margin, y)
  y += 16

  const vspeedsVisualData = [
    ["V1", `${data.vspeeds.V1} kt`, "Decision Speed"],
    ["VR", `${data.vspeeds.VR} kt`, "Rotation Speed"],
    ["V2", `${data.vspeeds.V2} kt`, "Safety Speed"],
  ]

  autoTable(doc, {
    head: [["Speed", "Value", "Description"]],
    body: vspeedsVisualData,
    startY: y,
    styles: {
      fontSize: 9,
      cellPadding: 5,
      textColor: colors.textPrimary,
      fillColor: colors.surface,
      lineColor: colors.border,
    },
    headStyles: {
      fontSize: 10,
      fillColor: colors.primary,
      textColor: [255, 255, 255],
    },
    columnStyles: {
      0: { fillColor: [30, 41, 59], fontStyle: 'bold', textColor: colors.primary },
      1: { fillColor: [20, 83, 45], fontStyle: 'bold', textColor: colors.success },
      2: { fillColor: [30, 41, 59] },
    },
    margin: { left: margin, right: margin },
    tableWidth: 'auto',
    theme: 'grid',
  })

  y = (doc.lastAutoTable?.finalY ?? y) + 18

  // Status Indicator
  const getVSpeedsStatusColor = (status: string) => {
    switch (status) {
      case "critical": return colors.danger
      case "warning": return colors.warning
      default: return colors.success
    }
  }

  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...getVSpeedsStatusColor(data.vspeeds.status))
  doc.text(`V-SPEEDS STATUS: ${getVSpeedsStatusText(data.vspeeds.status)}`, margin, y)

  if (data.vspeeds.limitingFactor) {
    y += 14
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...colors.warning)
    doc.text(`Limiting Factor: ${data.vspeeds.limitingFactor}`, margin, y)
  }

  // Footer on all pages
  const currentPage = doc.getNumberOfPages()
  for (let i = 1; i <= currentPage; i++) {
    doc.setPage(i)
    const footerY = pageHeight - 30
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...colors.textSecondary)
    doc.text(`Generated: ${data.timestamp}`, margin, footerY)
    doc.text(
      "Flight Core Intelligence — For planning purposes only. Verify with official performance data.",
      margin,
      footerY + 10
    )
  }

  doc.save(`FlightIntelligenceCore_Report_${new Date().toISOString().split("T")[0]}.pdf`)
}