"use client";

import { useState } from "react";
import { Button } from "@/components/buttons/Standard";
import { Input } from "@/components/input/Standard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card/Standard";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  Plane,
  Search,
  Ticket,
  Users,
} from "lucide-react";

type FlightLeg = {
  flight_number?: string;
  airline?: string;
  airline_code?: string;
  departure_airport?: string;
  departure_airport_name?: string;
  arrival_airport?: string;
  arrival_airport_name?: string;
  departure_time?: string;
  arrival_time?: string;
  departure_datetime?: string;
  arrival_datetime?: string;
  duration_min?: number;
};

type Layover = {
  airport?: string;
  airport_name?: string;
  duration_min?: number;
};

type TicketFlight = {
  price_usd?: number;
  original_price?: number;
  original_currency?: string;
  total_duration_min?: number;
  stops?: number;
  legs?: FlightLeg[];
  layovers?: Layover[];
};

type TicketSearchResponse = {
  origin?: string;
  destination?: string;
  date?: string;
  passengers?: number;
  count?: number;
  flights?: TicketFlight[];
};

export default function TicketsSearchPage() {
  const [origin, setOrigin] = useState("LHR");
  const [destination, setDestination] = useState("JFK");
  const [date, setDate] = useState("2026-05-01");
  const [passengers, setPassengers] = useState(1);

  const [result, setResult] = useState<TicketSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const searchTickets = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setResult(null);

      const cleanOrigin = origin.trim().toUpperCase();
      const cleanDestination = destination.trim().toUpperCase();

      if (cleanOrigin.length !== 3) {
        setErrorMessage("Origin must be a 3-letter IATA code, e.g. LHR.");
        return;
      }

      if (cleanDestination.length !== 3) {
        setErrorMessage("Destination must be a 3-letter IATA code, e.g. JFK.");
        return;
      }

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        setErrorMessage("Please enter a valid date in YYYY-MM-DD format.");
        return;
      }

      if (!Number.isInteger(passengers) || passengers < 1 || passengers > 9) {
        setErrorMessage("Passengers must be between 1 and 9.");
        return;
      }

      const params = new URLSearchParams();

      params.set("origin", cleanOrigin);
      params.set("destination", cleanDestination);
      params.set("date", date);
      params.set("passengers", String(passengers));

      const response = await fetch(
        `/api/skylink/ticketSearch?${params.toString()}`
      );

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setErrorMessage(data?.message || "Failed to search tickets.");
        return;
      }

      setResult(data);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error ? error.message : "Failed to search tickets."
      );
    } finally {
      setLoading(false);
    }
  };

  const flights = result?.flights || [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-40">
      <div className="space-y-6">
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-zinc-800/50">
            <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
              <Ticket className="w-7 h-7 text-sky-400" />
              Ticket Search
            </CardTitle>

            <CardDescription className="text-zinc-400">
              Search flight ticket options by origin, destination, travel date,
              and passenger count using Skylink API.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Origin
                </label>

                <Input
                  type="text"
                  value={origin}
                  onChange={(e) => {
                    setOrigin(e.target.value.toUpperCase());
                    setErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") searchTickets();
                  }}
                  placeholder="e.g., LHR"
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Destination
                </label>

                <Input
                  type="text"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value.toUpperCase());
                    setErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") searchTickets();
                  }}
                  placeholder="e.g., JFK"
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Date
                </label>

                <Input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setErrorMessage("");
                  }}
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Passengers
                </label>

                <Input
                  type="number"
                  min={1}
                  max={9}
                  value={passengers}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    const safeValue = Math.min(Math.max(value || 1, 1), 9);
                    setPassengers(safeValue);
                  }}
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={searchTickets}
                  disabled={
                    loading ||
                    !origin.trim() ||
                    !destination.trim() ||
                    !date.trim()
                  }
                  className="w-full h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Searching..." : "Search Tickets"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {errorMessage && (
          <Card className="border-red-500/30 bg-red-500/10 backdrop-blur-sm rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 text-red-300">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />

                <div>
                  <p className="font-medium">Failed to search tickets</p>
                  <p className="text-sm text-red-400 mt-1 whitespace-pre-wrap">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard
                icon={<MapPin className="w-5 h-5 text-sky-400" />}
                label="Route"
                value={`${result.origin || origin} → ${
                  result.destination || destination
                }`}
              />

              <StatsCard
                icon={<Calendar className="w-5 h-5 text-sky-400" />}
                label="Travel Date"
                value={result.date || date}
              />

              <StatsCard
                icon={<Users className="w-5 h-5 text-sky-400" />}
                label="Passengers"
                value={result.passengers || passengers}
              />

              <StatsCard
                icon={<Ticket className="w-5 h-5 text-sky-400" />}
                label="Results"
                value={result.count ?? flights.length}
              />
            </div>

            {flights.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {flights.map((flight, index) => (
                  <TicketCard
                    key={`${flight.price_usd || "ticket"}-${index}`}
                    flight={flight}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <Ticket className="w-16 h-16 text-zinc-600 mb-4" />

                  <h3 className="text-2xl font-light text-zinc-300 mb-3">
                    No Tickets Found
                  </h3>

                  <p className="text-zinc-500 max-w-md">
                    Try another route, date, or passenger count.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TicketCard({
  flight,
  index,
}: {
  flight: TicketFlight;
  index: number;
}) {
  const legs = flight.legs || [];
  const layovers = flight.layovers || [];

  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:border-sky-500/40 transition-all duration-300">
      <CardHeader className="pb-4 border-b border-zinc-800/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
              <Plane className="w-6 h-6 text-sky-400" />
              Option {index + 1}
            </CardTitle>

            <CardDescription className="mt-2 text-zinc-400">
              {flight.stops === 0
                ? "Direct flight"
                : `${flight.stops || 0} stop${flight.stops === 1 ? "" : "s"}`}
            </CardDescription>
          </div>

          <div className="text-right">
            <p className="text-3xl font-light text-sky-400">
              ${formatNumber(flight.price_usd)}
            </p>

            {flight.original_price && flight.original_currency && (
              <p className="text-xs text-zinc-500">
                {formatNumber(flight.original_price)}{" "}
                {flight.original_currency}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-3 mb-5">
          <MiniStat
            icon={<Clock className="w-4 h-4 text-sky-400" />}
            label="Duration"
            value={formatDuration(flight.total_duration_min)}
          />

          <MiniStat
            icon={<ArrowRight className="w-4 h-4 text-sky-400" />}
            label="Stops"
            value={flight.stops ?? 0}
          />
        </div>

        <div className="space-y-4">
          {legs.map((leg, index) => (
            <LegCard key={`${leg.flight_number || "leg"}-${index}`} leg={leg} />
          ))}
        </div>

        {layovers.length > 0 && (
          <div className="mt-5 space-y-3">
            <p className="text-sm font-medium text-zinc-400">Layovers</p>

            {layovers.map((layover, index) => (
              <div
                key={`${layover.airport || "layover"}-${index}`}
                className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-amber-400">
                      {layover.airport || "N/A"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {layover.airport_name || "Unknown airport"}
                    </p>
                  </div>

                  <p className="text-zinc-300">
                    {formatDuration(layover.duration_min)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LegCard({ leg }: { leg: FlightLeg }) {
  return (
    <div className="rounded-xl border border-zinc-800/50 bg-black/20 p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-light text-zinc-100">
            {leg.flight_number || "N/A"}
          </p>

          <p className="text-sm text-zinc-400">
            {leg.airline || "Unknown Airline"}{" "}
            {leg.airline_code ? `(${leg.airline_code})` : ""}
          </p>
        </div>

        <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
          {formatDuration(leg.duration_min)}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <AirportTimeBlock
          airport={leg.departure_airport}
          airportName={leg.departure_airport_name}
          time={leg.departure_time}
          datetime={leg.departure_datetime}
        />

        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800/50 bg-black/30">
          <ArrowRight className="h-5 w-5 text-sky-400" />
        </div>

        <AirportTimeBlock
          airport={leg.arrival_airport}
          airportName={leg.arrival_airport_name}
          time={leg.arrival_time}
          datetime={leg.arrival_datetime}
          alignRight
        />
      </div>
    </div>
  );
}

function AirportTimeBlock({
  airport,
  airportName,
  time,
  datetime,
  alignRight = false,
}: {
  airport?: string;
  airportName?: string;
  time?: string;
  datetime?: string;
  alignRight?: boolean;
}) {
  return (
    <div className={alignRight ? "text-right" : ""}>
      <p className="text-2xl font-light text-zinc-100">{airport || "N/A"}</p>

      <p className="mt-1 text-sm text-sky-400">{time || "N/A"}</p>

      <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
        {airportName || "Unknown airport"}
      </p>

      {datetime && (
        <p className="mt-1 text-[11px] text-zinc-600">
          {formatDateTime(datetime)}
        </p>
      )}
    </div>
  );
}

function StatsCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <p className="text-xs font-medium text-zinc-500">{label}</p>
        </div>

        <p className="text-2xl font-light text-zinc-100 break-words">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/50 bg-black/20 p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-zinc-500">{label}</span>
      </div>

      <div className="font-medium text-zinc-200">
        {value !== undefined && value !== null && value !== "" ? value : "N/A"}
      </div>
    </div>
  );
}

function formatNumber(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "N/A";
  }

  return Number(value.toFixed(0)).toLocaleString();
}

function formatDuration(minutes?: number) {
  if (minutes === undefined || minutes === null || Number.isNaN(minutes)) {
    return "N/A";
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  return `${hours}h ${mins}m`;
}

function formatDateTime(value?: string) {
  if (!value) return "N/A";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

async function parseApiResponse(response: Response) {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  throw new Error(
    `Expected JSON but received ${
      contentType || "unknown content type"
    }. Response: ${text.slice(0, 200)}`
  );
}