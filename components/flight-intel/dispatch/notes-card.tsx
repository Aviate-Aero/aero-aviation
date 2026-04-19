"use client"

import { StickyNote, Copy } from "lucide-react"
import { motion } from "framer-motion"
import { Textarea } from "@/components/textArea/Standard"
import { Label } from "@/components/label/Standard"
import { Button } from "@/components/buttons/Standard"
import { copyToClipboard } from "@/components/lib/pdf-export/dispatch/audit-utils"

interface NotesCardProps {
  notesDep: string
  notesArr: string
  onNotesDepChange: (value: string) => void
  onNotesArrChange: (value: string) => void
  onStatusUpdate: (status: string) => void
}

export function NotesCard({
  notesDep,
  notesArr,
  onNotesDepChange,
  onNotesArrChange,
  onStatusUpdate,
}: NotesCardProps) {
  const handleCopyNotes = async () => {
    const combinedNotes = `DEPARTURE NOTES:\n${notesDep || "None"}\n\nARRIVAL NOTES:\n${notesArr || "None"}`
    const success = await copyToClipboard(combinedNotes)
    onStatusUpdate(success ? "Notes copied to clipboard" : "Copy failed")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center border border-sky-500/30">
            <StickyNote className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">Operational Notes</h2>
            <p className="text-zinc-400 text-sm">Departure and arrival documentation</p>
          </div>
        </div>
        <Button
          onClick={handleCopyNotes}
          variant="outline"
          size="sm"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy All
        </Button>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departure Notes */}
        <div className="space-y-3">
          <Label htmlFor="notes-dep" className="text-sm font-medium text-zinc-300">
            Departure Notes
          </Label>
          <Textarea
            id="notes-dep"
            value={notesDep}
            onChange={(e) => onNotesDepChange(e.target.value)}
            placeholder="PDC, ATIS, taxi instructions, stand assignments, SIDs, special procedures..."
            className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-sky-500/20 min-h-[120px] resize-y"
          />
          <p className="text-xs text-zinc-500">
            Document departure-specific information: clearances, taxi routes, stand assignments, etc.
          </p>
        </div>

        {/* Arrival Notes */}
        <div className="space-y-3">
          <Label htmlFor="notes-arr" className="text-sm font-medium text-zinc-300">
            Arrival Notes
          </Label>
          <Textarea
            id="notes-arr"
            value={notesArr}
            onChange={(e) => onNotesArrChange(e.target.value)}
            placeholder="STARs, expected runway, gate assignments, ground handling, customs..."
            className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-sky-500/20 min-h-[120px] resize-y"
          />
          <p className="text-xs text-zinc-500">
            Document arrival-specific information: STARs, expected runway, gate assignments, etc.
          </p>
        </div>
      </div>
    </motion.div>
  )
}