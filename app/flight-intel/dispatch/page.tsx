"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Download, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { DispatchLayout } from "@/components/flight-intel/dispatch/dispatch-layout"
import { Metar } from "@/components/flight-intel/dispatch/metar"
import { FuelPlanningCard } from "@/components/flight-intel/dispatch/fuel-planning-card"
import { RiskAssessmentCard } from "@/components/flight-intel/dispatch/risk-assessment-card"
import { NotesCard } from "@/components/flight-intel/dispatch/notes-card"
import { CollaborationCard } from "@/components/flight-intel/dispatch/collaboration-card"
import { dispatchAPI } from "@/components/lib/dispatch/dispatch-api"
import { calculateWindComponents, parseWind } from "@/components/lib/dispatch/weather-utils"
import { AIRPORT_DATABASE } from "@/components/constants/dispatch/dispatch"
import type { DispatchState } from "@/components/types/disaptch"
import { AirportInfo } from "@/components/flight-intel/dispatch/airport-info"
import { Taf } from "@/components/flight-intel/dispatch/taf"
import {
  exportWeatherPDF,
  type AirportData,
  type PirepData,
  type FuelCalculationData,
  type OperationalNotes,
  type CollaborationAuditData,
  type RiskAssessmentData,
} from "@/components/lib/pdf-export/dispatch/pdf-export-dispatch"
import { Button } from "@/components/buttons/Standard"
import { Pirep } from "@/components/flight-intel/dispatch/pirep"
import { calculateFuelPlan } from "@/components/lib/dispatch/fuel-calculations"

type TafResponse = { full: string; provider?: string }
type DispatchAPIWithTaf = typeof dispatchAPI & {
  getTaf?: (icao: string) => Promise<TafResponse>
}

const parseFlightCategory = (raw: string) => {
  if (!raw || raw === "—") return { cat: "—", ceil: null as number | null, vis: null as number | null }
  const text = raw.toUpperCase()

  let ceil: number | null = null
  const cloudMatches = text.match(/\b(FEW|SCT|BKN|OVC)(\d{3})\b/g) || []
  const cloudLayers = cloudMatches.map((match) => {
    const [, type, height] = match.match(/\b(FEW|SCT|BKN|OVC)(\d{3})\b/) || []
    return { type, ft: parseInt(height) * 100 }
  })
  const ceilingLayers = cloudLayers.filter((layer) => layer.type === "BKN" || layer.type === "OVC")
  if (ceilingLayers.length > 0) {
    ceil = Math.min(...ceilingLayers.map((layer) => layer.ft))
  } else if (cloudLayers.length > 0) {
    ceil = Math.min(...cloudLayers.map((layer) => layer.ft))
  }

  let vis: number | null = null
  if (text.includes("CAVOK")) vis = 10
  else {
    const smMatch = text.match(/\b(\d+(?:\.\d+)?)SM\b/)
    const meterMatch = text.match(/\b(\d{4})\b/)
    if (smMatch) vis = parseFloat(smMatch[1])
    else if (meterMatch) {
      const meters = parseInt(meterMatch[1])
      vis = meters >= 9999 ? 10 : parseFloat((meters / 1609.34).toFixed(1))
    }
  }

  let cat = "VFR"
  if (ceil !== null && ceil < 500) cat = "LIFR"
  else if (ceil !== null && ceil < 1000) cat = "IFR"
  else if (ceil !== null && ceil < 3000) cat = "MVFR"
  else if (vis !== null && vis < 3) cat = "IFR"
  else if (vis !== null && vis < 5) cat = "MVFR"

  return { cat, ceil, vis }
}

export default function DispatchPage() {
  const [state, setState] = useState<
    DispatchState & {
      tafDep: string
      tafArr: string
      deepLink: string
      auditReport: string
      riskAssessment: {
        checklist: {
          weatherWithinLimits: boolean
          crewWithinDutyTime: boolean
          aircraftServiceable: boolean
          documentationAvailable: boolean
          riskMitigationInPlace: boolean
        }
        riskNotes: string
      }
    }
  >({
    dep: "OPIS",
    arr: "EGLL",
    limitXW: 15,
    minCeil: 600,
    minVis: 2,
    rwDep: "",
    rwArr: "",
    notesDep: "",
    notesArr: "",
    alts: "",

    policy: "easa5",
    tripKg: 6200,
    taxiKg: 200,
    holdFlow: 1800,
    cruiseFlow: 2400,
    gsKt: 420,
    contPct: 5,
    finalMin: 45,
    altPlan: "",
    altFuel: 0,

    metarDep: "—",
    metarArr: "—",
    provDep: "—",
    provArr: "—",
    notam: "—",
    status: "Ready — click Refresh to load data",
    networkStatus: "Network: —",

    cmpDep: "—",
    cmpArr: "—",
    bestDep: "—",
    bestArr: "—",
    trigDep: "Triggers: —",
    trigArr: "Triggers: —",
    minBadgeDep: "DEP minima: —",
    minBadgeArr: "ARR minima: —",
    xwBadge: "Crosswind watchlist: —",
    fuelPlan: "—",
    opsBadge: "—",
    riskBadge: "Risk: —",
    riskText: "—",
    riskNotes: "",
    deepLink: "—",
    audit: "—",
    altGrid: [],

    tafDep: "—",
    tafArr: "—",
    auditReport: "—",

    riskAssessment: {
      checklist: {
        weatherWithinLimits: false,
        crewWithinDutyTime: false,
        aircraftServiceable: false,
        documentationAvailable: false,
        riskMitigationInPlace: false,
      },
      riskNotes: "",
    },
  })

  const [currentAirportData, setCurrentAirportData] = useState<AirportData | undefined>()
  const [pirepData, setPirepData] = useState<PirepData | null>(null)
  const [collaborationData, setCollaborationData] = useState<CollaborationAuditData>({
    deepLink: "—",
    auditReport: "—",
    generatedAt: new Date().toLocaleString(),
  })

  const { dep, arr, limitXW, metarDep, metarArr, rwDep, rwArr } = state
  const [exporting, setExporting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fuelData: FuelCalculationData = useMemo(
    () => ({
      policy: state.policy,
      tripKg: state.tripKg,
      taxiKg: state.taxiKg,
      holdFlow: state.holdFlow,
      cruiseFlow: state.cruiseFlow,
      gsKt: state.gsKt,
      contPct: state.contPct,
      finalMin: state.finalMin,
      altPlan: state.altPlan,
      altFuel: state.altFuel,
      breakdown: calculateFuelPlan({
        policy: state.policy,
        tripKg: state.tripKg,
        taxiKg: state.taxiKg,
        holdFlow: state.holdFlow,
        cruiseFlow: state.cruiseFlow,
        gsKt: state.gsKt,
        contPct: state.contPct,
        finalMin: state.finalMin,
        altPlan: state.altPlan,
        altFuel: state.altFuel,
        arrIcao: state.arr,
      }).breakdown,
      policyDetails: {
        contPct: state.contPct,
        finalMin: state.finalMin,
      },
    }),
    [
      state.policy,
      state.tripKg,
      state.taxiKg,
      state.holdFlow,
      state.cruiseFlow,
      state.gsKt,
      state.contPct,
      state.finalMin,
      state.altPlan,
      state.altFuel,
      state.arr,
    ]
  )

  const handleMetarUpdate = useCallback(
    (newMetarData: { metarDep: string; metarArr: string; dep?: string; arr?: string }) => {
      setState((prev) => ({
        ...prev,
        ...newMetarData,
        status: "METAR data updated",
      }))
    },
    []
  )

  const handleTafUpdate = useCallback(
    (newTafData: { tafDep: string; tafArr: string; dep?: string; arr?: string }) => {
      setState((prev) => ({
        ...prev,
        ...newTafData,
        status: "TAF data updated",
      }))
    },
    []
  )

  const handleAirportDataUpdate = useCallback((airportData: AirportData | undefined) => {
    console.log("🏢 Airport data updated:", airportData)
    setCurrentAirportData(airportData)
  }, [])

  const handlePirepUpdate = useCallback((pirepData: PirepData | null) => {
    console.log("📝 PIREP data updated:", pirepData)
    setPirepData(pirepData)
    setState((prev) => ({
      ...prev,
      status: pirepData ? "PIREP data parsed successfully" : "PIREP data cleared",
    }))
  }, [])

  const handleCollaborationUpdate = useCallback(
    (newData: { deepLink?: string; auditReport?: string }) => {
      setCollaborationData((prev) => ({
        ...prev,
        ...newData,
        generatedAt: new Date().toLocaleString(),
      }))
      console.log("🔗 Collaboration data updated:", newData)
    },
    []
  )

  const handleChecklistChange = useCallback(
    (checklist: typeof state.riskAssessment.checklist) => {
      setState((prev) => ({
        ...prev,
        riskAssessment: {
          ...prev.riskAssessment,
          checklist,
        },
      }))
    },
    []
  )

  const handleExport = useCallback(async () => {
    try {
      setExporting(true)
      console.log("🔄 Starting PDF export from main page...")

      const operationalNotes: OperationalNotes = {
        notesDep: state.notesDep,
        notesArr: state.notesArr,
      }

      const riskAssessmentData: RiskAssessmentData = {
        checklist: state.riskAssessment.checklist,
        riskNotes: state.riskAssessment.riskNotes,
        assessedAt: new Date().toLocaleString(),
      }

      const hasValidData =
        (state.metarDep && state.metarDep !== "—") ||
        (state.metarArr && state.metarArr !== "—") ||
        (state.tafDep && state.tafDep !== "—") ||
        (state.tafArr && state.tafArr !== "—") ||
        pirepData ||
        fuelData ||
        state.notesDep ||
        state.notesArr ||
        collaborationData.deepLink !== "—" ||
        collaborationData.auditReport !== "—" ||
        state.riskAssessment.riskNotes ||
        Object.values(state.riskAssessment.checklist).some((value) => value)

      if (!hasValidData) {
        console.warn("⚠️ No valid data available for export")
        setState((prev) => ({ ...prev, status: "No data available for export" }))
        return
      }

      const weatherData = {
        dep: state.dep,
        arr: state.arr,
        metarDep: state.metarDep,
        metarArr: state.metarArr,
        tafDep: state.tafDep,
        tafArr: state.tafArr,
      }

      await exportWeatherPDF(
        weatherData,
        currentAirportData,
        pirepData,
        fuelData,
        operationalNotes,
        collaborationData,
        riskAssessmentData
      )

      setState((prev) => ({ ...prev, status: "✓ Complete PDF exported successfully" }))
    } catch (error: unknown) {
      console.error("❌ Export failed with details:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setState((prev) => ({
        ...prev,
        status: `✗ PDF export failed: ${errorMessage}`,
      }))
    } finally {
      setExporting(false)
    }
  }, [
    state.dep,
    state.arr,
    state.metarDep,
    state.metarArr,
    state.tafDep,
    state.tafArr,
    state.notesDep,
    state.notesArr,
    state.riskAssessment.checklist,
    state.riskAssessment.riskNotes,
    currentAirportData,
    pirepData,
    fuelData,
    collaborationData,
  ])

  const checkMinima = useCallback(
    (metar: string, side: "dep" | "arr") => {
      if (!metar || metar === "—") return `${side.toUpperCase()} minima: —`
      const flightCat = parseFlightCategory(metar)
      const { ceil, vis } = flightCat
      const needCeil = state.minCeil
      const needVis = state.minVis
      let ok = true
      let msg = flightCat.cat
      if (ceil !== null && ceil < needCeil) {
        ok = false
        msg += ` • ceiling ${ceil}<${needCeil}`
      }
      if (vis !== null && vis < needVis) {
        ok = false
        msg += ` • vis ${vis}<${needVis}`
      }
      return `${side.toUpperCase()} ${ok ? "meets minima" : "BELOW MINIMA"} (${msg})`
    },
    [state.minCeil, state.minVis]
  )

  const calculateCrosswindWatchlist = useCallback(() => {
    const items: string[] = []
    const limit = state.limitXW || 15

    if (state.dep && state.metarDep && state.metarDep !== "—") {
      const wind = parseWind(state.metarDep)
      const airport = AIRPORT_DATABASE[state.dep.toUpperCase()]
      if (airport?.runways && wind.spd !== null) {
        airport.runways.forEach((rwy) => {
          const c1 = calculateWindComponents(rwy.hdgUp, wind.dir, wind.spd)
          const c2 = calculateWindComponents((rwy.hdgUp + 180) % 360, wind.dir, wind.spd)
          if (c1.cv !== null && c1.cv > limit)
            items.push(`${state.dep} RWY ${rwy.up} XW ${c1.cv}>${limit}`)
          if (c2.cv !== null && c2.cv > limit)
            items.push(`${state.dep} RWY ${rwy.down} XW ${c2.cv}>${limit}`)
        })
      }
    }

    if (state.arr && state.metarArr && state.metarArr !== "—") {
      const wind = parseWind(state.metarArr)
      const airport = AIRPORT_DATABASE[state.arr.toUpperCase()]
      if (airport?.runways && wind.spd !== null) {
        airport.runways.forEach((rwy) => {
          const c1 = calculateWindComponents(rwy.hdgUp, wind.dir, wind.spd)
          const c2 = calculateWindComponents((rwy.hdgUp + 180) % 360, wind.dir, wind.spd)
          if (c1.cv !== null && c1.cv > limit)
            items.push(`${state.arr} RWY ${rwy.up} XW ${c1.cv}>${limit}`)
          if (c2.cv !== null && c2.cv > limit)
            items.push(`${state.arr} RWY ${rwy.down} XW ${c2.cv}>${limit}`)
        })
      }
    }

    state.altGrid.forEach((alt) => {
      if (alt.full && alt.full !== "—") {
        const wind = parseWind(alt.full)
        const airport = AIRPORT_DATABASE[alt.icao]
        if (airport?.runways && wind.spd !== null) {
          airport.runways.forEach((rwy) => {
            const c1 = calculateWindComponents(rwy.hdgUp, wind.dir, wind.spd)
            const c2 = calculateWindComponents((rwy.hdgUp + 180) % 360, wind.dir, wind.spd)
            if (c1.cv !== null && c1.cv > limit)
              items.push(`${alt.icao} RWY ${rwy.up} XW ${c1.cv}>${limit}`)
            if (c2.cv !== null && c2.cv > limit)
              items.push(`${alt.icao} RWY ${rwy.down} XW ${c2.cv}>${limit}`)
          })
        }
      }
    })

    if (items.length)
      return `Crosswind watchlist: ${items.slice(0, 3).join(" | ")}${items.length > 3 ? " …" : ""}`
    return "Crosswind watchlist: clear"
  }, [state.dep, state.arr, state.metarDep, state.metarArr, state.limitXW, state.altGrid])

  const tokenTriggers = useCallback((raw: string) => {
    if (!raw || raw === "—") return "vis: — • ceil: —"
    const s = raw
    const visTok = (s.match(/\b(\d{4}|\d{1,2}SM|CAVOK)\b/) || [])[0] || "—"
    const ceilTok = (s.match(/\b(FEW|SCT|BKN|OVC)\d{3}\b/) || [])[0] || "—"
    return `vis: ${visTok} • ceil: ${ceilTok}`
  }, [])

  const chooseBestRunway = useCallback(
    (icao: string, windDeg: number | null, windKt: number | null) => {
      const apt = AIRPORT_DATABASE[icao]
      if (!apt?.runways?.length) return null
      type BestRunway = {
        id: string
        deg: number
        sc: { s: number; c: ReturnType<typeof calculateWindComponents> }
      }
      let best: BestRunway | null = null
      let bestScore = -1
      const score = (runwayDeg: number) => {
        const c = calculateWindComponents(runwayDeg, windDeg, windKt)
        let s = 100
        if (c.hv !== null && c.hv < 0) s -= Math.min(30, Math.abs(c.hv))
        if (c.cv !== null) s -= Math.max(0, c.cv - (limitXW || 15))
        if (c.hv !== null && c.hv > 0) s += Math.min(10, Math.floor(c.hv / 2))
        return { s, c }
      }
      for (const r of apt.runways) {
        const d1 = r.hdgUp % 360
        const d2 = (r.hdgUp + 180) % 360
        const a = score(d1),
          b = score(d2)
        if (a.s > bestScore) {
          bestScore = a.s
          best = { id: r.up, deg: d1, sc: a }
        }
        if (b.s > bestScore) {
          bestScore = b.s
          best = { id: r.down, deg: d2, sc: b }
        }
      }
      return best
    },
    [limitXW]
  )

  const fillSideAnalysis = useCallback(
    (side: "dep" | "arr") => {
      const icao = (side === "dep" ? dep : arr).toUpperCase().trim()
      const raw = side === "dep" ? metarDep : metarArr
      const rwUser = +(side === "dep" ? rwDep : rwArr || "0")
      if (!icao || !raw || raw === "—") return
      const w = parseWind(raw)
      const best = chooseBestRunway(icao, w.dir, w.spd)
      const usedDeg = !isNaN(rwUser) ? rwUser : best ? best.deg : Number.NaN
      const c = calculateWindComponents(usedDeg, w.dir, w.spd)
      const trig = tokenTriggers(raw)
      const updates: Partial<DispatchState & { tafDep: string; tafArr: string }> = {}
      if (side === "dep") {
        updates.cmpDep = c.head + " • XW " + c.cross
        updates.bestDep = best
          ? `Best ${best.id} (${best.sc.s}/100)`
          : isNaN(rwUser)
          ? "—"
          : `User ${rwUser}°`
        updates.trigDep = `Triggers: ${trig}`
      } else {
        updates.cmpArr = c.head + " • XW " + c.cross
        updates.bestArr = best
          ? `Best ${best.id} (${best.sc.s}/100)`
          : isNaN(rwUser)
          ? "—"
          : `User ${rwUser}°`
        updates.trigArr = `Triggers: ${trig}`
      }
      setState((prev) => ({ ...prev, ...updates }))
    },
    [dep, arr, metarDep, metarArr, rwDep, rwArr, chooseBestRunway, tokenTriggers]
  )

  const refresh = useCallback(async () => {
    if (!state.dep || !state.arr) {
      setState((prev) => ({ ...prev, status: "Enter both dep & arr" }))
      return
    }

    if (refreshing) return

    setRefreshing(true)
    setState((prev) => ({
      ...prev,
      status: "Fetching…",
      metarDep: "…",
      metarArr: "…",
      tafDep: "…",
      tafArr: "…",
    }))

    try {
      const api = dispatchAPI as DispatchAPIWithTaf
      const networkOk = await api.checkConnection()
      setState((prev) => ({
        ...prev,
        networkStatus: networkOk ? "Network: ok" : "Network: unknown",
      }))

      const hasGetTaf = typeof api.getTaf === "function"
      const [metarDepData, metarArrData, tafDepData, tafArrData] = await Promise.all([
        api.getMetar(state.dep),
        api.getMetar(state.arr),
        hasGetTaf ? api.getTaf!(state.dep) : Promise.resolve(null),
        hasGetTaf ? api.getTaf!(state.arr) : Promise.resolve(null),
      ])

      setState((prev) => ({
        ...prev,
        metarDep: metarDepData.full,
        metarArr: metarArrData.full,
        provDep: metarDepData.provider,
        provArr: metarArrData.provider,
        tafDep: tafDepData?.full ?? "—",
        tafArr: tafArrData?.full ?? "—",
        status: "Weather data loaded successfully",
      }))
    } catch (error: unknown) {
      console.error("Refresh failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Please try again"
      setState((prev) => ({
        ...prev,
        status: `Failed to load data: ${errorMessage}`,
      }))
    } finally {
      setRefreshing(false)
    }
  }, [state.dep, state.arr, refreshing])

  useEffect(() => {
    const minBadgeDep = checkMinima(state.metarDep, "dep")
    const minBadgeArr = checkMinima(state.metarArr, "arr")
    const xwBadge = calculateCrosswindWatchlist()
    const depCat = parseFlightCategory(state.metarDep).cat
    const arrCat = parseFlightCategory(state.metarArr).cat
    const opsBadge = `DEP ${depCat} • ARR ${arrCat}`

    setState((prev) => {
      if (
        prev.minBadgeDep !== minBadgeDep ||
        prev.minBadgeArr !== minBadgeArr ||
        prev.xwBadge !== xwBadge ||
        prev.opsBadge !== opsBadge
      ) {
        return { ...prev, minBadgeDep, minBadgeArr, xwBadge, opsBadge }
      }
      return prev
    })
  }, [state.metarDep, state.metarArr, state.minCeil, state.minVis, state.limitXW])

  useEffect(() => {
    if (state.metarDep && state.metarDep !== "—" && state.metarDep !== "…")
      fillSideAnalysis("dep")
  }, [state.metarDep, fillSideAnalysis])

  useEffect(() => {
    if (state.metarArr && state.metarArr !== "—" && state.metarArr !== "…")
      fillSideAnalysis("arr")
  }, [state.metarArr, fillSideAnalysis])

  return (
    <DispatchLayout>
      {/* Header Section – Animated to match home page style */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
        className="mb-10"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] text-balance">
              Flight Dispatch
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl">
              Real‑time weather, fuel planning, and risk assessment
            </p>

            {/* Status indicators – dark theme friendly */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-3">
              <p
                className={
                  state.status.includes("✓")
                    ? "text-emerald-400"
                    : state.status.includes("✗") || state.status.includes("Failed")
                    ? "text-rose-400"
                    : "text-sky-400"
                }
              >
                {state.status}
              </p>
              {pirepData && (
                <p className="text-amber-400">✓ PIREP data ready</p>
              )}
              {fuelData && (
                <p className="text-emerald-400">✓ Fuel calculation ready</p>
              )}
              {(state.notesDep || state.notesArr) && (
                <p className="text-blue-400">✓ Operational notes ready</p>
              )}
              {(collaborationData.deepLink !== "—" ||
                collaborationData.auditReport !== "—") && (
                <p className="text-purple-400">✓ Collaboration data ready</p>
              )}
              {state.riskAssessment.riskNotes && (
                <p className="text-amber-400">✓ Risk assessment ready</p>
              )}
              {Object.values(state.riskAssessment.checklist).some((value) => value) && (
                <p className="text-amber-400">✓ Go/No‑Go checklist completed</p>
              )}
            </div>
          </div>

          {/* Action Buttons – using the unified Button component */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Button
              onClick={refresh}
              disabled={refreshing}
              size="lg"
              className="group gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 rounded-full px-6 py-3 transition-all duration-500 disabled:opacity-50"
              title="Refresh Weather Data"
            >
              <RefreshCw
                className={`w-5 h-5 transition-transform duration-500 ${
                  refreshing ? "animate-spin" : "group-hover:rotate-180"
                }`}
              />
              {refreshing ? "Refreshing…" : "Refresh"}
            </Button>

            <Button
              onClick={handleExport}
              disabled={exporting || refreshing}
              size="lg"
              className="group gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full px-8 py-3 transition-all duration-[650ms] hover:scale-[1.02] disabled:opacity-50"
              title="Download Complete Dispatch Report (PDF)"
            >
              <Download className="w-5 h-5 transition-transform duration-[650ms] group-hover:translate-y-0.5" />
              {exporting ? "Generating PDF…" : "Download Report"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Components – each should be adapted to dark theme internally */}
      <Metar
        currentState={{
          dep: state.dep,
          arr: state.arr,
          metarDep: state.metarDep,
          metarArr: state.metarArr,
        }}
        onStateUpdate={handleMetarUpdate}
      />

      <Taf
        currentState={{
          dep: state.dep,
          arr: state.arr,
          tafDep: state.tafDep,
          tafArr: state.tafArr,
        }}
        onStateUpdate={handleTafUpdate}
      />

      <AirportInfo onAirportDataUpdate={handleAirportDataUpdate} />

      <Pirep onPirepUpdate={handlePirepUpdate} />

      <FuelPlanningCard
        policy={state.policy}
        tripKg={state.tripKg}
        taxiKg={state.taxiKg}
        holdFlow={state.holdFlow}
        cruiseFlow={state.cruiseFlow}
        gsKt={state.gsKt}
        contPct={state.contPct}
        finalMin={state.finalMin}
        altPlan={state.altPlan}
        altFuel={state.altFuel}
        arrIcao={state.arr}
        fuelPlan={state.fuelPlan}
        onPolicyChange={(value) => setState((prev) => ({ ...prev, policy: value }))}
        onTripKgChange={(value) => setState((prev) => ({ ...prev, tripKg: value }))}
        onTaxiKgChange={(value) => setState((prev) => ({ ...prev, taxiKg: value }))}
        onHoldFlowChange={(value) => setState((prev) => ({ ...prev, holdFlow: value }))}
        onCruiseFlowChange={(value) => setState((prev) => ({ ...prev, cruiseFlow: value }))}
        onGsKtChange={(value) => setState((prev) => ({ ...prev, gsKt: value }))}
        onContPctChange={(value) => setState((prev) => ({ ...prev, contPct: value }))}
        onFinalMinChange={(value) => setState((prev) => ({ ...prev, finalMin: value }))}
        onAltPlanChange={(value) => setState((prev) => ({ ...prev, altPlan: value }))}
        onAltFuelChange={(value) => setState((prev) => ({ ...prev, altFuel: value }))}
        onComputeFuel={() => setState((prev) => ({ ...prev, status: "Fuel computed" }))}
        onCopyFuelPlan={() => setState((prev) => ({ ...prev, status: "Fuel plan copied" }))}
      />

      <RiskAssessmentCard
        riskNotes={state.riskAssessment.riskNotes}
        onRiskNotesChange={(value) =>
          setState((prev) => ({
            ...prev,
            riskAssessment: { ...prev.riskAssessment, riskNotes: value },
          }))
        }
        checklist={state.riskAssessment.checklist}
        onChecklistChange={handleChecklistChange}
      />

      <NotesCard
        notesDep={state.notesDep}
        notesArr={state.notesArr}
        onNotesDepChange={(value) => setState((prev) => ({ ...prev, notesDep: value }))}
        onNotesArrChange={(value) => setState((prev) => ({ ...prev, notesArr: value }))}
        onStatusUpdate={(status) => setState((prev) => ({ ...prev, status }))}
      />

      <CollaborationCard
        metarDep={state.metarDep}
        metarArr={state.metarArr}
        notam={state.notam}
        provDep={state.provDep}
        provArr={state.provArr}
        dep={state.dep}
        arr={state.arr}
        onStatusUpdate={(status) => setState((prev) => ({ ...prev, status }))}
        onCollaborationUpdate={handleCollaborationUpdate}
      />
    </DispatchLayout>
  )
}