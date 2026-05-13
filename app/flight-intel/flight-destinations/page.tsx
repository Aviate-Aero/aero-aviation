"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Radar,
  Search,
  Clock3,
  MapPin,
  Route,
} from "lucide-react";

type ViewMode = "routes" | "flights";
type CodeType = "icao" | "iata";
type Direction = "Arrival" | "Departure" | "Both";

type AirportRoute = {
  destination: {
    icao: string | null;
    iata: string | null;
    name: string | null;
    shortName: string | null;
    municipalityName: string | null;
    countryCode: string | null;
    timeZone: string | null;
  };
  averageDailyFlights: number;
};

type FlightMovement = {
  airport?: {
    icao?: string;
    iata?: string;
    name?: string;
    shortName?: string;
    municipalityName?: string;
    countryCode?: string;
    timeZone?: string;
  };
  scheduledTime?: {
    utc?: string;
    local?: string;
  };
  revisedTime?: {
    utc?: string;
    local?: string;
  };
  predictedTime?: {
    utc?: string;
    local?: string;
  };
  terminal?: string;
  gate?: string;
  baggageBelt?: string;
  runway?: string;
};

type FlightItem = {
  movement?: FlightMovement;
  departure?: FlightMovement;
  arrival?: FlightMovement;
  number?: string;
  callSign?: string;
  status?: string;
  codeshareStatus?: string;
  isCargo?: boolean;
  aircraft?: {
    model?: string;
    reg?: string;
  };
  airline?: {
    name?: string;
    iata?: string;
    icao?: string;
  };
};

const statusStyles: Record<string, string> = {
  Departed: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  Arrived: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  Expected: "border-blue-400/40 bg-blue-400/10 text-blue-300",
  EnRoute: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
  Boarding: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  Delayed: "border-orange-400/40 bg-orange-400/10 text-orange-300",
  Cancelled: "border-red-400/40 bg-red-400/10 text-red-300",
  Canceled: "border-red-400/40 bg-red-400/10 text-red-300",
  Unknown: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
};

export default function AirportRoutesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("flights");
  const [codeType, setCodeType] = useState<CodeType>("icao");
  const [code, setCode] = useState("");
  const [direction, setDirection] = useState<Direction>("Both");

  const [routes, setRoutes] = useState<AirportRoute[]>([]);
  const [arrivals, setArrivals] = useState<FlightItem[]>([]);
  const [departures, setDepartures] = useState<FlightItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentBoardLabel = useMemo(() => {
    if (direction === "Arrival") return "ARRIVALS";
    if (direction === "Departure") return "DEPARTURES";
    return "ARRIVALS / DEPARTURES";
  }, [viewMode, direction]);

  const formatTime = (time?: string) => {
    if (!time) return "--:--";

    return new Date(time).toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });
  };

  const getStatusClass = (status?: string) => {
    return statusStyles[status || "Unknown"] || statusStyles.Unknown;
  };

  const fetchRoutes = async () => {
    const response = await fetch(
      `/api/airport-routes?codeType=${codeType}&code=${code}`
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to fetch airport routes.");
    }

    setRoutes(data.routes || []);
  };

  const fetchFlights = async () => {
    const params = new URLSearchParams({
      codeType,
      code,
      direction,
      offsetMinutes: "-120",
      durationMinutes: "720",
      withLeg: "true",
      withCancelled: "true",
      withCodeshared: "true",
      withCargo: "true",
      withPrivate: "true",
      withLocation: "false",
    });

    const response = await fetch(
      `/api/aerodatabox/flight-destinations?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to fetch airport flights.");
    }

    setArrivals(data.arrivals || []);
    setDepartures(data.departures || []);
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setRoutes([]);
    setArrivals([]);
    setDepartures([]);

    try {
      if (viewMode === "routes") {
        await fetchRoutes();
      } else {
        await fetchFlights();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while fetching data."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderBoardHeader = (
    title: string,
    count: number,
    type: "arrival" | "departure" | "routes"
  ) => {
    const Icon =
      type === "arrival" ? PlaneLanding : type === "departure" ? PlaneTakeoff : Route;

    return (
      <div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.03] px-5 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-300">
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <h2 className="mt-1 text-2xl font-light tracking-wide text-white">
              {title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-sm">
          <span className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-zinc-300">
            {count.toString().padStart(2, "0")} Flights
          </span>

          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-emerald-300">
            LIVE BOARD
          </span>
        </div>
      </div>
    );
  };

  const renderFlightsBoard = (
    title: string,
    flights: FlightItem[],
    type: "arrival" | "departure"
  ) => {
    if (flights.length === 0) return null;

    return (
      <motion.section
        className="mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-black/70 shadow-2xl shadow-sky-950/20 backdrop-blur"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {renderBoardHeader(title, flights.length, type)}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-950/90 font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                <th className="px-5 py-4">Flight</th>
                <th className="px-5 py-4">Airline</th>
                <th className="px-5 py-4">
                  {type === "arrival" ? "Origin" : "Destination"}
                </th>
                <th className="px-5 py-4">Scheduled</th>
                <th className="px-5 py-4">Updated</th>
                <th className="px-5 py-4">Terminal</th>
                <th className="px-5 py-4">Gate</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="font-mono">
              {flights.map((flight, index) => {
                const movement =
                  type === "arrival"
                    ? flight.departure || flight.movement
                    : flight.arrival || flight.movement;

                const ownMovement =
                  type === "arrival" ? flight.arrival : flight.departure;

                const scheduledTime =
                  ownMovement?.scheduledTime?.local ||
                  flight.movement?.scheduledTime?.local;

                const revisedTime =
                  ownMovement?.revisedTime?.local ||
                  ownMovement?.predictedTime?.local ||
                  flight.movement?.revisedTime?.local ||
                  flight.movement?.predictedTime?.local;

                const airportCode =
                  movement?.airport?.iata || movement?.airport?.icao || "---";

                const airportName =
                  movement?.airport?.shortName ||
                  movement?.airport?.name ||
                  "Unknown Airport";

                const status = flight.status || "Unknown";

                return (
                  <tr
                    key={`${flight.number}-${index}`}
                    className="group border-b border-white/[0.06] bg-black/40 transition duration-300 hover:bg-sky-500/[0.06]"
                  >
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sky-300">
                          {type === "arrival" ? (
                            <PlaneLanding className="h-4 w-4" />
                          ) : (
                            <PlaneTakeoff className="h-4 w-4" />
                          )}
                        </span>

                        <div>
                          <p className="text-lg font-semibold tracking-wider text-white">
                            {flight.number || flight.callSign || "----"}
                          </p>
                          <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                            {flight.aircraft?.reg || flight.callSign || "Flight"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <p className="text-sm text-zinc-200">
                        {flight.airline?.name || "Unknown Airline"}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                        {flight.airline?.iata || flight.airline?.icao || "---"}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <span className="rounded-md border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-sm font-semibold tracking-widest text-sky-300">
                          {airportCode}
                        </span>

                        <div>
                          <p className="text-sm text-white">{airportName}</p>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                            {movement?.airport?.countryCode || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-5 text-sm text-zinc-300">
                      {formatTime(scheduledTime)}
                    </td>

                    <td className="px-5 py-5 text-sm text-zinc-300">
                      {formatTime(revisedTime)}
                    </td>

                    <td className="px-5 py-5">
                      <span className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-zinc-200">
                        {ownMovement?.terminal || flight.movement?.terminal || "--"}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <span className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-zinc-200">
                        {ownMovement?.gate || flight.movement?.gate || "--"}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${getStatusClass(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.section>
    );
  };

  const renderRoutesBoard = () => {
    if (routes.length === 0) return null;

    return (
      <motion.section
        className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/70 shadow-2xl shadow-sky-950/20 backdrop-blur"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {renderBoardHeader("Popular Departure Routes", routes.length, "routes")}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-950/90 font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                <th className="px-5 py-4">Destination</th>
                <th className="px-5 py-4">IATA</th>
                <th className="px-5 py-4">ICAO</th>
                <th className="px-5 py-4">Country</th>
                <th className="px-5 py-4">Daily Flights</th>
              </tr>
            </thead>

            <tbody className="font-mono">
              {routes.map((route, index) => (
                <tr
                  key={`${route.destination.icao}-${route.destination.iata}-${index}`}
                  className="border-b border-white/[0.06] bg-black/40 transition duration-300 hover:bg-sky-500/[0.06]"
                >
                  <td className="px-5 py-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sky-300">
                        <Plane className="h-4 w-4" />
                      </span>

                      <div>
                        <p className="text-sm text-white">
                          {route.destination.name || "Unknown"}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                          {route.destination.municipalityName || "Destination"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-5">
                    <span className="rounded-md border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-sm font-semibold tracking-widest text-sky-300">
                      {route.destination.iata || "---"}
                    </span>
                  </td>

                  <td className="px-5 py-5 text-sm text-zinc-300">
                    {route.destination.icao || "---"}
                  </td>

                  <td className="px-5 py-5 text-sm text-zinc-300">
                    {route.destination.countryCode || "---"}
                  </td>

                  <td className="px-5 py-5">
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
                      {route.averageDailyFlights?.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-4 pb-20 pt-28 text-white mt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.1),transparent_30%)]" />

      <div className="container relative z-10 mx-auto px-2 lg:px-8">
        <motion.div
          className="mb-10 max-w-4xl"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
        >

          <h1 className="text-5xl font-light leading-[1] text-balance md:text-4xl lg:text-6xl">
            Arrivals & Departures
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-zinc-400 md:text-xl">
            Search live-style airport departures, arrivals, and popular routes
            with an aviation-grade board interface.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSearch}
          className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-sky-950/20 backdrop-blur"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-sky-300">
                {currentBoardLabel}
              </p>
              <h2 className="mt-1 text-2xl font-light tracking-wide">
                Airport Board Controls
              </h2>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-zinc-400">
              <Clock3 className="h-4 w-4 text-sky-300" />
              Local Airport Time
            </div>
          </div>

          <div className="p-5">
            <div className="ml-2 mt-2 mb-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setViewMode("flights")}
                className={`rounded-full px-5 py-3 text-sm transition-all duration-300 ${
                  viewMode === "flights"
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                    : "border border-white/10 bg-black/40 text-zinc-300 hover:border-sky-400/40 hover:text-white"
                }`}
              >
                Arrivals / Departures
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-[150px_1fr_180px_auto]">
              <div>
                <label className="px-4 mb-2 block font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  Code Type
                </label>

                <select
                  value={codeType}
                  onChange={(e) => setCodeType(e.target.value as CodeType)}
                  className="ml-2 h-12 w-full rounded-full border border-white/10 bg-black px-4 text-white outline-none transition focus:border-sky-400"
                >
                  <option value="icao">ICAO</option>
                  <option value="iata">IATA</option>
                </select>
              </div>

              <div>
                <label className="px-4 mb-2 block font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  Airport Code
                </label>

                <div className="relative">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder={
                      codeType === "icao" ? "Example: KLAX" : "Example: LAX"
                    }
                    maxLength={codeType === "icao" ? 4 : 3}
                    className="ml-2 px-4 h-12 w-full rounded-full border border-white/10 bg-black px-11 text-white outline-none transition placeholder:text-zinc-600 focus:border-sky-400"
                  />
                </div>
              </div>

              {viewMode === "flights" && (
                <div>
                  <label className="px-4 mb-2 block font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                    Direction
                  </label>

                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as Direction)}
                    className="ml-2 h-12 w-full rounded-full border border-white/10 bg-black px-4 text-white outline-none transition focus:border-sky-400"
                  >
                    <option value="Both">Both</option>
                    <option value="Departure">Departures</option>
                    <option value="Arrival">Arrivals</option>
                  </select>
                </div>
              )}

              <div className="flex items-end px-8 mb-2">
                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="group flex h-12 w-full items-center justify-center rounded-full bg-sky-500 px-7 text-sm font-medium text-white transition-all duration-[650ms] hover:scale-[1.02] hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  {loading ? (
                    <>
                      <Radar className="mr-2 h-4 w-4 animate-pulse" />
                      Scanning
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4 transition-transform duration-[650ms] group-hover:rotate-12" />
                      Search Board
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.form>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          routes.length === 0 &&
          arrivals.length === 0 &&
          departures.length === 0 && (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-10 text-center backdrop-blur mb-2">
              <Plane className="mx-auto mb-4 h-10 w-10 text-sky-300 mt-2" />
              <h3 className="text-2xl font-light">Board is waiting</h3>
              <p className="mt-3 text-zinc-400 mb-2">
                Try searching{" "}
                <span className="font-mono text-white">KLAX</span> or{" "}
                <span className="font-mono text-white">LAX</span>.
              </p>
            </div>
          )}

        {viewMode === "routes" && renderRoutesBoard()}

        {viewMode === "flights" && (
          <>
            {renderFlightsBoard("Departures", departures, "departure")}
            {renderFlightsBoard("Arrivals", arrivals, "arrival")}
          </>
        )}
      </div>
    </main>
  );
}