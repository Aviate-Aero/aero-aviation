"use client"

import React, { useState, useRef } from "react"
import { Bot, Loader2, Send, X, RotateCcw, LayoutDashboard, FileDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import jsPDF from "jspdf"
import { Button } from "@/components/buttons/Standard"
import { generateRichReportHTML } from "@/components/lib/flight-report/rich-report-generator"
import type { RichReportData } from "@/components/lib/flight-report/rich-report-generator"

// Safely renders inline **bold** text without dangerouslySetInnerHTML
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-white">
        {part}
      </strong>
    ) : (
      part
    )
  )
}

function renderReport(text: string, isGenerating: boolean) {
  const firstHeading = text.indexOf("\n##")
  const clean = !isGenerating && firstHeading > 0 ? text.slice(firstHeading + 1) : text
  const lines = clean.split("\n")
  const elements: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed.startsWith("## ")) {
      elements.push(
        <div key={i} className="mt-6 mb-3 -mx-6 px-6 py-3 bg-sky-500/20 border-l-4 border-sky-500">
          <h2 className="text-base font-medium text-white tracking-wide">
            {trimmed.replace(/^## /, "")}
          </h2>
        </div>
      )
    } else if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="mt-5 mb-2 text-sm font-medium text-sky-400 border-b border-zinc-800 pb-1">
          {trimmed.replace(/^### /, "")}
        </h3>
      )
    } else if (trimmed === "---") {
      elements.push(<hr key={i} className="my-4 border-zinc-800" />)
    } else if (trimmed === "") {
      elements.push(<div key={i} className="h-2" />)
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      const content = trimmed.replace(/^[-•]\s/, "")
      elements.push(
        <div key={i} className="flex gap-2 text-sm text-zinc-300 leading-relaxed">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
          <span>{renderInline(content)}</span>
        </div>
      )
    } else {
      elements.push(
        <p key={i} className="text-sm text-zinc-300 leading-relaxed">
          {renderInline(trimmed)}
        </p>
      )
    }
  }

  if (isGenerating) {
    elements.push(
      <span
        key="cursor"
        className="inline-block h-4 w-0.5 animate-pulse bg-sky-500 ml-0.5 align-middle"
      />
    )
  }

  return elements
}

const SUGGESTED_PROMPTS = [
  "Generate a report on major aviation incidents and accidents worldwide in the past 7 days",
  "What are the current airspace restrictions and NOTAMs affecting European airspace?",
  "Provide an overview of recent airline operational disruptions and delays globally",
  "Summarize current weather advisories and SIGMETs affecting major transatlantic routes",
]

export default function AviationReportPage() {
  const [prompt, setPrompt] = useState("")
  const [report, setReport] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingRich, setIsGeneratingRich] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const richDataCache = useRef<RichReportData | null>(null)
  const richDataForPrompt = useRef<string>("")

  const fetchStructuredData = async (): Promise<RichReportData> => {
    if (richDataCache.current && richDataForPrompt.current === report) {
      return richDataCache.current
    }
    const res = await fetch("/api/aviation-report/structured", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportText: report, prompt }),
    })
    const raw = await res.text()
    let data: RichReportData
    try {
      data = JSON.parse(raw)
    } catch {
      throw new Error(raw.slice(0, 200) || `Structured request failed (${res.status})`)
    }
    if (!res.ok)
      throw new Error(
        (data as unknown as { error: string }).error || `Request failed (${res.status})`
      )
    richDataCache.current = data
    richDataForPrompt.current = report
    return data
  }

  const generateRichReport = async () => {
    if (!report || isGeneratingRich) return
    setIsGeneratingRich(true)
    try {
      const data = await fetchStructuredData()
      const html = generateRichReportHTML(data, { autoPrint: false })
      const blob = new Blob([html], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `aviate-pro-intel-report-${Date.now()}.html`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rich report generation failed")
    } finally {
      setIsGeneratingRich(false)
    }
  }

  const downloadPDF = () => {
    if (!report) return

    const doc = new jsPDF({ format: "a4" })
    const PW = doc.internal.pageSize.getWidth()
    const PH = doc.internal.pageSize.getHeight()
    const M = 18 // margin
    const CW = PW - M * 2
    const DARK: [number, number, number] = [10, 18, 42]
    const NAVY: [number, number, number] = [15, 32, 70]
    const BLUE: [number, number, number] = [37, 99, 235]
    const WHITE: [number, number, number] = [255, 255, 255]
    const MUTED: [number, number, number] = [148, 163, 184]
    const BODY_TEXT: [number, number, number] = [178, 196, 224]
    const HEADING_BG: [number, number, number] = [20, 40, 88]

    const darkBg = () => {
      doc.setFillColor(...DARK)
      doc.rect(-1, -1, PW + 2, PH + 2, "F")
    }
    darkBg()

    // header band
    doc.setFillColor(...NAVY)
    doc.rect(0, 0, PW, 46, "F")
    doc.setFillColor(...BLUE)
    doc.rect(0, 46, PW, 2.5, "F")

    doc.setFont("helvetica", "bold")
    doc.setFontSize(15)
    doc.setTextColor(...WHITE)
    doc.text("Flight Core Intelligence", M, 16)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text("aviatepro.me  ·  info@aviatepro.me", M, 24)

    const ts = `Generated: ${new Date().toUTCString()}`
    doc.setFontSize(7.5)
    doc.text(ts, PW - M - doc.getTextWidth(ts), 24)

    const rid = `REPORT AP-${Date.now().toString().slice(-8)}`
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7.5)
    doc.setTextColor(...BLUE.map((v) => Math.min(255, v + 80)) as [number, number, number])
    doc.text(rid, M, 34)

    let y = 58
    doc.setFillColor(...HEADING_BG)
    doc.roundedRect(M, y - 4, CW, 15, 2, 2, "F")
    doc.setDrawColor(...BLUE)
    doc.setLineWidth(0.4)
    doc.roundedRect(M, y - 4, CW, 15, 2, 2, "S")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7.5)
    doc.setTextColor(...MUTED)
    doc.text("QUERY:", M + 4, y + 4.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...BODY_TEXT)
    const qLines = doc.splitTextToSize(prompt, CW - 34)
    doc.text(qLines, M + 26, y + 4.5)
    y += Math.max(15, qLines.length * 4.5) + 10

    const space = (needed: number) => {
      if (y + needed > PH - 16) {
        doc.addPage()
        darkBg()
        y = 16
      }
    }

    const firstHeading = report.indexOf("\n##")
    const cleanReport = firstHeading > 0 ? report.slice(firstHeading + 1) : report

    for (const line of cleanReport.split("\n")) {
      const t = line.trim()

      if (t.startsWith("## ")) {
        space(14)
        y += 5
        doc.setFillColor(...HEADING_BG)
        doc.rect(M, y - 4, CW, 12, "F")
        doc.setFillColor(...BLUE)
        doc.rect(M, y - 4, 3.5, 12, "F")
        doc.setFont("helvetica", "bold")
        doc.setFontSize(11)
        doc.setTextColor(...WHITE)
        const h2 = doc.splitTextToSize(t.replace(/^## /, ""), CW - 12)
        doc.text(h2, M + 7, y + 4)
        y += h2.length * 7 + 6
      } else if (t.startsWith("### ")) {
        space(10)
        y += 3
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.setTextColor(147, 197, 253)
        const h3 = doc.splitTextToSize(t.replace(/^### /, ""), CW)
        doc.text(h3, M, y)
        doc.setDrawColor(...BLUE)
        doc.setLineWidth(0.25)
        doc.line(M, y + 2, M + CW, y + 2)
        y += h3.length * 6 + 4
      } else if (t.startsWith("**") && t.endsWith("**") && t.length > 4) {
        space(7)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9.5)
        doc.setTextColor(...BODY_TEXT)
        const b = doc.splitTextToSize(t.replace(/\*\*/g, ""), CW)
        doc.text(b, M, y)
        y += b.length * 5.2 + 1
      } else if (t === "---") {
        space(6)
        doc.setDrawColor(30, 58, 110)
        doc.setLineWidth(0.3)
        doc.line(M, y, M + CW, y)
        y += 6
      } else if (t === "") {
        y += 3.5
      } else {
        const isBullet = t.startsWith("- ") || t.startsWith("• ")
        const clean = t.replace(/\*\*(.*?)\*\*/g, "$1").replace(/^[-•]\s/, "")
        const xOff = isBullet ? M + 8 : M
        const tWidth = isBullet ? CW - 8 : CW

        doc.setFont("helvetica", "normal")
        doc.setFontSize(9.5)
        const wrapped = doc.splitTextToSize(clean, tWidth)
        space(wrapped.length * 5.2)

        if (isBullet) {
          doc.setFillColor(...BLUE)
          doc.circle(M + 3, y - 1, 1, "F")
        }
        doc.setTextColor(...BODY_TEXT)
        doc.text(wrapped, xOff, y)
        y += wrapped.length * 5.2 + 1.5
      }
    }

    const total = doc.getNumberOfPages()
    for (let i = 1; i <= total; i++) {
      doc.setPage(i)
      doc.setFillColor(...NAVY)
      doc.rect(0, PH - 12, PW, 12, "F")
      doc.setFillColor(...BLUE)
      doc.rect(0, PH - 12, PW, 1, "F")
      doc.setFont("helvetica", "normal")
      doc.setFontSize(7)
      doc.setTextColor(...MUTED)
      doc.text("Flight Core Intelligence  ·  Aviate Pro ME LLC  ·  aviatepro.me", M, PH - 4.5)
      const pg = `Page ${i} of ${total}`
      doc.text(pg, PW - M - doc.getTextWidth(pg), PH - 4.5)
    }

    doc.save(`flight-intel-report-${Date.now()}.pdf`)
  }

  const generateReport = async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    setReport("")
    setError(null)
    richDataCache.current = null
    richDataForPrompt.current = ""

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch("/api/aviation-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const raw = await res.text()
        let msg = `Request failed (${res.status})`
        try {
          msg = JSON.parse(raw)?.error || msg
        } catch {
          msg = raw.slice(0, 200) || msg
        }
        throw new Error(msg)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const data = line.slice(6)
          if (data === "[DONE]") break

          try {
            const parsed = JSON.parse(data)
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.text) setReport((prev) => prev + parsed.text)
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Report generation failed")
      }
    } finally {
      setIsGenerating(false)
      abortRef.current = null
    }
  }

  const stopGeneration = () => {
    abortRef.current?.abort()
  }

  const resetReport = () => {
    setReport("")
    setError(null)
    setPrompt("")
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8 mt-40">
        <div className="space-y-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center border border-sky-500/30">
                  <Bot className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-light text-white">Aviation Intelligence</h1>
                  <p className="text-zinc-400">AI-powered reports with real-time web search</p>
                </div>
              </div>
              {report && (
                <Button
                  onClick={resetReport}
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Report
                </Button>
              )}
            </div>
          </motion.div>

          {/* Suggested Prompts */}
          <AnimatePresence>
            {!report && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              >
                <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <span className="inline-block h-1 w-4 rounded-full bg-sky-500" />
                  Suggested Queries
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {SUGGESTED_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(p)}
                      className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-4 text-left text-sm text-zinc-300 transition-all hover:border-sky-500/50 hover:bg-zinc-800 hover:text-white"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Report Output */}
          <AnimatePresence>
            {(report || isGenerating) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 -mx-6 -mt-6 px-6 py-4 border-b border-zinc-800 bg-zinc-800/30 rounded-t-2xl">
                  <h2 className="text-sm font-medium text-white flex items-center gap-2">
                    <span className="inline-block h-1 w-4 rounded-full bg-sky-500" />
                    Generated Report
                  </h2>
                  {report && !isGenerating && (
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="flex flex-col items-center gap-0.5">
                        <Button
                          onClick={generateRichReport}
                          disabled={isGeneratingRich}
                          className="bg-zinc-700 hover:bg-zinc-600 text-white flex items-center gap-2 transition-colors duration-200 disabled:opacity-50 text-xs sm:text-sm"
                        >
                          {isGeneratingRich ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <LayoutDashboard className="h-4 w-4" />
                          )}
                          {isGeneratingRich ? "Building…" : "Rich Report"}
                        </Button>
                        <span className="text-[12px] text-zinc-500">
                          Charts, tables & analytics
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Button
                          onClick={downloadPDF}
                          disabled={isGeneratingRich}
                          className="bg-sky-500 hover:bg-sky-600 text-white flex items-center gap-2 transition-colors duration-200 disabled:opacity-50 text-xs sm:text-sm"
                        >
                          <FileDown className="h-4 w-4" />
                          Download PDF
                        </Button>
                        <span className="text-[12px] text-zinc-500">
                          Simple text, instant
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {isGenerating && !report && (
                  <div className="flex items-center gap-3 text-sky-400 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-zinc-400">
                      Searching aviation databases and compiling report…
                    </span>
                  </div>
                )}

                <div className="space-y-1">{renderReport(report, isGenerating)}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-5 py-4">
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}

          {/* Input */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <span className="inline-block h-1 w-4 rounded-full bg-sky-500" />
              Enter Your Query
            </h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generateReport()
              }}
              placeholder="Describe the aviation report you need… e.g. 'Generate a report on airspace closures in the Middle East over the past 48 hours'"
              className="w-full resize-none rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 min-h-[90px]"
              disabled={isGenerating}
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-zinc-500">Ctrl + Enter to generate</span>
              <div className="flex items-center gap-2">
                {isGenerating ? (
                  <Button
                    onClick={stopGeneration}
                    className="bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                    Stop
                  </Button>
                ) : (
                  <Button
                    onClick={generateReport}
                    disabled={!prompt.trim()}
                    className="group bg-sky-500 hover:bg-sky-600 text-white rounded-full px-6 py-3 transition-all duration-[650ms] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}