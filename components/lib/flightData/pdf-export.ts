import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { AircraftData, CalculationParams } from "@/components/types/flightData/aircraft"

interface ExportData {
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

interface VSpeedsData {
  V1: number
  VR: number
  V2: number
  status: "normal" | "warning" | "critical"
  limitingFactor?: string
}

type AutoTableDoc = jsPDF & {
  lastAutoTable?: {
    finalY: number
  }
}

export async function exportToPDF(data: ExportData): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" }) as AutoTableDoc
  const margin = 50
  let y = margin

  // Color palette
  const colors = {
    primary: [2, 106, 167] as [number, number, number],
    secondary: [14, 165, 233] as [number, number, number],
    success: [34, 197, 94] as [number, number, number],
    warning: [234, 179, 8] as [number, number, number],
    danger: [239, 68, 68] as [number, number, number],
    dark: [30, 41, 59] as [number, number, number],
    medium: [71, 85, 105] as [number, number, number],
    light: [241, 245, 249] as [number, number, number],
    white: [255, 255, 255] as [number, number, number]
  }

  // Header with background color only
  const pageWidth = doc.internal.pageSize.getWidth()
  doc.setFillColor(...colors.primary)
  doc.rect(0, 0, pageWidth, 80, 'F')

  // Main title
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...colors.white)
  doc.text("Flight Core Intelligence — Performance Report", margin, 50)
  
  y = 100

  // Section styling function
  const createSection = (title: string, data: string[][], columns: string[] = ["Parameter", "Value"]) => {
    // Section header
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...colors.primary)
    doc.text(title, margin, y)
    y += 20

    autoTable(doc, {
      head: [columns],
      body: data,
      startY: y,
      styles: { 
        fontSize: 10, 
        cellPadding: 6, 
        textColor: colors.medium,
        lineColor: [226, 232, 240],
        lineWidth: 0.5
      },
      headStyles: { 
        fontSize: 11, 
        fillColor: colors.primary,
        textColor: colors.white,
        fontStyle: 'bold',
        lineWidth: 0.5
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: margin, right: margin },
      tableWidth: 'auto',
      theme: 'grid',
    })

    y = (doc.lastAutoTable?.finalY ?? y) + 30
  }

  // Aircraft Information Section
  const aircraftInfo = [
    ["Aircraft Type", data.aircraft.name],
    ["Flaps Configuration", data.params.flaps],
    ["Thrust Rating", getThrustLabel(data.params.thrust)],
    ["Takeoff Weight", `${data.params.tow.toLocaleString()} kg`],
    ["Reference TOW", `${data.params.refTow.toLocaleString()} kg`],
    ["Weight Ratio", `${((data.params.tow / data.params.refTow) * 100).toFixed(1)}%`],
  ]
  createSection("Aircraft Configuration", aircraftInfo)

  // Environmental Conditions - UPDATED WITH NEW PARAMETERS
  const environmentalInfo = [
    ["Pressure Altitude", `${data.params.pAlt.toLocaleString()} ft`],
    ["ISA Temperature", `${data.params.isa}°C`],
    ["Wind Component", `${data.params.wind >= 0 ? "Headwind" : "Tailwind"} ${Math.abs(data.params.wind)} kt`],
    ["Wind Direction", `${data.params.windDir || 180}°`],
    [
      "Runway Slope",
      `${data.params.slope > 0 ? "Uphill" : data.params.slope < 0 ? "Downhill" : "Level"} ${Math.abs(data.params.slope).toFixed(1)}%`,
    ],
    ["Runway Condition", capitalize(data.params.condition)],
    ["Contaminated", data.params.contaminated ? "Yes" : "No"],
    ["QNH Pressure", `${data.params.qnh || 1013} hPa`],
  ]
  createSection("Environmental Conditions", environmentalInfo)

  // NEW: Runway Infrastructure Section
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

  // V-SPEEDS SECTION
  const getVSpeedsStatusText = (status: string) => {
    switch (status) {
      case "critical": return "CRITICAL"
      case "warning": return "ADVISORY"
      default: return "NORMAL"
    }
  }

  const getVSpeedsStatusColor = (status: string) => {
    switch (status) {
      case "critical": return colors.danger
      case "warning": return colors.warning
      default: return colors.success
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

  // ADD V-SPEEDS VISUALIZATION
  y = (doc.lastAutoTable?.finalY ?? y) + 20
  
  // V-Speeds Visual Section
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...colors.primary)
  doc.text("V-Speeds Summary", margin, y)
  y += 30

  // Create a visual representation of V-speeds
  const vspeedsVisualData = [
    ["V1", `${data.vspeeds.V1} kt`, "Decision Speed - Continue/Stop"],
    ["VR", `${data.vspeeds.VR} kt`, "Rotation Speed - Nose Wheel Lift"],
    ["V2", `${data.vspeeds.V2} kt`, "Safety Speed - Takeoff Climb"],
  ]

  autoTable(doc, {
    head: [["Speed", "Value", "Description"]],
    body: vspeedsVisualData,
    startY: y,
    styles: { 
      fontSize: 10, 
      cellPadding: 8,
      textColor: colors.medium,
      lineColor: [226, 232, 240],
      lineWidth: 0.5
    },
    headStyles: { 
      fontSize: 11, 
      fillColor: colors.secondary,
      textColor: colors.white,
      fontStyle: 'bold',
      lineWidth: 0.5
    },
    columnStyles: {
      0: { fillColor: [239, 246, 255], fontStyle: 'bold', textColor: colors.primary },
      1: { fillColor: [240, 253, 244], fontStyle: 'bold', textColor: colors.success },
      2: { fillColor: [248, 250, 252] }
    },
    margin: { left: margin, right: margin },
    tableWidth: 'auto',
    theme: 'grid',
  })

  y = (doc.lastAutoTable?.finalY ?? y) + 40

  // Add status indicator
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...getVSpeedsStatusColor(data.vspeeds.status))
  doc.text(`V-SPEEDS STATUS: ${getVSpeedsStatusText(data.vspeeds.status)}`, margin, y)
  
  if (data.vspeeds.limitingFactor) {
    y += 15
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...colors.warning)
    doc.text(`Limiting Factor: ${data.vspeeds.limitingFactor}`, margin, y)
  }

  // Footer
  y += 30
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated: ${data.timestamp}`, margin, y + 20)
  doc.text("Flight Core Intelligence — For planning purposes only. Verify with official performance data.", margin, y + 30)

  // Save
  doc.save(`FlightIntelligenceCore_Report_${new Date().toISOString().split("T")[0]}.pdf`)
}

function getThrustLabel(thrust: string): string {
  switch (thrust) {
    case "full":
      return "Full / TOGA (100%)"
    case "d10":
      return "Derate 10% (TO-1 / FLEX)"
    case "d20":
      return "Derate 20% (TO-2 / Deep FLEX)"
    default:
      return thrust
  }
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}