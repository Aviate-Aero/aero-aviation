"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CircleDot,
  Clock,
  Filter,
  Gauge,
  Globe2,
  Hash,
  Layers,
  Loader2,
  MapPinned,
  Plane,
  Radar,
  RefreshCw,
  Route,
  Satellite,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/badge/Standard";
import { Button } from "@/components/buttons/Standard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card/Standard";
import { Input } from "@/components/input/Standard";

type CountResult = {
  record_count: number;
  filters: Record<string, string>;
  source: string;
  endpoint: string;
  timestamp: number;
  timestamp_iso: string;
  retrieved_at: string;
};

type FilterState = {
  timestamp: string;
  timestampLocal: string;
  bounds: string;
  flights: string;
  callsigns: string;
  registrations: string;
  airports: string;
  routes: string;
  aircraft: string;
  altitude_ranges: string;
  gspeed: string;
  categories: string;
  data_sources: string;
  operating_as: string;
  painted_as: string;
  squawks: string;
};

const now = new Date();
const DEFAULT_TIMESTAMP = Math.floor((now.getTime() - 24 * 60 * 60 * 1000) / 1000);

const INITIAL_FILTERS: FilterState = {
  timestamp: String(DEFAULT_TIMESTAMP),
  timestampLocal: toDateTimeLocal(DEFAULT_TIMESTAMP),
  bounds: "",
  flights: "",
  callsigns: "",
  registrations: "",
  airports: "",
  routes: "",
  aircraft: "",
  altitude_ranges: "",
  gspeed: "",
  categories: "",
  data_sources: "",
  operating_as: "",
  painted_as: "",
  squawks: "",
};

const BOUND_PRESETS = [
  {
    label: "Europe West",
    bounds: "55.8,35.6,-11.0,24.5",
    description: "Western and central European traffic",
  },
  {
    label: "Gulf",
    bounds: "31.5,20.0,44.0,60.5",
    description: "UAE, Qatar, Bahrain, and nearby FIR traffic",
  },
  {
    label: "Pakistan",
    bounds: "37.1,23.4,60.7,77.8",
    description: "Pakistan domestic and overflight activity",
  },
  {
    label: "North Atlantic",
    bounds: "65.0,38.0,-75.0,-5.0",
    description: "Oceanic corridor snapshot",
  },
];

const TIME_PRESETS = [
  { label: "1 hour ago", seconds: 60 * 60 },
  { label: "6 hours ago", seconds: 6 * 60 * 60 },
  { label: "24 hours ago", seconds: 24 * 60 * 60 },
  { label: "7 days ago", seconds: 7 * 24 * 60 * 60 },
];

const CATEGORY_OPTIONS = [
  { value: "P", label: "Passenger" },
  { value: "C", label: "Cargo" },
  { value: "M", label: "Military" },
  { value: "J", label: "Business Jets" },
  { value: "T", label: "General Aviation" },
  { value: "H", label: "Helicopters" },
];

const SOURCE_OPTIONS = ["ADSB", "MLAT", "UAT", "ESTIMATED"];

export default function HistoricFlightCountPage() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [result, setResult] = useState<CountResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const activeFilters = useMemo(() => {
    return Object.entries(filters).filter(
      ([key, value]) => key !== "timestampLocal" && value.trim()
    );
  }, [filters]);

  const fetchCount = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");
      setResult(null);

      const params = new URLSearchParams();

      for (const [key, value] of Object.entries(filters)) {
        if (key === "timestampLocal") continue;

        const cleanedValue =
          key === "timestamp" || key === "gspeed"
            ? value.trim()
            : normalizeListValue(value);

        if (cleanedValue) {
          params.set(key, cleanedValue);
        }
      }

      const response = await fetch(
        `/api/historic-flight-positions-count?${params.toString()}`
      );
      const data = await parseApiResponse(response);

      if (!response.ok) {
        setErrorMessage(
          getErrorMessage(data) ||
            "Failed to fetch historic flight position count."
        );
        return;
      }

      if (!isCountResult(data)) {
        setErrorMessage("Unexpected historic count response from the server.");
        return;
      }

      setResult(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch historic flight position count."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateTimestampFromLocal = (value: string) => {
    const date = new Date(value);

    setFilters((current) => ({
      ...current,
      timestampLocal: value,
      timestamp: Number.isNaN(date.getTime())
        ? current.timestamp
        : String(Math.floor(date.getTime() / 1000)),
    }));
  };

  const applyTimePreset = (secondsAgo: number) => {
    const timestamp = Math.floor((Date.now() - secondsAgo * 1000) / 1000);

    setFilters((current) => ({
      ...current,
      timestamp: String(timestamp),
      timestampLocal: toDateTimeLocal(timestamp),
    }));
  };

  const toggleCommaToken = (key: keyof FilterState, token: string) => {
    setFilters((current) => {
      const values = splitList(current[key]);
      const hasToken = values.includes(token);
      const nextValues = hasToken
        ? values.filter((value) => value !== token)
        : [...values, token];

      return {
        ...current,
        [key]: nextValues.join(","),
      };
    });
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setResult(null);
    setErrorMessage("");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white mt-40">
      <section className="relative z-20 mx-auto w-full max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>

            <h1 className="text-3xl font-light text-zinc-100 md:text-5xl">
              Historic Flight Positions Count
            </h1>

            <p className="mt-3 max-w-3xl text-base text-zinc-400">
              Count aircraft positions at one exact historical timestamp, then
              narrow the snapshot by region, airport, route, aircraft type,
              category, speed, and source.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <MiniMetric
              icon={<Filter className="h-4 w-4 text-sky-400" />}
              label="Active Filters"
              value={activeFilters.length}
            />
            <MiniMetric
              icon={<Clock className="h-4 w-4 text-purple-400" />}
              label="Mode"
              value="Historic"
            />
          </div>
        </div>

        <form onSubmit={fetchCount} className="space-y-6">
          <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
                <CalendarClock className="h-7 w-7 text-purple-400" />
                Historical Snapshot Time
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Historic counts require one Unix timestamp in seconds. Time
                ranges are not supported by this FR24 endpoint.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <FilterField
                  label="Date and Time"
                  value={filters.timestampLocal}
                  type="datetime-local"
                  placeholder=""
                  hint="Converted locally into a Unix timestamp for FR24."
                  icon={<CalendarClock className="h-4 w-4 text-purple-400" />}
                  onChange={updateTimestampFromLocal}
                  preserveCase
                />
                <FilterField
                  label="Unix Timestamp"
                  value={filters.timestamp}
                  placeholder="1702383145"
                  hint="Required. Must be later than May 11, 2016."
                  icon={<Hash className="h-4 w-4 text-sky-400" />}
                  onChange={(value) => {
                    updateFilter("timestamp", value.replace(/\D/g, ""));
                    const timestamp = Number(value);
                    if (Number.isFinite(timestamp)) {
                      updateFilter("timestampLocal", toDateTimeLocal(timestamp));
                    }
                  }}
                  preserveCase
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {TIME_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyTimePreset(preset.seconds)}
                    className="rounded-full border border-zinc-800 bg-black/20 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-purple-500/50 hover:text-purple-300"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
                <MapPinned className="h-7 w-7 text-sky-400" />
                Area and Airport Filters
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Pick an area preset or filter by airport, country, and traffic
                direction at the selected timestamp.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-3 md:grid-cols-4">
                {BOUND_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => updateFilter("bounds", preset.bounds)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      filters.bounds === preset.bounds
                        ? "border-sky-500 bg-sky-500/10"
                        : "border-zinc-800/50 bg-black/20 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-zinc-100">
                        {preset.label}
                      </span>
                      <Globe2 className="h-4 w-4 text-sky-400" />
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">
                      {preset.description}
                    </p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <FilterField
                  label="Bounds"
                  value={filters.bounds}
                  placeholder="50.682,46.218,14.422,22.243"
                  hint="North, south, west, east."
                  icon={<MapPinned className="h-4 w-4 text-sky-400" />}
                  onChange={(value) => updateFilter("bounds", value)}
                />
                <FilterField
                  label="Airports and Countries"
                  value={filters.airports}
                  placeholder="LHR,SE,inbound:WAW,outbound:JFK"
                  hint="IATA, ICAO, country code, or direction:code."
                  icon={<Plane className="h-4 w-4 text-emerald-400" />}
                  onChange={(value) => updateFilter("airports", value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <FilterPanel
              title="Flight Identity"
              description="Target historical positions for exact flights, callsigns, registrations, or operators."
              icon={<Hash className="h-5 w-5 text-sky-400" />}
            >
              <FilterField label="Flight Numbers" value={filters.flights} placeholder="CA4515,UA1742" hint="Max 15 comma-separated values." onChange={(value) => updateFilter("flights", value)} />
              <FilterField label="Callsigns" value={filters.callsigns} placeholder="WJA329,WSW102" hint="Operational callsigns." onChange={(value) => updateFilter("callsigns", value)} />
              <FilterField label="Registrations" value={filters.registrations} placeholder="D-AFAM,EC-MQM" hint="Aircraft registration numbers." onChange={(value) => updateFilter("registrations", value)} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FilterField label="Operating As" value={filters.operating_as} placeholder="SAS,ART" hint="Airline callsign ICAO." onChange={(value) => updateFilter("operating_as", value)} />
                <FilterField label="Painted As" value={filters.painted_as} placeholder="SAS,ART" hint="Aircraft livery ICAO." onChange={(value) => updateFilter("painted_as", value)} />
              </div>
            </FilterPanel>

            <FilterPanel
              title="Route and Aircraft"
              description="Count historical positions by route, type, squawk, altitude, or speed."
              icon={<Route className="h-5 w-5 text-emerald-400" />}
            >
              <FilterField label="Routes" value={filters.routes} placeholder="SE-US,ESSA-JFK" hint="Airport or country pairs." onChange={(value) => updateFilter("routes", value)} />
              <FilterField label="Aircraft Types" value={filters.aircraft} placeholder="B38M,B738" hint="ICAO aircraft type codes." onChange={(value) => updateFilter("aircraft", value)} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FilterField label="Squawks" value={filters.squawks} placeholder="6135,7070" hint="Hex squawk codes." onChange={(value) => updateFilter("squawks", value)} />
                <FilterField label="Ground Speed" value={filters.gspeed} placeholder="120-140 or 80" hint="Single value or range in knots." icon={<Gauge className="h-4 w-4 text-emerald-400" />} onChange={(value) => updateFilter("gspeed", value)} />
              </div>
              <FilterField label="Altitude Ranges" value={filters.altitude_ranges} placeholder="0-3000,5000-7000" hint="Barometric altitude above mean sea level, in feet." icon={<Layers className="h-4 w-4 text-purple-400" />} onChange={(value) => updateFilter("altitude_ranges", value)} />
            </FilterPanel>
          </div>

          <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
                <SlidersHorizontal className="h-6 w-6 text-sky-400" />
                Category and Data Source
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Refine the historical snapshot by aircraft class and position
                source.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-6">
              <TokenSelector
                label="Categories"
                tokens={CATEGORY_OPTIONS.map((option) => option.value)}
                labels={Object.fromEntries(
                  CATEGORY_OPTIONS.map((option) => [option.value, option.label])
                )}
                selected={splitList(filters.categories)}
                onToggle={(token) => toggleCommaToken("categories", token)}
              />
              <TokenSelector
                label="Data Sources"
                tokens={SOURCE_OPTIONS}
                selected={splitList(filters.data_sources)}
                onToggle={(token) => toggleCommaToken("data_sources", token)}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(([key, value]) => (
                <Badge
                  key={key}
                  variant="outline"
                  className="h-auto border-purple-500/30 bg-purple-500/10 px-3 py-1 text-purple-300"
                >
                  {formatLabel(key)}: {truncate(value, 28)}
                </Badge>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                className="h-[42px] rounded-full border-zinc-700 bg-black/40 px-5 text-zinc-300 hover:bg-zinc-800"
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={loading || !filters.timestamp.trim()}
                className="h-[42px] rounded-full bg-sky-500 px-6 text-white shadow-lg shadow-sky-500/20 transition-all duration-300 hover:bg-sky-600 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {loading ? "Counting..." : "Get Historic Count"}
              </Button>
            </div>
          </div>
        </form>

        {errorMessage && (
          <Card className="mt-6 border-red-500/30 bg-red-500/10 backdrop-blur-sm rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 text-red-300">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">
                    Failed to fetch historic position count
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-red-400">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <section className="mt-6 space-y-6">
            <Card className="border-purple-500/30 bg-purple-500/10 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-purple-300">
                      <CircleDot className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        Historical aircraft positions
                      </span>
                    </div>
                    <p className="text-5xl font-light text-white md:text-7xl">
                      {result.record_count.toLocaleString()}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <ResultFact icon={<CalendarClock className="h-4 w-4 text-purple-400" />} label="Snapshot" value={formatDateTime(result.timestamp_iso)} />
                    <ResultFact icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />} label="Source" value={result.source} />
                    <ResultFact icon={<Activity className="h-4 w-4 text-sky-400" />} label="Endpoint" value="Historic Count" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50 pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
                  <Filter className="h-6 w-6 text-purple-400" />
                  Applied Filter Summary
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  The count above is based on these FlightRadar24 historic query
                  filters.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(result.filters).map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-zinc-800/50 bg-black/20 p-4"
                    >
                      <p className="mb-1 text-xs text-zinc-500">
                        {formatLabel(key)}
                      </p>
                      <p className="break-words text-sm text-zinc-100">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {!result && !errorMessage && !loading && (
          <Card className="mt-6 border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl mb-20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Radar className="mb-5 h-20 w-20 text-zinc-600" />
              <h2 className="mb-2 text-2xl font-light text-zinc-300">
                Ready for a Historic Count
              </h2>
              <p className="max-w-2xl text-zinc-500">
                Choose the exact snapshot time, add optional operational
                filters, then count historical aircraft positions.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}

function FilterPanel({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-zinc-800/50 pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
          {icon}
          {title}
        </CardTitle>
        <CardDescription className="text-zinc-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">{children}</CardContent>
    </Card>
  );
}

function FilterField({
  label,
  value,
  placeholder,
  hint,
  icon,
  type = "text",
  preserveCase = false,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  hint: string;
  icon?: React.ReactNode;
  type?: string;
  preserveCase?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
        {icon}
        {label}
      </span>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(preserveCase ? event.target.value : event.target.value.toUpperCase())
        }
        className="h-[42px] rounded-xl border-zinc-700 bg-black/40 px-4 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-sky-500 focus:ring-sky-500/30"
      />
      <span className="mt-2 block text-xs text-zinc-500">{hint}</span>
    </label>
  );
}

function TokenSelector({
  label,
  tokens,
  labels = {},
  selected,
  onToggle,
}: {
  label: string;
  tokens: string[];
  labels?: Record<string, string>;
  selected: string[];
  onToggle: (token: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-zinc-300">{label}</p>
      <div className="flex flex-wrap gap-2">
        {tokens.map((token) => {
          const isSelected = selected.includes(token);

          return (
            <button
              key={token}
              type="button"
              onClick={() => onToggle(token)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-all ${
                isSelected
                  ? "border-purple-500 bg-purple-500/15 text-purple-300"
                  : "border-zinc-800 bg-black/20 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              <span className="font-mono">{token}</span>
              {labels[token] && (
                <>
                  <ArrowRight className="h-3 w-3 text-zinc-600" />
                  <span>{labels[token]}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MiniMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 px-4 py-3 backdrop-blur-xl">
      <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
        {icon}
        {label}
      </div>
      <div className="text-lg font-light text-zinc-100">{value}</div>
    </div>
  );
}

function ResultFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-44 rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-zinc-400">
        {icon}
        {label}
      </div>
      <div className="text-sm text-zinc-100">{value}</div>
    </div>
  );
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeListValue(value: string) {
  return splitList(value).join(",");
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

function toDateTimeLocal(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3)}...`;
}

function isCountResult(value: unknown): value is CountResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const result = value as Partial<CountResult>;

  return (
    typeof result.record_count === "number" &&
    typeof result.source === "string" &&
    typeof result.endpoint === "string" &&
    typeof result.retrieved_at === "string" &&
    typeof result.timestamp === "number" &&
    typeof result.timestamp_iso === "string" &&
    typeof result.filters === "object" &&
    result.filters !== null &&
    !Array.isArray(result.filters)
  );
}

function getErrorMessage(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  const maybeError = value as { error?: unknown; message?: unknown };

  if (typeof maybeError.error === "string") {
    return maybeError.error;
  }

  if (typeof maybeError.message === "string") {
    return maybeError.message;
  }

  return "";
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
