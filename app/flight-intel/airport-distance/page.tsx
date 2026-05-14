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
  Plane,
  Search,
  AlertCircle,
  Loader2,
  Route,
  Clock,
  MapPin,
  Gauge,
  Ruler,
  Navigation,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";

type CodeType = "iata" | "icao";
type FlightTimeModel = "Standard" | "ML01";

type AirportLocation = {
  lat?: number;
  lon?: number;
};

type AirportInfo = {
  icao?: string;
  iata?: string;
  localCode?: string;
  name?: string;
  shortName?: string;
  municipalityName?: string;
  location?: AirportLocation;
  countryCode?: string;
  timeZone?: string;
};

type DistanceInfo = {
  meter?: number;
  km?: number;
  mile?: number;
  nm?: number;
  feet?: number;
};

type DistanceTimeResponse = {
  from: AirportInfo;
  to: AirportInfo;
  greatCircleDistance: DistanceInfo;
  approxFlightTime: string;
};

export default function DistanceTimePage() {
  const [codeType, setCodeType] = useState<CodeType>("iata");
  const [codeFrom, setCodeFrom] = useState("LHE");
  const [codeTo, setCodeTo] = useState("DXB");
  const [aircraftName, setAircraftName] = useState("A320");
  const [flightTimeModel, setFlightTimeModel] =
    useState<FlightTimeModel>("ML01");

  const [result, setResult] = useState<DistanceTimeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const searchDistanceTime = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setResult(null);

      const cleanCodeFrom = codeFrom.trim().toUpperCase();
      const cleanCodeTo = codeTo.trim().toUpperCase();
      const cleanAircraftName = aircraftName.trim();

      if (!cleanCodeFrom || !cleanCodeTo) {
        setErrorMessage("Please enter both origin and destination airport codes.");
        return;
      }

      if (codeType === "iata" && (cleanCodeFrom.length !== 3 || cleanCodeTo.length !== 3)) {
        setErrorMessage("For IATA, use 3-letter airport codes like LHE, DXB, LHR.");
        return;
      }

      if (codeType === "icao" && (cleanCodeFrom.length !== 4 || cleanCodeTo.length !== 4)) {
        setErrorMessage("For ICAO, use 4-letter airport codes like OPLA, OMDB, EGLL.");
        return;
      }

      const params = new URLSearchParams();

      params.set("codeType", codeType);
      params.set("codeFrom", cleanCodeFrom);
      params.set("codeTo", cleanCodeTo);
      params.set("flightTimeModel", flightTimeModel);

      if (cleanAircraftName) {
        params.set("aircraftName", cleanAircraftName);
      }

      const response = await fetch(
        `/api/aerodatabox/airport-distance?${params.toString()}`
      );

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setErrorMessage(data?.message || "Failed to fetch distance and flight time.");
        return;
      }

      setResult(data);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch distance and flight time."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-40">
      <div className="space-y-6">
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-zinc-800/50">
            <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
              <Route className="w-7 h-7 text-sky-400" />
              Distance & Flight Time
            </CardTitle>

            <CardDescription className="text-zinc-400">
              Calculate great circle distance and estimated flight time between
              two airports. Use ML01 for machine-learning based route and
              aircraft-aware estimates.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Code Type
                </label>

                <select
                  value={codeType}
                  onChange={(e) => {
                    const nextCodeType = e.target.value as CodeType;
                    setCodeType(nextCodeType);
                    setErrorMessage("");

                    if (nextCodeType === "iata") {
                      setCodeFrom("LHE");
                      setCodeTo("DXB");
                    } else {
                      setCodeFrom("OPLA");
                      setCodeTo("OMDB");
                    }
                  }}
                  className="w-full h-[42px] border border-zinc-700 rounded-full px-4 py-2 text-zinc-200 bg-black/40 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                >
                  <option value="iata">IATA</option>
                  <option value="icao">ICAO</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  From Airport
                </label>

                <Input
                  type="text"
                  value={codeFrom}
                  onChange={(e) => {
                    setCodeFrom(e.target.value.toUpperCase());
                    setErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchDistanceTime();
                    }
                  }}
                  placeholder={codeType === "iata" ? "e.g., LHE" : "e.g., OPLA"}
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  To Airport
                </label>

                <Input
                  type="text"
                  value={codeTo}
                  onChange={(e) => {
                    setCodeTo(e.target.value.toUpperCase());
                    setErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchDistanceTime();
                    }
                  }}
                  placeholder={codeType === "iata" ? "e.g., DXB" : "e.g., OMDB"}
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Aircraft Type
                </label>

                <Input
                  type="text"
                  value={aircraftName}
                  onChange={(e) => {
                    setAircraftName(e.target.value.toUpperCase());
                    setErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchDistanceTime();
                    }
                  }}
                  placeholder="e.g., A320, B738"
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Time Model
                </label>

                <select
                  value={flightTimeModel}
                  onChange={(e) =>
                    setFlightTimeModel(e.target.value as FlightTimeModel)
                  }
                  className="w-full h-[42px] border border-zinc-700 rounded-full px-4 py-2 text-zinc-200 bg-black/40 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                >
                  <option value="ML01">ML01</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={searchDistanceTime}
                disabled={loading || !codeFrom.trim() || !codeTo.trim()}
                className="h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                <Search className="w-4 h-4 mr-2" />
                {loading ? "Calculating..." : "Calculate Flight Time"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {errorMessage && (
          <Card className="border-red-500/30 bg-red-500/10 backdrop-blur-sm rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 text-red-300">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />

                <div>
                  <p className="font-medium">Failed to calculate flight time</p>
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
                icon={<Ruler className="w-5 h-5 text-sky-400" />}
                label="Great Circle Distance"
                value={`${formatNumber(result.greatCircleDistance?.km)} km`}
              />

              <StatsCard
                icon={<Navigation className="w-5 h-5 text-sky-400" />}
                label="Nautical Miles"
                value={`${formatNumber(result.greatCircleDistance?.nm)} NM`}
              />

              <StatsCard
                icon={<Clock className="w-5 h-5 text-sky-400" />}
                label="Approx Flight Time"
                value={formatDuration(result.approxFlightTime)}
              />

              <StatsCard
                icon={<BadgeCheck className="w-5 h-5 text-emerald-400" />}
                label="Model Used"
                value={flightTimeModel}
              />
            </div>

            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 border-b border-zinc-800/50">
                <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
                  <Plane className="w-6 h-6 text-sky-400" />
                  Route Summary
                </CardTitle>

                <CardDescription className="text-zinc-400">
                  Airport pair, distance units, and estimated block-style flight time.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-stretch ">
                  <AirportCard title="Origin" airport={result.from} />

                  <div className="hidden lg:flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10">
                      <ArrowRight className="w-6 h-6 text-sky-400" />
                    </div>
                  </div>

                  <AirportCard title="Destination" airport={result.to} />
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MiniStat
                    icon={<Ruler className="w-4 h-4 text-sky-400" />}
                    label="Kilometers"
                    value={`${formatNumber(result.greatCircleDistance?.km)} km`}
                  />

                  <MiniStat
                    icon={<Navigation className="w-4 h-4 text-sky-400" />}
                    label="Nautical Miles"
                    value={`${formatNumber(result.greatCircleDistance?.nm)} NM`}
                  />

                  <MiniStat
                    icon={<Gauge className="w-4 h-4 text-sky-400" />}
                    label="Statute Miles"
                    value={`${formatNumber(result.greatCircleDistance?.mile)} mi`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function AirportCard({
  title,
  airport,
}: {
  title: string;
  airport: AirportInfo;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-black/20 p-5">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-sky-400 mt-2 ml-2" />
        <span className="text-sm font-medium text-sky-400 mt-2">{title}</span>
      </div>

      <h3 className="text-2xl font-light text-zinc-100 mb-1 ml-2">
        {airport.iata || airport.icao || "N/A"}
      </h3>

      <p className="text-sm text-zinc-400 mb-4 ml-2">
        {airport.name || airport.shortName || "Unknown airport"}
      </p>

      <div className="space-y-0 divide-y divide-zinc-800/50 text-sm ml-2">
        <InfoRow label="ICAO" value={airport.icao} />
        <InfoRow label="IATA" value={airport.iata} />
        <InfoRow label="City" value={airport.municipalityName} />
        <InfoRow label="Country" value={airport.countryCode} />
        <InfoRow label="Timezone" value={airport.timeZone} />
      </div>
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

        <p className="text-2xl font-light text-zinc-100">{value}</p>
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
    <div className="p-4 bg-black/20 border border-zinc-800/50 rounded-xl">
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

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <span className="text-zinc-500 font-medium">{label}</span>

      <span className="text-right text-zinc-200 font-medium">
        {value !== undefined && value !== null && value !== "" ? value : "N/A"}
      </span>
    </div>
  );
}

function formatNumber(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "N/A";
  }

  return Math.round(value).toLocaleString();
}

function formatDuration(value?: string) {
  if (!value) return "N/A";

  const parts = value.split(":");

  if (parts.length < 2) return value;

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return value;
  }

  return `${hours}h ${minutes}m`;
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