"use client"

import { useState } from "react"
import {
  CircleArrowRight,
  Loader2,
  Plane,
  MapPin,
  AlertCircle,
  Clock,
  Hash,
  Wifi,
  Ruler,
  Briefcase,
  Wind,
  Gauge,
  RadioTower,
  Zap,
  Navigation,
  ImageIcon,
  Route,
  Activity,
  Luggage,
  DoorOpen,
  MonitorCheck,
} from "lucide-react"

import { Button } from "@/components/buttons/Standard"
import { Input } from "@/components/input/Standard"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card/Standard"

import FlightMap from "@/components/flight-intel/flight-tracker/flightMaps/Standard"

type SearchBy = "number" | "callsign" | "reg" | "icao24"
type DateLocalRole = "Both" | "Departure" | "Arrival"

export default function FlightStatusPage() {
  const [searchBy, setSearchBy] = useState<SearchBy>("number")
  const [searchParam, setSearchParam] = useState("")
  const [dateLocal, setDateLocal] = useState("")
  const [dateLocalRole, setDateLocalRole] = useState<DateLocalRole>("Both")
  const [withAircraftImage, setWithAircraftImage] = useState(false)
  const [withLocation, setWithLocation] = useState(true)

  const [loading, setLoading] = useState(false)
  const [flights, setFlights] = useState<any[]>([])
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setFlights([])

    if (!searchParam.trim()) {
      setError("Please enter a flight number, callsign, registration, or ICAO24.")
      return
    }

    try {
      setLoading(true)

      const params = new URLSearchParams({
        searchBy,
        searchParam: searchParam.trim(),
        dateLocalRole,
        withAircraftImage: String(withAircraftImage),
        withLocation: String(withLocation),
      })

      if (dateLocal) params.append("dateLocal", dateLocal)

      const res = await fetch(
        `/api/aerodatabox/flight-status?${params.toString()}`
      )

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || json.message || "Request failed")
      }

      if (json.message) setMessage(json.message)

      setFlights(json.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const clearForm = () => {
    setSearchBy("number")
    setSearchParam("")
    setDateLocal("")
    setDateLocalRole("Both")
    setWithAircraftImage(false)
    setWithLocation(true)
    setFlights([])
    setError("")
    setMessage("")
  }

  return (
    <main className="relative bg-black text-white overflow-hidden mt-10">
      <section className="relative z-20 pt-28 pb-24 px-4">
        <div className="container mx-auto max-w-7xl space-y-8">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border border-emerald-400/50" />
              </div>

              <span className="text-xs text-emerald-400 font-mono uppercase tracking-wider">
                Flight Status Active
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono">UTC</span>
              <span className="text-sm text-sky-400 font-mono tabular-nums">
                {new Date().toISOString().slice(11, 19)}
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                <Plane className="w-6 h-6 text-sky-400" />
              </div>

              <h1 className="text-3xl md:text-4xl font-light text-zinc-100">
                Flight Status
              </h1>
            </div>

            <p className="text-lg text-zinc-400 max-w-2xl">
              Search real-time flight status, aircraft details, route timing,
              flight plan, and live location data.
            </p>
          </div>

          {/* Search Card */}
          <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-light text-zinc-100">
                Search Flights
              </CardTitle>

              <CardDescription className="text-zinc-400">
                Find flights by number, callsign, registration, or ICAO24 code.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Field label="Search By">
                    <select
                      value={searchBy}
                      onChange={(e) => setSearchBy(e.target.value as SearchBy)}
                      className="aero-input"
                    >
                      <option value="number">Flight Number</option>
                      <option value="callsign">Callsign</option>
                      <option value="reg">Registration</option>
                      <option value="icao24">ICAO24</option>
                    </select>
                  </Field>

                  <Field label="Search Value">
                    <Input
                      value={searchParam}
                      onChange={(e) =>
                        setSearchParam(e.target.value.toUpperCase())
                      }
                      placeholder={
                        searchBy === "number"
                          ? "PK300"
                          : searchBy === "callsign"
                            ? "PIA300"
                            : searchBy === "reg"
                              ? "AP-BHX"
                              : "484161"
                      }
                      className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base"
                    />
                  </Field>

                  <Field label="Date Local">
                    <input
                      type="date"
                      value={dateLocal}
                      onChange={(e) => setDateLocal(e.target.value)}
                      className="aero-input"
                    />
                  </Field>

                  <Field label="Date Role">
                    <select
                      value={dateLocalRole}
                      onChange={(e) =>
                        setDateLocalRole(e.target.value as DateLocalRole)
                      }
                      className="aero-input"
                    >
                      <option value="Both">Both</option>
                      <option value="Departure">Departure</option>
                      <option value="Arrival">Arrival</option>
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ToggleOption
                    checked={withAircraftImage}
                    onChange={setWithAircraftImage}
                    label="Include aircraft image"
                  />

                  <ToggleOption
                    checked={withLocation}
                    onChange={setWithLocation}
                    label="Include live location"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Button
                    type="submit"
                    disabled={loading || !searchParam.trim()}
                    className="group rounded-full bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 h-auto text-base font-medium transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Searching
                      </>
                    ) : (
                      <>
                        <CircleArrowRight className="mr-2 w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
                        Search Flight
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={clearForm}
                    className="rounded-full border border-zinc-700 bg-black/40 px-8 py-3 text-sm font-medium text-zinc-300 hover:border-sky-500/50 hover:text-sky-400 hover:bg-sky-500/10 transition"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {error && <NoticeCard type="error" title="Error" message={error} />}

          {message && (
            <NoticeCard type="warning" title="Notice" message={message} />
          )}

          {!loading && flights.length === 0 && !error && !message && (
            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardContent className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 bg-zinc-800/50 rounded-full flex items-center justify-center border border-zinc-700">
                    <Plane className="w-10 h-10 text-zinc-500" />
                  </div>

                  <h3 className="text-xl font-light text-zinc-200 mb-2">
                    Ready for Takeoff
                  </h3>

                  <p className="text-zinc-400 mb-6">
                    Enter a flight number, callsign, registration, or ICAO24 code
                    to view live flight details.
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {["PK300", "PIA300", "AP-BHX"].map((item) => (
                      <span
                        key={item}
                        className="px-4 py-2 bg-sky-500/10 text-sky-400 rounded-full border border-sky-500/30 text-sm"
                      >
                        Try {item}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardContent className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 relative">
                    <div className="absolute inset-0 border-4 border-zinc-700 border-t-sky-400 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Plane className="w-10 h-10 text-sky-400" />
                    </div>
                  </div>

                  <h3 className="text-xl font-light text-zinc-200 mb-2">
                    Scanning Airspace
                  </h3>

                  <p className="text-zinc-400">
                    Gathering flight status from aviation data networks.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {flights.length > 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-light text-zinc-100">
                  Flight Results
                </h2>
                <p className="text-zinc-500 text-sm mt-1">
                  {flights.length} result{flights.length > 1 ? "s" : ""} found.
                </p>
              </div>

              {flights.map((flight, i) => (
                <FlightDetail
                  key={i}
                  flight={flight}
                  withAircraftImage={withAircraftImage}
                  withLocation={withLocation}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <style jsx global>{`
        .aero-input {
          width: 100%;
          height: 42px;
          border: 1px solid rgb(63 63 70);
          border-radius: 9999px;
          padding: 0 1rem;
          color: rgb(228 228 231);
          background: rgb(0 0 0 / 0.4);
          transition: all 0.2s ease;
          outline: none;
        }

        .aero-input:focus {
          border-color: rgb(14 165 233);
          box-shadow: 0 0 0 2px rgb(14 165 233 / 0.25);
        }

        .aero-input option {
          background: #09090b;
          color: white;
        }
      `}</style>
    </main>
  )
}

/* ========== Main Flight Detail ========== */

function FlightDetail({
  flight,
  withAircraftImage,
  withLocation,
}: {
  flight: any
  withAircraftImage: boolean
  withLocation: boolean
}) {
  const aircraftImage =
    flight?.aircraft?.image?.url ||
    flight?.aircraft?.image?.webUrl ||
    flight?.aircraft?.image?.src ||
    flight?.aircraft?.image

  const mapFlight = mapAeroDataBoxFlightToMapFlight(flight)
  const mapFlights = mapFlight ? [mapFlight] : []

  const status = flight?.status || "Unknown"

  return (
    <div className="space-y-6">
      {/* Flight Header */}
      <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                  <Plane className="w-6 h-6 text-sky-400" />
                </div>

                <div>
                  <h2 className="text-3xl md:text-4xl font-light text-zinc-100">
                    {displayValue(flight?.number)}
                  </h2>

                  <p className="text-zinc-400 mt-1">
                    Callsign:{" "}
                    <span className="text-zinc-200 font-mono">
                      {displayValue(flight?.callSign)}
                    </span>
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                        status
                      )}`}
                    >
                      {displayValue(status)}
                    </span>

                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border border-zinc-700 bg-black/30 text-zinc-300">
                      Codeshare: {displayValue(flight?.codeshareStatus)}
                    </span>

                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border border-zinc-700 bg-black/30 text-zinc-300">
                      Cargo: {flight?.isCargo ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniDetail
                  icon={<Briefcase className="w-4 h-4" />}
                  label="Airline"
                  value={flight?.airline?.name}
                />

                <MiniDetail
                  icon={<Hash className="w-4 h-4" />}
                  label="Registration"
                  value={flight?.aircraft?.reg}
                  mono
                />

                <MiniDetail
                  icon={<Clock className="w-4 h-4" />}
                  label="Updated"
                  value={formatDateTime(flight?.lastUpdatedUtc)}
                />
              </div>
            </div>

            <div className="lg:w-72 rounded-2xl border border-zinc-800 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-500 mb-2 mt-2 ml-2">
                Aircraft
              </p>

              <p className="text-2xl font-light text-zinc-100 ml-2 mr-2">
                {displayValue(flight?.aircraft?.model)}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 ml-2">
                <SmallValue label="Mode S" value={flight?.aircraft?.modeS} />
                <SmallValue label="Reg" value={flight?.aircraft?.reg} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aircraft Image */}
      {withAircraftImage && aircraftImage && (
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <ImageIcon className="w-5 h-5" />
              </div>
              Aircraft Image
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            <img
              src={aircraftImage}
              alt={flight?.aircraft?.reg || "Aircraft"}
              className="w-full max-h-[420px] object-cover rounded-xl border border-zinc-800"
            />
          </CardContent>
        </Card>
      )}

      {/* Departure / Arrival */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AirportCard
          title="Departure"
          icon={<Plane className="w-5 h-5 rotate-45" />}
          data={flight?.departure}
        />

        <AirportCard
          title="Arrival"
          icon={<MapPin className="w-5 h-5" />}
          data={flight?.arrival}
        />
      </div>

      {/* Timing */}
      <SectionCard title="Timing Information" icon={<Clock className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TimingBlock
            title="Departure Scheduled"
            utc={flight?.departure?.scheduledTime?.utc}
            local={flight?.departure?.scheduledTime?.local}
          />
          <TimingBlock
            title="Departure Revised"
            utc={flight?.departure?.revisedTime?.utc}
            local={flight?.departure?.revisedTime?.local}
          />
          <TimingBlock
            title="Departure Predicted"
            utc={flight?.departure?.predictedTime?.utc}
            local={flight?.departure?.predictedTime?.local}
          />
          <TimingBlock
            title="Departure Runway"
            utc={flight?.departure?.runwayTime?.utc}
            local={flight?.departure?.runwayTime?.local}
          />
          <TimingBlock
            title="Arrival Scheduled"
            utc={flight?.arrival?.scheduledTime?.utc}
            local={flight?.arrival?.scheduledTime?.local}
          />
          <TimingBlock
            title="Arrival Revised"
            utc={flight?.arrival?.revisedTime?.utc}
            local={flight?.arrival?.revisedTime?.local}
          />
          <TimingBlock
            title="Arrival Predicted"
            utc={flight?.arrival?.predictedTime?.utc}
            local={flight?.arrival?.predictedTime?.local}
          />
          <TimingBlock
            title="Arrival Runway"
            utc={flight?.arrival?.runwayTime?.utc}
            local={flight?.arrival?.runwayTime?.local}
          />
        </div>
      </SectionCard>

      {/* Airline / Aircraft / Distance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Airline" icon={<Briefcase className="w-5 h-5" />}>
          <div className="grid grid-cols-1 gap-3">
            <InfoBox label="Name" value={flight?.airline?.name} />
            <InfoBox label="IATA" value={flight?.airline?.iata} />
            <InfoBox label="ICAO" value={flight?.airline?.icao} />
          </div>
        </SectionCard>

        <SectionCard title="Aircraft" icon={<Wifi className="w-10 h-10" />}>
          <div className="grid grid-cols-1 gap-8">
            <InfoBox label="Registration" value={flight?.aircraft?.reg} />
            <InfoBox label="Mode S" value={flight?.aircraft?.modeS} />
            <InfoBox label="Model" value={flight?.aircraft?.model} />
          </div>
        </SectionCard>

        <SectionCard title="Distance" icon={<Ruler className="w-5 h-5" />}>
          <div className="grid grid-cols-1 gap-3">
            <InfoBox
              label="Meters"
              value={formatUnit(flight?.greatCircleDistance?.meter, "m")}
            />
            <InfoBox
              label="Kilometers"
              value={formatUnit(flight?.greatCircleDistance?.km, "km")}
            />
            <InfoBox
              label="Miles"
              value={formatUnit(flight?.greatCircleDistance?.mile, "mi")}
            />
            <InfoBox
              label="Nautical Miles"
              value={formatUnit(flight?.greatCircleDistance?.nm, "nm")}
            />
            <InfoBox
              label="Feet"
              value={formatUnit(flight?.greatCircleDistance?.feet, "ft")}
            />
          </div>
        </SectionCard>
      </div>

      {/* Flight Plan */}
      {flight?.flightPlan && (
        <SectionCard title="Flight Plan" icon={<RadioTower className="w-5 h-5" />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <InfoBox
              label="Flight Rules"
              value={flight?.flightPlan?.flightRules}
            />
            <InfoBox
              label="Flight Type"
              value={flight?.flightPlan?.flightType}
            />
            <InfoBox label="Status" value={flight?.flightPlan?.status} />
            <InfoBox
              label="Revision No"
              value={flight?.flightPlan?.revisionNo}
            />
            <InfoBox
              label="Last Updated"
              value={formatDateTime(flight?.flightPlan?.lastUpdatedUtc)}
            />
            <InfoBox
              label="Planned Altitude"
              value={formatDistanceObject(flight?.flightPlan?.altitude)}
            />
            <InfoBox
              label="Planned Airspeed"
              value={formatSpeedObject(flight?.flightPlan?.airspeed)}
            />
          </div>

          {flight?.flightPlan?.route && (
            <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
              <div className="flex items-center gap-2 text-sky-400 mb-2">
                <Route className="w-4 h-4" />
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Route
                </p>
              </div>

              <p className="text-sm text-zinc-100 leading-relaxed break-words">
                {flight.flightPlan.route}
              </p>
            </div>
          )}
        </SectionCard>
      )}

      {/* Live Location Details */}
      {withLocation && flight?.location && (
        <SectionCard title="Live Location Details" icon={<MapPin className="w-5 h-5" />}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <InfoBox label="Latitude" value={flight?.location?.lat} />
            <InfoBox label="Longitude" value={flight?.location?.lon} />
            <InfoBox
              label="Reported At"
              value={formatDateTime(flight?.location?.reportedAtUtc)}
            />
            <InfoBox
              label="Vertical Speed"
              value={formatUnit(flight?.location?.vsiFpm, "fpm")}
            />
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <LocationGroupCard
              title="Altitude"
              icon={<Gauge className="w-4 h-4" />}
              data={flight?.location?.altitude}
            />

            <LocationGroupCard
              title="Pressure Altitude"
              icon={<Gauge className="w-4 h-4" />}
              data={flight?.location?.pressureAltitude}
            />

            <SpeedGroupCard
              title="Ground Speed"
              icon={<Wind className="w-4 h-4" />}
              data={flight?.location?.groundSpeed}
            />

            <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
              <div className="flex items-center gap-2 text-sky-400 mb-3">
                <Zap className="w-4 h-4" />
                <p className="text-sm font-medium text-zinc-200">
                  Track & Pressure
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SmallValue
                  label="Track Deg"
                  value={formatUnit(flight?.location?.trueTrack?.deg, "°")}
                />
                <SmallValue
                  label="Track Rad"
                  value={flight?.location?.trueTrack?.rad}
                />
                <SmallValue label="hPa" value={flight?.location?.pressure?.hPa} />
                <SmallValue label="inHg" value={flight?.location?.pressure?.inHg} />
                <SmallValue label="mmHg" value={flight?.location?.pressure?.mmHg} />
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Map */}
      {withLocation && mapFlights.length > 0 && (
        <SectionCard title="Live Map" icon={<Navigation className="w-5 h-5" />}>
          <FlightMap
            flights={mapFlights}
            selectedFlight={mapFlight}
            onFlightSelect={() => {}}
            height="500px"
          />
        </SectionCard>
      )}
    </div>
  )
}

/* ========== UI Helpers ========== */

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-400 mb-2">
        {label}
      </label>
      {children}
    </div>
  )
}

function ToggleOption({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-3 rounded-full border border-zinc-700 bg-black/40 px-4 py-3 text-sm text-zinc-300 cursor-pointer hover:border-sky-500/50 hover:bg-sky-500/5 transition">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-sky-500 rounded"
      />
      {label}
    </label>
  )
}

function NoticeCard({
  type,
  title,
  message,
}: {
  type: "error" | "warning"
  title: string
  message: string
}) {
  const styles =
    type === "error"
      ? "border-red-500/30 bg-red-500/10 text-red-300"
      : "border-amber-500/30 bg-amber-500/10 text-amber-300"

  const iconStyles =
    type === "error"
      ? "bg-red-500/10 text-red-400"
      : "bg-amber-500/10 text-amber-400"

  return (
    <Card className={`${styles} backdrop-blur-sm rounded-2xl overflow-hidden`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${iconStyles}`}>
            <AlertCircle className="w-5 h-5" />
          </div>

          <div>
            <p className="font-medium mb-1">{title}</p>
            <p className="text-sm opacity-90">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            {icon}
          </div>
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  )
}

function MiniDetail({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode
  label: string
  value: any
  mono?: boolean
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
      <div className="flex items-center gap-2 text-sky-400 mb-2">
        {icon}
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          {label}
        </p>
      </div>

      <p className={`text-zinc-100 ${mono ? "font-mono" : ""}`}>
        {displayValue(value)}
      </p>
    </div>
  )
}

function InfoBox({
  label,
  value,
}: {
  label: string
  value: any
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
        {label}
      </p>
      <p className="text-sm text-zinc-100 break-words">
        {displayValue(value)}
      </p>
    </div>
  )
}

function SmallValue({
  label,
  value,
}: {
  label: string
  value: any
}) {
  return (
    <div>
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-sm text-zinc-100 break-words">
        {displayValue(value)}
      </p>
    </div>
  )
}

/* ========== Airport Card ========== */

function AirportCard({
  title,
  icon,
  data,
}: {
  title: string
  icon: React.ReactNode
  data: any
}) {
  const airport = data?.airport

  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            {icon}
          </div>
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-light text-zinc-100">
              {displayValue(airport?.name)}
            </p>

            <p className="text-sm text-zinc-500 mt-1">
              {displayValue(airport?.iata)} / {displayValue(airport?.icao)}
            </p>

            <p className="text-sm text-zinc-400 mt-2">
              {displayValue(airport?.municipalityName)} ·{" "}
              {displayValue(airport?.countryCode)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Short Name" value={airport?.shortName} />
            <InfoBox label="Local Code" value={airport?.localCode} />
            <InfoBox label="Timezone" value={airport?.timeZone} />

            <InfoBox
              label="Location"
              value={
                airport?.location?.lat !== undefined &&
                airport?.location?.lon !== undefined
                  ? `${airport.location.lat}, ${airport.location.lon}`
                  : undefined
              }
            />

            <InfoBox label="Terminal" value={data?.terminal} />
            <InfoBox label="Gate" value={data?.gate} />
            <InfoBox label="Check-in Desk" value={data?.checkInDesk} />
            <InfoBox label="Baggage Belt" value={data?.baggageBelt} />
            <InfoBox label="Runway" value={data?.runway} />
            <InfoBox label="Quality" value={formatArray(data?.quality)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <MiniDetail
              icon={<DoorOpen className="w-4 h-4" />}
              label="Terminal"
              value={data?.terminal}
            />
            <MiniDetail
              icon={<MonitorCheck className="w-4 h-4" />}
              label="Check-in"
              value={data?.checkInDesk}
            />
            <MiniDetail
              icon={<Luggage className="w-4 h-4" />}
              label="Baggage"
              value={data?.baggageBelt}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ========== Timing ========== */

function TimingBlock({
  title,
  utc,
  local,
}: {
  title: string
  utc?: string
  local?: string
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
      <p className="text-sm font-medium text-zinc-200 mb-3">{title}</p>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-zinc-500">UTC</span>
          <span className="text-zinc-300 text-right">{formatDateTime(utc)}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-zinc-500">Local</span>
          <span className="text-zinc-300 text-right">
            {formatDateTime(local)}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ========== Location Group Cards ========== */

function LocationGroupCard({
  title,
  icon,
  data,
}: {
  title: string
  icon: React.ReactNode
  data: any
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
      <div className="flex items-center gap-2 text-sky-400 mb-3">
        {icon}
        <p className="text-sm font-medium text-zinc-200">{title}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SmallValue label="Meters" value={formatUnit(data?.meter, "m")} />
        <SmallValue label="KM" value={formatUnit(data?.km, "km")} />
        <SmallValue label="Miles" value={formatUnit(data?.mile, "mi")} />
        <SmallValue label="NM" value={formatUnit(data?.nm, "nm")} />
        <SmallValue label="Feet" value={formatUnit(data?.feet, "ft")} />
      </div>
    </div>
  )
}

function SpeedGroupCard({
  title,
  icon,
  data,
}: {
  title: string
  icon: React.ReactNode
  data: any
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
      <div className="flex items-center gap-2 text-sky-400 mb-3">
        {icon}
        <p className="text-sm font-medium text-zinc-200">{title}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SmallValue label="Knots" value={formatUnit(data?.kt, "kt")} />
        <SmallValue label="KM/H" value={formatUnit(data?.kmPerHour, "km/h")} />
        <SmallValue label="MPH" value={formatUnit(data?.miPerHour, "mph")} />
        <SmallValue
          label="M/S"
          value={formatUnit(data?.meterPerSecond, "m/s")}
        />
      </div>
    </div>
  )
}

/* ========== Data Helpers ========== */

function displayValue(v: any) {
  if (v === null || v === undefined || v === "") return "N/A"
  return String(v)
}

function formatDateTime(value?: string) {
  if (!value) return "N/A"

  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function formatUnit(value: any, unit: string) {
  if (value === null || value === undefined || value === "") return "N/A"
  return `${value} ${unit}`
}

function formatArray(value: any) {
  if (!value) return "N/A"

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "N/A"
  }

  return String(value)
}

function formatDistanceObject(value: any) {
  if (!value) return "N/A"

  const parts = [
    value.meter !== undefined ? `${value.meter} m` : null,
    value.km !== undefined ? `${value.km} km` : null,
    value.mile !== undefined ? `${value.mile} mi` : null,
    value.nm !== undefined ? `${value.nm} nm` : null,
    value.feet !== undefined ? `${value.feet} ft` : null,
  ].filter(Boolean)

  return parts.length ? parts.join(" / ") : "N/A"
}

function formatSpeedObject(value: any) {
  if (!value) return "N/A"

  const parts = [
    value.kt !== undefined ? `${value.kt} kt` : null,
    value.kmPerHour !== undefined ? `${value.kmPerHour} km/h` : null,
    value.miPerHour !== undefined ? `${value.miPerHour} mph` : null,
    value.meterPerSecond !== undefined ? `${value.meterPerSecond} m/s` : null,
  ].filter(Boolean)

  return parts.length ? parts.join(" / ") : "N/A"
}

function getStatusColor(status: string) {
  const s = status.toLowerCase()

  if (s.includes("scheduled")) {
    return "bg-blue-500/20 text-blue-400 border-blue-500/30"
  }

  if (s.includes("landed") || s.includes("arrived")) {
    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  }

  if (s.includes("airborne") || s.includes("in-flight")) {
    return "bg-sky-500/20 text-sky-400 border-sky-500/30"
  }

  if (s.includes("cancelled")) {
    return "bg-red-500/20 text-red-400 border-red-500/30"
  }

  if (s.includes("delayed")) {
    return "bg-amber-500/20 text-amber-400 border-amber-500/30"
  }

  return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
}

function mapAeroDataBoxFlightToMapFlight(flight: any) {
  const lat = flight?.location?.lat
  const lon = flight?.location?.lon

  if (lat === null || lat === undefined || lon === null || lon === undefined) {
    return null
  }

  return {
    fr24_id:
      flight?.aircraft?.modeS ||
      flight?.aircraft?.reg ||
      flight?.number ||
      flight?.callSign ||
      "aerodatabox-flight",

    flight: flight?.number,
    callsign: flight?.callSign,

    lat,
    lon,

    alt: flight?.location?.altitude?.feet,
    gspeed: flight?.location?.groundSpeed?.kt,
    track: flight?.location?.trueTrack?.deg,
    vspeed: flight?.location?.vsiFpm,

    reg: flight?.aircraft?.reg,
    type: flight?.aircraft?.model,

    orig_iata: flight?.departure?.airport?.iata,
    orig_icao: flight?.departure?.airport?.icao,
    dest_iata: flight?.arrival?.airport?.iata,
    dest_icao: flight?.arrival?.airport?.icao,

    timestamp: flight?.location?.reportedAtUtc || flight?.lastUpdatedUtc,
    source: "AeroDataBox",

    on_ground:
      flight?.status?.toLowerCase?.().includes("landed") ||
      flight?.status?.toLowerCase?.().includes("arrived"),
  }
}