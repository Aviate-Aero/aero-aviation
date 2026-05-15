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
  CloudSun,
  Compass,
  Gauge,
  Hash,
  Layers,
  Loader2,
  Map,
  MapPin,
  Navigation,
  RadioTower,
  Search,
  ShieldAlert,
  Wind,
} from "lucide-react";

type WindAloftItem = {
  altitude_ft: number | null;
  wind_direction: number | null;
  wind_speed_kt: number | null;
  light_and_variable: boolean | null;
  raw: string | null;
};

type WindsAloftStation = {
  station: string | null;
  latitude: number | null;
  longitude: number | null;
  winds: WindAloftItem[];
  raw_text: string | null;
};

type WindsAloftResponse = {
  bbox: string | null;
  forecast_hour: number | null;
  level: string | null;
  valid_time: string | null;
  stations: WindsAloftStation[];
  total: number;
};

type LevelType = "low" | "high";

export default function WindsAloftPage() {
  const [bbox, setBbox] = useState("40,-80,42,-73");
  const [forecast, setForecast] = useState(12);
  const [level, setLevel] = useState<LevelType>("low");

  const [result, setResult] = useState<WindsAloftResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const searchWindsAloft = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setResult(null);

      const cleanBbox = bbox.trim();
      const safeForecast = Math.min(Math.max(Number(forecast) || 12, 6), 24);

      if (cleanBbox && !isValidBbox(cleanBbox)) {
        setErrorMessage(
          "Invalid bbox format. Use minLat,minLon,maxLat,maxLon like 40,-80,42,-73."
        );
        return;
      }

      const params = new URLSearchParams();

      params.set("forecast", String(safeForecast));
      params.set("level", level);

      if (cleanBbox) {
        params.set("bbox", cleanBbox);
      }

      const response = await fetch(
        `/api/skylink/winds-aloft?${params.toString()}`
      );

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setErrorMessage(
          data?.message ||
            stringifyErrorDetails(data?.details) ||
            "Failed to fetch winds aloft data."
        );
        return;
      }

      setForecast(safeForecast);
      setResult(normalizeWindsAloftResponse(data));
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch winds aloft data."
      );
    } finally {
      setLoading(false);
    }
  };

  const stations = result?.stations || [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-40">
      <div className="space-y-6">
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-zinc-800/50">
            <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
              <Wind className="w-7 h-7 text-sky-400" />
              Winds Aloft
            </CardTitle>

            <CardDescription className="text-zinc-400">
              Search winds aloft forecast data by forecast hour and level,
              including station, altitude, wind direction, wind speed, and raw
              coded wind groups.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Bounding Box
                  <span className="ml-2 text-xs text-zinc-500">
                    Optional
                  </span>
                </label>

                <Input
                  type="text"
                  value={bbox}
                  onChange={(e) => {
                    setBbox(e.target.value);
                    setErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchWindsAloft();
                    }
                  }}
                  placeholder="e.g. 40,-80,42,-73"
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Forecast Hour
                  <span className="ml-2 text-xs text-zinc-500">6–24</span>
                </label>

                <Input
                  type="number"
                  min={6}
                  max={24}
                  value={forecast}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    const safeValue = Math.min(Math.max(value || 12, 6), 24);
                    setForecast(safeValue);
                    setErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchWindsAloft();
                    }
                  }}
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Level
                </label>

                <select
                  value={level}
                  onChange={(e) => {
                    setLevel(e.target.value as LevelType);
                    setErrorMessage("");
                  }}
                  className="w-full h-[42px] border border-zinc-700 rounded-full px-4 py-2 text-zinc-200 bg-black/40 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                >
                  <option value="low">Low</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="md:col-span-1 flex items-end">
                <Button
                  onClick={searchWindsAloft}
                  disabled={loading}
                  className="w-full h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Searching..." : "Search Winds"}
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-zinc-500">
              <ShieldAlert className="w-4 h-4 text-sky-400 mt-0.5" />
              <p>
                Winds aloft forecasts should be cross-checked with official
                aviation weather sources before operational use.
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
                  <p className="font-medium">Failed to fetch winds aloft</p>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <StatsCard
                icon={<Map className="w-5 h-5 text-sky-400" />}
                label="Bounding Box"
                value={result.bbox || bbox || "Default / API"}
              />

              <StatsCard
                icon={<Gauge className="w-5 h-5 text-sky-400" />}
                label="Forecast"
                value={`${result.forecast_hour ?? forecast} hr`}
              />

              <StatsCard
                icon={<Layers className="w-5 h-5 text-sky-400" />}
                label="Level"
                value={result.level || level}
              />

              <StatsCard
                icon={<RadioTower className="w-5 h-5 text-sky-400" />}
                label="Valid Time"
                value={result.valid_time || "N/A"}
              />

              <StatsCard
                icon={<Hash className="w-5 h-5 text-sky-400" />}
                label="Stations"
                value={result.total ?? stations.length}
              />
            </div>

            {stations.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {stations.map((station, index) => (
                  <WindsAloftStationCard
                    key={`${station.station || "station"}-${index}`}
                    station={station}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <Wind className="w-16 h-16 text-zinc-600 mb-4" />

                  <h3 className="text-2xl font-light text-zinc-300 mb-3">
                    No Winds Aloft Data Found
                  </h3>

                  <p className="text-zinc-500 max-w-md">
                    No winds aloft stations were returned for the selected
                    forecast, level, and area.
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

function WindsAloftStationCard({
  station,
  index,
}: {
  station: WindsAloftStation;
  index: number;
}) {
  const winds = Array.isArray(station.winds) ? station.winds : [];

  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:border-sky-500/40 transition-all duration-300">
      <CardHeader className="pb-4 border-b border-zinc-800/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
              <RadioTower className="w-6 h-6 text-sky-400" />
              {displayText(station.station, `Station ${index + 1}`)}
            </CardTitle>

            <CardDescription className="mt-2 text-zinc-400">
              Lat {formatCoordinate(station.latitude)}, Lon{" "}
              {formatCoordinate(station.longitude)}
            </CardDescription>
          </div>

          <span className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
            {winds.length} wind level{winds.length === 1 ? "" : "s"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {winds.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {winds.map((wind, index) => (
              <WindLevelCard key={`${wind.altitude_ft || "alt"}-${index}`} wind={wind} />
            ))}
          </div>
        )}

        {station.raw_text && (
          <div className="rounded-xl border border-zinc-800/50 bg-black/20 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Raw Forecast Text
            </p>

            <p className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-zinc-300">
              {station.raw_text}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WindLevelCard({ wind }: { wind: WindAloftItem }) {
  return (
    <div className="rounded-xl border border-zinc-800/50 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-sky-400" />
          <span className="text-sm font-medium text-zinc-200">
            {wind.altitude_ft !== null && wind.altitude_ft !== undefined
              ? `${formatNumber(wind.altitude_ft)} ft`
              : "Altitude N/A"}
          </span>
        </div>

        <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-xs text-sky-400">
          {displayText(wind.raw)}
        </span>
      </div>

      <div className="space-y-0 divide-y divide-zinc-800/50 text-sm">
        <InfoRow
          label="Direction"
          value={
            wind.light_and_variable
              ? "Light & variable"
              : wind.wind_direction !== null && wind.wind_direction !== undefined
              ? `${Math.round(wind.wind_direction)}°`
              : "N/A"
          }
        />

        <InfoRow
          label="Speed"
          value={
            wind.wind_speed_kt !== null && wind.wind_speed_kt !== undefined
              ? `${formatNumber(wind.wind_speed_kt)} kt`
              : "N/A"
          }
        />

        <InfoRow
          label="Light & Variable"
          value={wind.light_and_variable ? "Yes" : "No"}
        />
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

        <p className="text-2xl font-light text-zinc-100 break-words">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <span className="text-zinc-500 font-medium">{label}</span>

      <span className="text-right text-zinc-200 font-medium break-words">
        {value !== undefined && value !== null && value !== "" ? value : "N/A"}
      </span>
    </div>
  );
}

function displayText(value: string | null | undefined, fallback = "N/A") {
  if (value === undefined || value === null || value.trim() === "") {
    return fallback;
  }

  return value;
}

function formatNumber(value: number | null | undefined) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "N/A";
  }

  return Number(value.toFixed(0)).toLocaleString();
}

function formatCoordinate(value: number | null | undefined) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "N/A";
  }

  return value.toFixed(4);
}

function normalizeWindsAloftResponse(data: unknown): WindsAloftResponse {
  if (typeof data !== "object" || data === null) {
    return {
      bbox: null,
      forecast_hour: null,
      level: null,
      valid_time: null,
      stations: [],
      total: 0,
    };
  }

  const value = data as Partial<WindsAloftResponse>;

  return {
    bbox: value.bbox ?? null,
    forecast_hour:
      typeof value.forecast_hour === "number" ? value.forecast_hour : null,
    level: value.level ?? null,
    valid_time: value.valid_time ?? null,
    stations: Array.isArray(value.stations) ? value.stations : [],
    total:
      typeof value.total === "number"
        ? value.total
        : Array.isArray(value.stations)
        ? value.stations.length
        : 0,
  };
}

function isValidBbox(value: string) {
  const parts = value.split(",").map((part) => Number(part.trim()));

  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [minLat, minLon, maxLat, maxLon] = parts;

  return (
    minLat >= -90 &&
    minLat <= 90 &&
    maxLat >= -90 &&
    maxLat <= 90 &&
    minLon >= -180 &&
    minLon <= 180 &&
    maxLon >= -180 &&
    maxLon <= 180 &&
    minLat < maxLat &&
    minLon < maxLon
  );
}

function stringifyErrorDetails(details: unknown) {
  if (!details) return "";

  if (typeof details === "string") {
    return details;
  }

  try {
    return JSON.stringify(details, null, 2);
  } catch {
    return "Unknown error details.";
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