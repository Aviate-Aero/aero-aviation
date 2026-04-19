"use client"

import { Shield } from "lucide-react"
import { motion } from "framer-motion"
import { Textarea } from "@/components/textArea/Standard"
import { Label } from "@/components/label/Standard"
import { Checkbox } from "@/components/ui/checkBox/Standard"

interface RiskAssessmentCardProps {
  riskNotes: string
  onRiskNotesChange: (value: string) => void
  checklist: {
    weatherWithinLimits: boolean
    crewWithinDutyTime: boolean
    aircraftServiceable: boolean
    documentationAvailable: boolean
    riskMitigationInPlace: boolean
  }
  onChecklistChange: (checklist: RiskAssessmentCardProps["checklist"]) => void
}

export function RiskAssessmentCard({
  riskNotes,
  onRiskNotesChange,
  checklist,
  onChecklistChange,
}: RiskAssessmentCardProps) {
  const handleCheckboxChange = (key: keyof typeof checklist, checked: boolean) => {
    onChecklistChange({
      ...checklist,
      [key]: checked,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center border border-sky-500/30">
          <Shield className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-white">Risk Assessment</h2>
          <p className="text-zinc-400 text-sm">Go/No‑Go checklist and mitigation notes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column – Checklist */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-white">Go/No‑Go Checklist</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="checklist-1"
                checked={checklist.weatherWithinLimits}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("weatherWithinLimits", checked as boolean)
                }
              />
              <Label
                htmlFor="checklist-1"
                className="text-sm text-zinc-300 cursor-pointer"
              >
                Weather conditions within operational limits
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="checklist-2"
                checked={checklist.crewWithinDutyTime}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("crewWithinDutyTime", checked as boolean)
                }
              />
              <Label
                htmlFor="checklist-2"
                className="text-sm text-zinc-300 cursor-pointer"
              >
                Crew within duty time limits
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="checklist-3"
                checked={checklist.aircraftServiceable}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("aircraftServiceable", checked as boolean)
                }
              />
              <Label
                htmlFor="checklist-3"
                className="text-sm text-zinc-300 cursor-pointer"
              >
                Aircraft serviceable and properly equipped
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="checklist-4"
                checked={checklist.documentationAvailable}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("documentationAvailable", checked as boolean)
                }
              />
              <Label
                htmlFor="checklist-4"
                className="text-sm text-zinc-300 cursor-pointer"
              >
                All required documentation available
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="checklist-5"
                checked={checklist.riskMitigationInPlace}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("riskMitigationInPlace", checked as boolean)
                }
              />
              <Label
                htmlFor="checklist-5"
                className="text-sm text-zinc-300 cursor-pointer"
              >
                Risk mitigation measures in place
              </Label>
            </div>
          </div>
        </div>

        {/* Right Column – Notes */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-white">Additional Notes</h3>
          <div className="space-y-2">
            <Label htmlFor="risk-notes" className="text-sm font-medium text-zinc-300">
              Risk Mitigation Notes
            </Label>
            <Textarea
              id="risk-notes"
              value={riskNotes}
              onChange={(e) => onRiskNotesChange(e.target.value)}
              placeholder="Document risk mitigation strategies, crew briefing items, operational constraints..."
              className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-sky-500/20 min-h-[120px] resize-none"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}