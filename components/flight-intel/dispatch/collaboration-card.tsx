"use client"

import { Share2, FileCheck, Copy } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/buttons/Standard"
import { Textarea } from "@/components/textArea/Standard"
import { Label } from "@/components/label/Standard"
import { generateAuditStamp, generateDeepLink, copyToClipboard } from "@/components/lib/pdf-export/dispatch/audit-utils"

import { useState, useEffect } from "react"

interface CollaborationCardProps {
  metarDep: string
  metarArr: string
  notam: string
  provDep: string
  provArr: string
  dep: string
  arr: string
  onStatusUpdate: (status: string) => void
  onCollaborationUpdate?: (data: { deepLink?: string; auditReport?: string }) => void
}

export function CollaborationCard({
  metarDep,
  metarArr,
  notam,
  dep,
  arr,
  onStatusUpdate,
  onCollaborationUpdate,
}: CollaborationCardProps) {
  const [auditReport, setAuditReport] = useState<string>("")
  const [deepLink, setDeepLink] = useState<string>("")

  useEffect(() => {
    if (onCollaborationUpdate) {
      onCollaborationUpdate({
        deepLink,
        auditReport,
      })
    }
  }, [deepLink, auditReport, onCollaborationUpdate])

  const handleGenerateAudit = async () => {
    try {
      const audit = await generateAuditStamp(metarDep, metarArr, notam)
      setAuditReport(audit.fullReport)
      onStatusUpdate("Audit stamp generated")
    } catch {
      onStatusUpdate("Audit generation failed")
    }
  }

  const handleGenerateDeepLink = () => {
    try {
      const link = generateDeepLink({ dep, arr })
      setDeepLink(link)
      onStatusUpdate("Deep link generated")
    } catch {
      onStatusUpdate("Deep link generation failed")
    }
  }

  const handleCopyAudit = async () => {
    const success = await copyToClipboard(auditReport)
    onStatusUpdate(success ? "Audit copied to clipboard" : "Copy failed")
  }

  const handleCopyDeepLink = async () => {
    const success = await copyToClipboard(deepLink)
    onStatusUpdate(success ? "Deep link copied to clipboard" : "Copy failed")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center border border-sky-500/30">
          <Share2 className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-white">Collaboration & Audit</h2>
          <p className="text-zinc-400 text-sm">Share configuration and generate audit trails</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Deep Link Generation */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-md font-medium text-white">Share Configuration</h3>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                onClick={handleGenerateDeepLink}
                className="group bg-sky-500 hover:bg-sky-600 text-white rounded-full px-4 py-2 transition-all duration-[650ms] hover:scale-[1.02] flex-1 sm:flex-none"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Generate Link
              </Button>
              <Button
                onClick={handleCopyDeepLink}
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white flex-1 sm:flex-none"
                disabled={!deepLink}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-zinc-300">Shareable URL</Label>
            <Textarea
              value={deepLink}
              readOnly
              placeholder="Click 'Generate Link' to create a shareable URL with current configuration"
              className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-sky-500/20 min-h-[80px] resize-none font-mono text-xs"
            />
          </div>

          <p className="text-xs text-zinc-500">
            Share this link with colleagues to replicate your current dispatch configuration.
          </p>
        </div>

        {/* Audit Trail */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-md font-medium text-white">Audit Trail</h3>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                onClick={handleGenerateAudit}
                className="group bg-sky-500 hover:bg-sky-600 text-white rounded-full px-4 py-2 transition-all duration-[650ms] hover:scale-[1.02] flex-1 sm:flex-none"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Generate Stamp
              </Button>
              <Button
                onClick={handleCopyAudit}
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white flex-1 sm:flex-none"
                disabled={!auditReport}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-zinc-300">Audit Report</Label>
            <Textarea
              value={auditReport}
              readOnly
              placeholder="Click 'Generate Stamp' to create an audit trail with data integrity verification"
              className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-sky-500/20 min-h-[120px] resize-none font-mono text-xs"
            />
          </div>

          <p className="text-xs text-zinc-500">
            Audit stamps provide cryptographic verification of weather data integrity and timestamp for regulatory compliance.
          </p>
        </div>
      </div>
    </motion.div>
  )
}