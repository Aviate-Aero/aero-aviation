"use client"

import { useState } from "react"
import { Button } from "@/components/buttons/Standard"
import { Textarea } from "@/components/textArea/Standard"
import { Label } from "@/components/label/Standard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card/Standard"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible/Standard"
import { ChevronDown, Upload } from "lucide-react"
import { useToast } from "@/components/hooks/use-toast"
import type { AircraftData } from "@/components/types/flightData/aircraft"

interface DataImportProps {
  onDataImport: (data: AircraftData[]) => void
}

export function DataImport({ onDataImport }: DataImportProps) {
  const [jsonImport, setJsonImport] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleImport = () => {
    if (!jsonImport.trim()) {
      toast({
        title: "No data provided",
        description: "Please enter JSON data to import.",
        variant: "destructive",
      })
      return
    }

    try {
      // Type JSON.parse output as unknown first
      const data: unknown = JSON.parse(jsonImport)

      if (!Array.isArray(data)) {
        throw new Error("JSON must be an array of aircraft objects")
      }

      // Validate data structure (narrow to AircraftData)
      const validData: AircraftData[] = data.filter((item): item is AircraftData => {
        return (
          typeof item === "object" &&
          item !== null &&
          "key" in item &&
          "name" in item &&
          "seats" in item &&
          typeof (item as AircraftData).seats === "number"
        )
      })

      if (validData.length === 0) {
        throw new Error("No valid aircraft data found")
      }

      onDataImport(validData)
      setJsonImport("")
      setIsOpen(false)

      toast({
        title: "Data imported successfully",
        description: `Imported ${validData.length} aircraft configurations.`,
      })
    } catch (error) {
      // Properly type the error
      const err = error as Error
      toast({
        title: "Import failed",
        description: err.message || "Invalid JSON format",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="bg-aviation-surface border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors">
            <CardTitle className="text-base flex items-center justify-between">
              Import Manufacturer Data
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="json-import" className="text-sm font-medium">
                Aircraft Data (JSON)
              </Label>
              <Textarea
                id="json-import"
                value={jsonImport}
                onChange={(e) => setJsonImport(e.target.value)}
                placeholder={`[
  {
    "key": "B747-400",
    "name": "Boeing 747-400",
    "seats": 416,
    "cargo": 33000,
    "tora": 3050,
    "toda": 3350,
    "refTow": 340000,
    "mtow": 396000
  }
]`}
                className="bg-input border-border font-mono text-xs min-h-[120px]"
              />
            </div>

            <div className="text-xs text-muted-foreground">
              <p className="mb-2">Supported fields:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>key (required) - Unique aircraft identifier</li>
                <li>name (required) - Display name</li>
                <li>seats, cargo, tora, toda, refTow, mtow - Performance data</li>
              </ul>
            </div>

            <Button onClick={handleImport} className="w-full gap-2 bg-transparent" variant="outline">
              <Upload className="w-4 h-4" />
              Import Data
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
