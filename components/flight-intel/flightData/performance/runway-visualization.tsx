"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card/Standard"

interface RunwayVisualizationProps {
  tora: number
  toda: number
  availableTora: number
  availableToda: number
  condition: string
  contaminated: boolean
  slope: number
  runwayLength: number
  clearway: number
  isSafe: boolean
  warnings: string[]
}

export function RunwayVisualization({
  tora,
  toda,
  availableTora,
  availableToda,
  condition,
  contaminated,
  slope,
  runwayLength,
  clearway,
  isSafe,
}: RunwayVisualizationProps) {
  const runwaySvgRef = useRef<SVGSVGElement>(null)
  const slopeSvgRef = useRef<SVGSVGElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) {
      drawRunwayMobile(runwaySvgRef.current, tora, toda, availableTora, availableToda, contaminated, condition, isSafe)
      drawSlopeMobile(slopeSvgRef.current, runwayLength, slope)
    } else {
      drawRunway(runwaySvgRef.current, tora, toda, availableTora, availableToda, contaminated, condition, isSafe)
      drawSlope(slopeSvgRef.current, runwayLength, slope)
    }
  }, [
    tora,
    toda,
    availableTora,
    availableToda,
    contaminated,
    slope,
    condition,
    runwayLength,
    clearway,
    isSafe,
    isMobile,
  ])

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg font-medium text-white">Runway Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-xs md:text-sm text-zinc-400 mb-2">TORA/TODA Distances</div>
              <svg
                ref={runwaySvgRef}
                viewBox={isMobile ? "0 0 400 180" : "0 0 800 140"}
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-32 md:h-36 rounded-lg"
              />
            </div>

            <div>
              <div className="text-xs md:text-sm text-zinc-400 mb-2">Runway Slope Profile</div>
              <svg
                ref={slopeSvgRef}
                viewBox={isMobile ? "0 0 400 200" : "0 0 800 160"}
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-36 md:h-40 rounded-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// === Desktop Version (Dark Theme) ===
function drawRunway(
  svg: SVGSVGElement | null,
  requiredTora: number,
  requiredToda: number,
  availableTora: number,
  availableToda: number,
  isContaminated: boolean,
  condition: string,
  isSafe: boolean,
) {
  if (!svg) return

  while (svg.firstChild) svg.removeChild(svg.firstChild)

  const width = 800
  const pad = 20
  const rwY = 60
  const rwH = 24

  const maxRef = Math.max(requiredTora, requiredToda, availableTora, availableToda, 4000)
  const scale = (width - pad * 2) / maxRef

  // Draw available runway (background)
  const availableRunway = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  availableRunway.setAttribute("x", pad.toString())
  availableRunway.setAttribute("y", rwY.toString())
  availableRunway.setAttribute("width", (availableTora * scale).toString())
  availableRunway.setAttribute("height", rwH.toString())
  availableRunway.setAttribute("rx", "6")
  availableRunway.setAttribute("fill", "#27272a") // zinc-800
  availableRunway.setAttribute("stroke", "#3f3f46") // zinc-700
  availableRunway.setAttribute("stroke-width", "2")
  svg.appendChild(availableRunway)

  // Draw clearway if available
  if (availableToda > availableTora) {
    const clearwayRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    clearwayRect.setAttribute("x", (pad + availableTora * scale).toString())
    clearwayRect.setAttribute("y", rwY.toString())
    clearwayRect.setAttribute("width", ((availableToda - availableTora) * scale).toString())
    clearwayRect.setAttribute("height", rwH.toString())
    clearwayRect.setAttribute("rx", "6")
    clearwayRect.setAttribute("fill", "#3f3f46") // zinc-700
    clearwayRect.setAttribute("stroke", "#52525b") // zinc-600
    clearwayRect.setAttribute("stroke-width", "2")
    clearwayRect.setAttribute("stroke-dasharray", "5,5")
    svg.appendChild(clearwayRect)
  }

  // Draw runway markings
  for (let x = pad + 10; x < pad + availableTora * scale; x += 22) {
    const seg = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    seg.setAttribute("x", x.toString())
    seg.setAttribute("y", (rwY + rwH / 2 - 2).toString())
    seg.setAttribute("width", "12")
    seg.setAttribute("height", "4")
    seg.setAttribute("fill", "#71717a") // zinc-500
    svg.appendChild(seg)
  }

  // Draw required TORA bar
  const toraBar = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  toraBar.setAttribute("x", pad.toString())
  toraBar.setAttribute("y", (rwY - 18).toString())
  toraBar.setAttribute("width", Math.max(2, requiredTora * scale).toString())
  toraBar.setAttribute("height", "6")
  toraBar.setAttribute("fill", isSafe ? (isContaminated ? "#f97316" : "#3b82f6") : "#ef4444")
  svg.appendChild(toraBar)

  // Draw required TODA bar
  const todaBar = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  todaBar.setAttribute("x", pad.toString())
  todaBar.setAttribute("y", (rwY + rwH + 12).toString())
  todaBar.setAttribute("width", Math.max(2, requiredToda * scale).toString())
  todaBar.setAttribute("height", "6")
  todaBar.setAttribute("fill", isSafe ? (isContaminated ? "#eab308" : "#22c55e") : "#ef4444")
  svg.appendChild(todaBar)

  const createText = (text: string, x: number, y: number, fill = "#a1a1aa") => { // zinc-400
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text")
    t.setAttribute("x", x.toString())
    t.setAttribute("y", y.toString())
    t.setAttribute("fill", fill)
    t.setAttribute("font-size", "11")
    t.setAttribute("font-family", "system-ui, sans-serif")
    t.textContent = text
    return t
  }

  svg.appendChild(createText(`Required TORA: ${requiredTora} m`, pad, rwY - 24))
  svg.appendChild(createText(`Available TORA: ${availableTora} m`, pad + 200, rwY - 24))
  svg.appendChild(createText(`Required TODA: ${requiredToda} m`, pad, rwY + rwH + 30))
  svg.appendChild(createText(`Available TODA: ${availableToda} m`, pad + 200, rwY + rwH + 30))

  // Add safety status
  const statusText = isSafe ? "✓ SAFE" : "✗ UNSAFE"
  const statusColor = isSafe ? "#22c55e" : "#ef4444"
  const statusElement = document.createElementNS("http://www.w3.org/2000/svg", "text")
  statusElement.setAttribute("x", (pad + 400).toString())
  statusElement.setAttribute("y", (rwY - 24).toString())
  statusElement.setAttribute("fill", statusColor)
  statusElement.setAttribute("font-size", "12")
  statusElement.setAttribute("font-family", "system-ui, sans-serif")
  statusElement.setAttribute("font-weight", "bold")
  statusElement.textContent = statusText
  svg.appendChild(statusElement)
}

function drawSlope(svg: SVGSVGElement | null, runwayMeters: number, slopePercent: number) {
  if (!svg) return

  while (svg.firstChild) svg.removeChild(svg.firstChild)

  const width = 800
  const height = 160
  const pad = 36
  const midY = height / 2
  const rwWidth = width - pad * 2
  const rwHeight = 18

  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  bg.setAttribute("x", "0")
  bg.setAttribute("y", "0")
  bg.setAttribute("width", width.toString())
  bg.setAttribute("height", height.toString())
  bg.setAttribute("fill", "transparent")
  svg.appendChild(bg)

  // Base runway rectangle (dark)
  const base = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  base.setAttribute("x", pad.toString())
  base.setAttribute("y", (midY - rwHeight / 2).toString())
  base.setAttribute("width", rwWidth.toString())
  base.setAttribute("height", rwHeight.toString())
  base.setAttribute("rx", "5")
  base.setAttribute("fill", "#18181b") // zinc-900
  base.setAttribute("stroke", "#3f3f46") // zinc-700
  svg.appendChild(base)

  const pxPerPercent = 8
  let dy = slopePercent * pxPerPercent
  if (dy > 72) dy = 72
  if (dy < -72) dy = -72

  const x1 = pad
  const y1 = midY + (dy < 0 ? -dy / 2 : dy / 2) * -1
  const x2 = pad + rwWidth
  const y2 = midY + (dy > 0 ? dy / 2 : dy / 2)

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
  line.setAttribute("x1", x1.toString())
  line.setAttribute("y1", y1.toString())
  line.setAttribute("x2", x2.toString())
  line.setAttribute("y2", y2.toString())
  const col = slopePercent > 0 ? "#22c55e" : slopePercent < 0 ? "#ef4444" : "#a1a1aa"
  line.setAttribute("stroke", col)
  line.setAttribute("stroke-width", "5")
  line.setAttribute("stroke-linecap", "round")
  svg.appendChild(line)

  const marker1 = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  marker1.setAttribute("cx", x1.toString())
  marker1.setAttribute("cy", y1.toString())
  marker1.setAttribute("r", "4")
  marker1.setAttribute("fill", col)
  svg.appendChild(marker1)

  const marker2 = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  marker2.setAttribute("cx", x2.toString())
  marker2.setAttribute("cy", y2.toString())
  marker2.setAttribute("r", "4")
  marker2.setAttribute("fill", col)
  svg.appendChild(marker2)

  const createText = (text: string, x: number, y: number, fontSize = 12, fill = "#a1a1aa") => {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text")
    t.setAttribute("x", x.toString())
    t.setAttribute("y", y.toString())
    t.setAttribute("fill", fill)
    t.setAttribute("font-size", fontSize.toString())
    t.setAttribute("font-family", "system-ui, sans-serif")
    t.textContent = text
    return t
  }

  const gradText = slopePercent !== 0 ? `1:${Math.round(100 / Math.abs(slopePercent))}` : "1:∞"
  svg.appendChild(createText(`Slope: ${slopePercent.toFixed(2)}% • Gradient: ${gradText}`, pad, 28, 14, "#d4d4d8")) // zinc-300
  svg.appendChild(createText(`Reference length: ${Math.round(runwayMeters).toLocaleString()} m`, pad, height - 12, 12))
}

// === Mobile Optimized Version (Dark Theme) ===
function drawRunwayMobile(
  svg: SVGSVGElement | null,
  requiredTora: number,
  requiredToda: number,
  availableTora: number,
  availableToda: number,
  isContaminated: boolean,
  condition: string,
  isSafe: boolean,
) {
  if (!svg) return

  while (svg.firstChild) svg.removeChild(svg.firstChild)

  const width = 400
  const pad = 12
  const rwY = 80
  const rwH = 20

  const maxRef = Math.max(requiredTora, requiredToda, availableTora, availableToda, 4000)
  const scale = (width - pad * 2) / maxRef

  // Draw available runway (background)
  const availableRunway = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  availableRunway.setAttribute("x", pad.toString())
  availableRunway.setAttribute("y", rwY.toString())
  availableRunway.setAttribute("width", (availableTora * scale).toString())
  availableRunway.setAttribute("height", rwH.toString())
  availableRunway.setAttribute("rx", "4")
  availableRunway.setAttribute("fill", "#27272a") // zinc-800
  availableRunway.setAttribute("stroke", "#3f3f46") // zinc-700
  availableRunway.setAttribute("stroke-width", "1.5")
  svg.appendChild(availableRunway)

  // Draw clearway if available
  if (availableToda > availableTora) {
    const clearwayRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    clearwayRect.setAttribute("x", (pad + availableTora * scale).toString())
    clearwayRect.setAttribute("y", rwY.toString())
    clearwayRect.setAttribute("width", ((availableToda - availableTora) * scale).toString())
    clearwayRect.setAttribute("height", rwH.toString())
    clearwayRect.setAttribute("rx", "4")
    clearwayRect.setAttribute("fill", "#3f3f46") // zinc-700
    clearwayRect.setAttribute("stroke", "#52525b") // zinc-600
    clearwayRect.setAttribute("stroke-width", "1.5")
    clearwayRect.setAttribute("stroke-dasharray", "3,3")
    svg.appendChild(clearwayRect)
  }

  // Draw runway markings (fewer on mobile)
  for (let x = pad + 10; x < pad + availableTora * scale; x += 30) {
    const seg = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    seg.setAttribute("x", x.toString())
    seg.setAttribute("y", (rwY + rwH / 2 - 1.5).toString())
    seg.setAttribute("width", "8")
    seg.setAttribute("height", "3")
    seg.setAttribute("fill", "#71717a") // zinc-500
    svg.appendChild(seg)
  }

  // Draw required TORA bar
  const toraBar = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  toraBar.setAttribute("x", pad.toString())
  toraBar.setAttribute("y", (rwY - 20).toString())
  toraBar.setAttribute("width", Math.max(2, requiredTora * scale).toString())
  toraBar.setAttribute("height", "5")
  toraBar.setAttribute("fill", isSafe ? (isContaminated ? "#f97316" : "#3b82f6") : "#ef4444")
  svg.appendChild(toraBar)

  // Draw required TODA bar
  const todaBar = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  todaBar.setAttribute("x", pad.toString())
  todaBar.setAttribute("y", (rwY + rwH + 10).toString())
  todaBar.setAttribute("width", Math.max(2, requiredToda * scale).toString())
  todaBar.setAttribute("height", "5")
  todaBar.setAttribute("fill", isSafe ? (isContaminated ? "#eab308" : "#22c55e") : "#ef4444")
  svg.appendChild(todaBar)

  const createText = (text: string, x: number, y: number, fontSize = 9, fill = "#a1a1aa") => {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text")
    t.setAttribute("x", x.toString())
    t.setAttribute("y", y.toString())
    t.setAttribute("fill", fill)
    t.setAttribute("font-size", fontSize.toString())
    t.setAttribute("font-family", "system-ui, sans-serif")
    t.textContent = text
    return t
  }

  svg.appendChild(createText(`TORA: ${requiredTora}m / ${availableTora}m`, pad, rwY - 26, 9))
  svg.appendChild(createText(`TODA: ${requiredToda}m / ${availableToda}m`, pad, rwY + rwH + 24, 9))

  // Add safety status
  const statusText = isSafe ? "✓ SAFE" : "✗ UNSAFE"
  const statusColor = isSafe ? "#22c55e" : "#ef4444"
  const statusElement = document.createElementNS("http://www.w3.org/2000/svg", "text")
  statusElement.setAttribute("x", (width - pad - 50).toString())
  statusElement.setAttribute("y", (rwY - 26).toString())
  statusElement.setAttribute("fill", statusColor)
  statusElement.setAttribute("font-size", "11")
  statusElement.setAttribute("font-family", "system-ui, sans-serif")
  statusElement.setAttribute("font-weight", "bold")
  statusElement.textContent = statusText
  svg.appendChild(statusElement)
}

function drawSlopeMobile(svg: SVGSVGElement | null, runwayMeters: number, slopePercent: number) {
  if (!svg) return

  while (svg.firstChild) svg.removeChild(svg.firstChild)

  const width = 400
  const height = 200
  const pad = 24
  const midY = height / 2
  const rwWidth = width - pad * 2
  const rwHeight = 14

  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  bg.setAttribute("x", "0")
  bg.setAttribute("y", "0")
  bg.setAttribute("width", width.toString())
  bg.setAttribute("height", height.toString())
  bg.setAttribute("fill", "transparent")
  svg.appendChild(bg)

  const base = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  base.setAttribute("x", pad.toString())
  base.setAttribute("y", (midY - rwHeight / 2).toString())
  base.setAttribute("width", rwWidth.toString())
  base.setAttribute("height", rwHeight.toString())
  base.setAttribute("rx", "3")
  base.setAttribute("fill", "#18181b") // zinc-900
  base.setAttribute("stroke", "#3f3f46") // zinc-700
  base.setAttribute("stroke-width", "1")
  svg.appendChild(base)

  const pxPerPercent = 6
  let dy = slopePercent * pxPerPercent
  if (dy > 50) dy = 50
  if (dy < -50) dy = -50

  const x1 = pad
  const y1 = midY + (dy < 0 ? -dy / 2 : dy / 2) * -1
  const x2 = pad + rwWidth
  const y2 = midY + (dy > 0 ? dy / 2 : dy / 2)

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
  line.setAttribute("x1", x1.toString())
  line.setAttribute("y1", y1.toString())
  line.setAttribute("x2", x2.toString())
  line.setAttribute("y2", y2.toString())
  const col = slopePercent > 0 ? "#22c55e" : slopePercent < 0 ? "#ef4444" : "#a1a1aa"
  line.setAttribute("stroke", col)
  line.setAttribute("stroke-width", "4")
  line.setAttribute("stroke-linecap", "round")
  svg.appendChild(line)

  const marker1 = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  marker1.setAttribute("cx", x1.toString())
  marker1.setAttribute("cy", y1.toString())
  marker1.setAttribute("r", "3")
  marker1.setAttribute("fill", col)
  svg.appendChild(marker1)

  const marker2 = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  marker2.setAttribute("cx", x2.toString())
  marker2.setAttribute("cy", y2.toString())
  marker2.setAttribute("r", "3")
  marker2.setAttribute("fill", col)
  svg.appendChild(marker2)

  const createText = (text: string, x: number, y: number, fontSize = 10, fill = "#a1a1aa") => {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text")
    t.setAttribute("x", x.toString())
    t.setAttribute("y", y.toString())
    t.setAttribute("fill", fill)
    t.setAttribute("font-size", fontSize.toString())
    t.setAttribute("font-family", "system-ui, sans-serif")
    t.textContent = text
    return t
  }

  const gradText = slopePercent !== 0 ? `1:${Math.round(100 / Math.abs(slopePercent))}` : "1:∞"
  svg.appendChild(createText(`Slope: ${slopePercent.toFixed(2)}%`, pad, 20, 10, "#d4d4d8"))
  svg.appendChild(createText(`Gradient: ${gradText}`, pad, 34, 10, "#d4d4d8"))
  svg.appendChild(createText(`Length: ${Math.round(runwayMeters).toLocaleString()} m`, pad, height - 8, 9))
}