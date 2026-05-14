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
  BadgeCheck,
  Compass,
  Gauge,
  Hash,
  Lightbulb,
  Loader2,
  MapPin,
  Plane,
  Ruler,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";

type CodeType = "iata" | "icao";

type DistanceValue = {
  meter?: number;
  km?: number;
  mile?: number;
  nm?: number;
  feet?: number;
};

type RunwayLocation = {
  lat?: number;
  lon?: number;
};

type RunwayItem = {
  name?: string;
  trueHdg?: number;
  length?: DistanceValue;
  width?: DistanceValue;
  isClosed?: boolean;
  location?: RunwayLocation;
  surface?: string;
  displacedThreshold?: DistanceValue;
  hasLighting?: boolean;
};

export default function AirportRunwaysPage() {
  const [codeType, setCodeType] = useState<CodeType>("iata");
  const [code, setCode] = useState("DXB");

  const [runways, setRunways] = useState<RunwayItem[]>([]);
  const [searchedAirport, setSearchedAirport] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const searchAirportRunways = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setRunways([]);
      setSearchedAirport("");

      const cleanCode = code.trim().toUpperCase();

      if (!cleanCode) {
        setErrorMessage("Please enter an airport code.");
        return;
      }

      if (codeType === "iata" && cleanCode.length !== 3) {
        setErrorMessage("For IATA, use 3-letter airport codes like LHE, DXB, LHR.");
        return;
      }

      if (codeType === "icao" && cleanCode.length !== 4) {
        setErrorMessage(
          "For ICAO, use 4-letter airport codes like OPLA, OMDB, EGLL."
        );
        return;
      }

      const params = new URLSearchParams();

      params.set("codeType", codeType);
      params.set("code", cleanCode);

      const response = await fetch(
        `/api/aerodatabox/airport-runways?${params.toString()}`
      );

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setErrorMessage(data?.message || "Failed to fetch airport runway data.");
        return;
      }

      setRunways(Array.isArray(data) ? data : []);
      setSearchedAirport(cleanCode);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch airport runway data."
      );
    } finally {
      setLoading(false);
    }
  };

  const openRunways = runways.filter((runway) => !runway.isClosed).length;
  const closedRunways = runways.filter((runway) => runway.isClosed).length;
  const lightedRunways = runways.filter((runway) => runway.hasLighting).length;
  const longestRunway = getLongestRunway(runways);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-40">
      <div className="space-y-6">
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-zinc-800/50">
            <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
              <Plane className="w-7 h-7 text-sky-400" />
              Airport Runways
            </CardTitle>

            <CardDescription className="text-zinc-400">
              Search runway information for an airport, including runway name,
              heading, length, width, surface, lighting, threshold displacement,
              and operating status.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      setCode("DXB");
                    } else {
                      setCode("OMDB");
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
                  Airport Code
                </label>

                <Input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchAirportRunways();
                    }
                  }}
                  placeholder={codeType === "iata" ? "e.g., DXB" : "e.g., OMDB"}
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base uppercase"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={searchAirportRunways}
                  disabled={loading || !code.trim()}
                  className="w-full h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Searching..." : "Search Runways"}
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-zinc-500">
              <MapPin className="w-4 h-4 text-sky-400 mt-0.5" />
              <p>
                Some AeroDataBox runway results are available only for airports
                that have both ICAO and IATA codes in the database.
              </p>
            </div>
          </CardContent>
        </Card>

        {errorMessage && (
          <Card className="border-red-500/30 bg-red-500/10 backdrop-blur-sm rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 text-red-300">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />

                <div>
                  <p className="font-medium">Failed to fetch runway data</p>
                  <p className="text-sm text-red-400 mt-1 whitespace-pre-wrap">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {runways.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <StatsCard
                icon={<Plane className="w-5 h-5 text-sky-400" />}
                label="Airport"
                value={searchedAirport || "N/A"}
              />

              <StatsCard
                icon={<Hash className="w-5 h-5 text-sky-400" />}
                label="Runways"
                value={runways.length}
              />

              <StatsCard
                icon={<BadgeCheck className="w-5 h-5 text-emerald-400" />}
                label="Open"
                value={openRunways}
              />

              <StatsCard
                icon={<XCircle className="w-5 h-5 text-red-400" />}
                label="Closed"
                value={closedRunways}
              />

              <StatsCard
                icon={<Ruler className="w-5 h-5 text-sky-400" />}
                label="Longest"
                value={`${formatNumber(longestRunway?.length?.meter)} m`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {runways.map((runway, index) => (
                <RunwayCard
                  key={`${runway.name || "runway"}-${index}`}
                  runway={runway}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && !errorMessage && searchedAirport && runways.length === 0 && (
          <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Plane className="w-16 h-16 text-zinc-600 mb-4" />

              <h3 className="text-2xl font-light text-zinc-300 mb-3">
                No Runways Found
              </h3>

              <p className="text-zinc-500 max-w-md">
                No runway data was returned for this airport. Try another
                airport code or switch between IATA and ICAO.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function RunwayCard({ runway }: { runway: RunwayItem }) {
  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:border-sky-500/40 transition-all duration-300">
      <CardHeader className="pb-4 border-b border-zinc-800/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
              <Compass className="w-6 h-6 text-sky-400" />
              Runway {runway.name || "N/A"}
            </CardTitle>

            <CardDescription className="mt-2 text-zinc-400">
              Surface: {runway.surface || "Unknown"}
            </CardDescription>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium flex-shrink-0 border ${
              runway.isClosed
                ? "bg-red-500/20 text-red-400 border-red-500/30"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            }`}
          >
            {runway.isClosed ? "Closed" : "Open"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-3 mb-5">
          <MiniStat
            icon={<Compass className="w-4 h-4 text-sky-400" />}
            label="True Heading"
            value={
              runway.trueHdg !== undefined
                ? `${Math.round(runway.trueHdg)}°`
                : undefined
            }
          />

          <MiniStat
            icon={<Ruler className="w-4 h-4 text-sky-400" />}
            label="Length"
            value={`${formatNumber(runway.length?.meter)} m`}
          />

          <MiniStat
            icon={<Gauge className="w-4 h-4 text-sky-400" />}
            label="Width"
            value={`${formatNumber(runway.width?.meter)} m`}
          />

          <MiniStat
            icon={<Lightbulb className="w-4 h-4 text-sky-400" />}
            label="Lighting"
            value={runway.hasLighting ? "Yes" : "No"}
          />
        </div>

        <div className="space-y-0 divide-y divide-zinc-800/50 text-sm">
          <InfoRow label="Surface" value={runway.surface} />
          <InfoRow
            label="Length Feet"
            value={
              runway.length?.feet !== undefined
                ? `${formatNumber(runway.length.feet)} ft`
                : "N/A"
            }
          />
          <InfoRow
            label="Width Feet"
            value={
              runway.width?.feet !== undefined
                ? `${formatNumber(runway.width.feet)} ft`
                : "N/A"
            }
          />
          <InfoRow
            label="Displaced Threshold"
            value={
              runway.displacedThreshold?.meter !== undefined
                ? `${formatNumber(runway.displacedThreshold.meter)} m`
                : "N/A"
            }
          />
          <InfoRow
            label="Latitude"
            value={
              runway.location?.lat !== undefined
                ? runway.location.lat.toFixed(6)
                : "N/A"
            }
          />
          <InfoRow
            label="Longitude"
            value={
              runway.location?.lon !== undefined
                ? runway.location.lon.toFixed(6)
                : "N/A"
            }
          />
        </div>

        {runway.isClosed && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
            This runway is marked as closed in the data source.
          </div>
        )}
      </CardContent>
    </Card>
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
    <div className="p-3 bg-black/20 border border-zinc-800/50 rounded-xl">
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

function getLongestRunway(runways: RunwayItem[]) {
  if (runways.length === 0) return undefined;

  return [...runways].sort((a, b) => {
    const lengthA = a.length?.meter ?? 0;
    const lengthB = b.length?.meter ?? 0;

    return lengthB - lengthA;
  })[0];
}

function formatNumber(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "N/A";
  }

  return Math.round(value).toLocaleString();
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