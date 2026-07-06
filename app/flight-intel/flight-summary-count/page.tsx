"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CircleDot,
  Clock,
  FileSearch,
  Filter,
  Hash,
  Loader2,
  Plane,
  Radar,
  RefreshCw,
  Route,
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

type QueryMode = "dateRange" | "flightIds";

type CountResult = {
  record_count: number;
  filters: Record<string, string>;
  source: string;
  endpoint: string;
  retrieved_at: string;
};

type FilterState = {
  flight_ids: string;
  flight_datetime_from: string;
  flight_datetime_to: string;
  flights: string;
  callsigns: string;
  registrations: string;
  airports: string;
  routes: string;
  aircraft: string;
  operating_as: string;
  painted_as: string;
};

const DEFAULT_TO = new Date();
const DEFAULT_FROM = new Date(DEFAULT_TO.getTime() - 24 * 60 * 60 * 1000);

const INITIAL_FILTERS: FilterState = {
  flight_ids: "",
  flight_datetime_from: toDateTimeLocal(DEFAULT_FROM),
  flight_datetime_to: toDateTimeLocal(DEFAULT_TO),
  flights: "",
  callsigns: "",
  registrations: "",
  airports: "",
  routes: "",
  aircraft: "",
  operating_as: "",
  painted_as: "",
};

const RANGE_PRESETS = [
  { label: "Last 24h", hours: 24 },
  { label: "Last 3 days", hours: 72 },
  { label: "Last 7 days", hours: 168 },
  { label: "Last 14 days", hours: 336 },
];

export default function FlightSummaryCountPage() {
  const [mode, setMode] = useState<QueryMode>("dateRange");
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [result, setResult] = useState<CountResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const activeFilters = useMemo(() => {
    const excluded =
      mode === "flightIds"
        ? ["flight_datetime_from", "flight_datetime_to"]
        : ["flight_ids"];

    return Object.entries(filters).filter(
      ([key, value]) => !excluded.includes(key) && value.trim()
    );
  }, [filters, mode]);

  const fetchCount = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");
      setResult(null);

      const params = new URLSearchParams();

      if (mode === "flightIds") {
        const flightIds = normalizeListValue(filters.flight_ids);
        if (flightIds) params.set("flight_ids", flightIds);
      } else {
        params.set(
          "flight_datetime_from",
          toFr24DateTime(filters.flight_datetime_from)
        );
        params.set("flight_datetime_to", toFr24DateTime(filters.flight_datetime_to));
      }

      for (const [key, value] of Object.entries(filters)) {
        if (
          key === "flight_ids" ||
          key === "flight_datetime_from" ||
          key === "flight_datetime_to"
        ) {
          continue;
        }

        const cleanedValue = normalizeListValue(value);
        if (cleanedValue) params.set(key, cleanedValue);
      }

      const response = await fetch(`/api/flight-summary-count?${params.toString()}`);
      const data = await parseApiResponse(response);

      if (!response.ok) {
        setErrorMessage(
          getErrorMessage(data) || "Failed to fetch flight summary count."
        );
        return;
      }

      if (!isCountResult(data)) {
        setErrorMessage("Unexpected flight summary count response.");
        return;
      }

      setResult(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch flight summary count."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const applyRangePreset = (hours: number) => {
    const to = new Date();
    const from = new Date(to.getTime() - hours * 60 * 60 * 1000);

    setFilters((current) => ({
      ...current,
      flight_datetime_from: toDateTimeLocal(from),
      flight_datetime_to: toDateTimeLocal(to),
    }));
  };

  const resetFilters = () => {
    setMode("dateRange");
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
              Flight Summary Count
            </h1>
            <p className="mt-3 max-w-3xl text-base text-zinc-400">
              Count flight summary records by date range, flight number,
              callsign, registration, airport, route, aircraft type, operator,
              or exact FR24 IDs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <MiniMetric
              icon={<Filter className="h-4 w-4 text-sky-400" />}
              label="Active Filters"
              value={activeFilters.length}
            />
            <MiniMetric
              icon={<Radar className="h-4 w-4 text-emerald-400" />}
              label="Mode"
              value={mode === "dateRange" ? "Date Range" : "FR24 IDs"}
            />
          </div>
        </div>

        <form onSubmit={fetchCount} className="space-y-6">
          <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
                <SlidersHorizontal className="h-7 w-7 text-sky-400" />
                Query Mode
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Use a maximum 14-day date range, or count exact FR24 summary IDs.
                The two modes cannot be combined.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <ModeButton
                  active={mode === "dateRange"}
                  title="Date Range"
                  description="Count summaries by first_seen date and optional filters."
                  icon={<CalendarDays className="h-5 w-5 text-sky-400" />}
                  onClick={() => setMode("dateRange")}
                />
                <ModeButton
                  active={mode === "flightIds"}
                  title="FR24 IDs"
                  description="Count exact fr24_id values, without date filters."
                  icon={<Hash className="h-5 w-5 text-purple-400" />}
                  onClick={() => setMode("flightIds")}
                />
              </div>

              {mode === "dateRange" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <FilterField
                      label="From"
                      value={filters.flight_datetime_from}
                      type="datetime-local"
                      placeholder=""
                      hint="Lower date range, based on first_seen."
                      icon={<Clock className="h-4 w-4 text-sky-400" />}
                      preserveCase
                      onChange={(value) => updateFilter("flight_datetime_from", value)}
                    />
                    <FilterField
                      label="To"
                      value={filters.flight_datetime_to}
                      type="datetime-local"
                      placeholder=""
                      hint="Upper date range. Maximum span is 14 days."
                      icon={<Clock className="h-4 w-4 text-emerald-400" />}
                      preserveCase
                      onChange={(value) => updateFilter("flight_datetime_to", value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {RANGE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyRangePreset(preset.hours)}
                        className="rounded-full border border-zinc-800 bg-black/20 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-sky-500/50 hover:text-sky-300"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <FilterField
                  label="FR24 IDs"
                  value={filters.flight_ids}
                  placeholder="391fdd79,35f2ffd9"
                  hint="Maximum 15 fr24_ids. Cannot be combined with flight date filters."
                  icon={<Hash className="h-4 w-4 text-purple-400" />}
                  onChange={(value) => updateFilter("flight_ids", value)}
                />
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <FilterPanel
              title="Flight Identity"
              description="Narrow the count by flight number, callsign, registration, or airline identity."
              icon={<Hash className="h-5 w-5 text-sky-400" />}
            >
              <FilterField label="Flight Numbers" value={filters.flights} placeholder="EK184,UA1742" hint="Max 15 comma-separated values." onChange={(value) => updateFilter("flights", value)} />
              <FilterField label="Callsigns" value={filters.callsigns} placeholder="UAE184,WJA329" hint="Operational callsigns." onChange={(value) => updateFilter("callsigns", value)} />
              <FilterField label="Registrations" value={filters.registrations} placeholder="D-AFAM,EC-MQM" hint="Aircraft registration numbers." onChange={(value) => updateFilter("registrations", value)} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FilterField label="Operating As" value={filters.operating_as} placeholder="SAS,ART" hint="Airline callsign ICAO." onChange={(value) => updateFilter("operating_as", value)} />
                <FilterField label="Painted As" value={filters.painted_as} placeholder="SAS,ART" hint="Aircraft livery ICAO." onChange={(value) => updateFilter("painted_as", value)} />
              </div>
            </FilterPanel>

            <FilterPanel
              title="Route and Aircraft"
              description="Count summaries by airport, country, route pair, or aircraft type."
              icon={<Route className="h-5 w-5 text-emerald-400" />}
            >
              <FilterField label="Airports and Countries" value={filters.airports} placeholder="LHR,SE,inbound:WAW,outbound:JFK" hint="IATA, ICAO, country code, or direction:code." icon={<Plane className="h-4 w-4 text-emerald-400" />} onChange={(value) => updateFilter("airports", value)} />
              <FilterField label="Routes" value={filters.routes} placeholder="SE-US,ESSA-JFK" hint="Airport or country pairs." onChange={(value) => updateFilter("routes", value)} />
              <FilterField label="Aircraft Types" value={filters.aircraft} placeholder="B38M,B738" hint="ICAO aircraft type codes." onChange={(value) => updateFilter("aircraft", value)} />
            </FilterPanel>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(([key, value]) => (
                <Badge
                  key={key}
                  variant="outline"
                  className="h-auto border-sky-500/30 bg-sky-500/10 px-3 py-1 text-sky-300"
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
                disabled={loading}
                className="h-[42px] rounded-full bg-sky-500 px-6 text-white shadow-lg shadow-sky-500/20 transition-all duration-300 hover:bg-sky-600 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {loading ? "Counting..." : "Get Summary Count"}
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
                  <p className="font-medium">Failed to fetch flight summary count</p>
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
            <Card className="border-sky-500/30 bg-sky-500/10 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sky-300">
                      <CircleDot className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        Flight summary records
                      </span>
                    </div>
                    <p className="text-5xl font-light text-white md:text-7xl">
                      {result.record_count.toLocaleString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <ResultFact icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />} label="Source" value={result.source} />
                    <ResultFact icon={<Activity className="h-4 w-4 text-sky-400" />} label="Endpoint" value="Summary Count" />
                    <ResultFact icon={<Clock className="h-4 w-4 text-purple-400" />} label="Retrieved" value={formatDateTime(result.retrieved_at)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50 pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
                  <Filter className="h-6 w-6 text-sky-400" />
                  Applied Filter Summary
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  The count above is based on these FlightRadar24 summary query filters.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(result.filters).map(([key, value]) => (
                    <div key={key} className="rounded-xl border border-zinc-800/50 bg-black/20 p-4">
                      <p className="mb-1 text-xs text-zinc-500">{formatLabel(key)}</p>
                      <p className="break-words text-sm text-zinc-100">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </section>
    </main>
  );
}

function ModeButton({
  active,
  title,
  description,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition-all ${
        active
          ? "border-sky-500 bg-sky-500/10"
          : "border-zinc-800/50 bg-black/20 hover:border-zinc-700"
      }`}
    >
      <div className="mb-2 flex items-center gap-2 text-zinc-100">
        {icon}
        <span className="font-medium">{title}</span>
      </div>
      <p className="text-xs text-zinc-500">{description}</p>
    </button>
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
        <CardDescription className="text-zinc-400">{description}</CardDescription>
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

function toFr24DateTime(value: string) {
  if (!value) return "";
  return value.length === 16 ? `${value}:00` : value;
}

function toDateTimeLocal(value: Date) {
  const offsetMs = value.getTimezoneOffset() * 60 * 1000;
  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16);
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3)}...`;
}

function isCountResult(value: unknown): value is CountResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const result = value as Partial<CountResult>;

  return (
    typeof result.record_count === "number" &&
    typeof result.source === "string" &&
    typeof result.endpoint === "string" &&
    typeof result.retrieved_at === "string" &&
    typeof result.filters === "object" &&
    result.filters !== null &&
    !Array.isArray(result.filters)
  );
}

function getErrorMessage(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";

  const maybeError = value as { error?: unknown; message?: unknown };
  if (typeof maybeError.error === "string") return maybeError.error;
  if (typeof maybeError.message === "string") return maybeError.message;
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
