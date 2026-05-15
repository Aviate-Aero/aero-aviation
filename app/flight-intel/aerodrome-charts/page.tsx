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
  CalendarClock,
  ExternalLink,
  FileText,
  FolderOpen,
  Hash,
  Loader2,
  Map,
  Plane,
  Search,
  ShieldAlert,
} from "lucide-react";

type ChartItem = {
  name: string | null;
  url: string | null;
  category: string | null;
};

type ChartsByCategory = Record<string, ChartItem[]>;

type AirportChartsResponse = {
  icao_code: string | null;
  source: string | null;
  charts: ChartsByCategory;
  total_count: number;
  fetched_at: string | null;
};

export default function AirportChartsPage() {
  const [icaoCode, setIcaoCode] = useState("KJFK");

  const [result, setResult] = useState<AirportChartsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const searchCharts = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setResult(null);

      const cleanIcaoCode = icaoCode.trim().toUpperCase();

      if (!cleanIcaoCode) {
        setErrorMessage("Please enter an airport ICAO code.");
        return;
      }

      if (cleanIcaoCode.length !== 4) {
        setErrorMessage("ICAO airport code must be 4 characters. Example: KJFK.");
        return;
      }

      const response = await fetch(
        `/api/skylink/aerodromeCharts?icaoCode=${encodeURIComponent(cleanIcaoCode)}`
      );

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setErrorMessage(
          data?.message ||
            stringifyErrorDetails(data?.details) ||
            "Failed to fetch airport charts."
        );
        return;
      }

      setResult(normalizeAirportChartsResponse(data));
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch airport charts."
      );
    } finally {
      setLoading(false);
    }
  };

  const chartCategories = result ? Object.entries(result.charts || {}) : [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-40">
      <div className="space-y-6">
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-zinc-800/50">
            <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
              <FileText className="w-7 h-7 text-sky-400" />
              Airport Charts
            </CardTitle>

            <CardDescription className="text-zinc-400">
              Search airport charts by ICAO code, including airport diagrams,
              SID, STAR, approach, and other published procedure charts.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Airport ICAO Code
                </label>

                <Input
                  type="text"
                  value={icaoCode}
                  onChange={(e) => {
                    setIcaoCode(e.target.value.toUpperCase());
                    setErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchCharts();
                    }
                  }}
                  placeholder="e.g., KJFK, KLAX, KORD"
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base uppercase"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={searchCharts}
                  disabled={loading || !icaoCode.trim()}
                  className="w-full h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Searching..." : "Search Charts"}
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-zinc-500">
              <ShieldAlert className="w-4 h-4 text-sky-400 mt-0.5" />
              <p>
                Airport charts should be verified with official aviation sources
                before operational use.
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
                  <p className="font-medium">Failed to fetch airport charts</p>
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
                icon={<Plane className="w-5 h-5 text-sky-400" />}
                label="Airport"
                value={result.icao_code || icaoCode}
              />

              <StatsCard
                icon={<BadgeCheck className="w-5 h-5 text-emerald-400" />}
                label="Source"
                value={result.source || "N/A"}
              />

              <StatsCard
                icon={<Hash className="w-5 h-5 text-sky-400" />}
                label="Total Charts"
                value={result.total_count ?? countCharts(result.charts)}
              />

              <StatsCard
                icon={<FolderOpen className="w-5 h-5 text-sky-400" />}
                label="Categories"
                value={chartCategories.length}
              />

              <StatsCard
                icon={<CalendarClock className="w-5 h-5 text-sky-400" />}
                label="Fetched"
                value={formatDateTime(result.fetched_at)}
              />
            </div>

            {chartCategories.length > 0 ? (
              <div className="space-y-6">
                {chartCategories.map(([category, charts]) => (
                  <ChartCategorySection
                    key={category}
                    category={category}
                    charts={charts}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <Map className="w-16 h-16 text-zinc-600 mb-4" />

                  <h3 className="text-2xl font-light text-zinc-300 mb-3">
                    No Charts Found
                  </h3>

                  <p className="text-zinc-500 max-w-md">
                    No airport charts were returned for this ICAO code.
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

function ChartCategorySection({
  category,
  charts,
}: {
  category: string;
  charts: ChartItem[];
}) {
  return (
    <div className="space-y-4">
      <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <FolderOpen className="w-6 h-6 text-sky-400 mt-0.5" />

              <div>
                <h2 className="text-xl font-light text-zinc-100">
                  {category}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {getCategoryLabel(category)}
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
              {charts.length} chart{charts.length === 1 ? "" : "s"}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {charts.map((chart, index) => (
          <ChartCard
            key={`${chart.category || category}-${chart.name || index}`}
            chart={chart}
            fallbackCategory={category}
          />
        ))}
      </div>
    </div>
  );
}

function ChartCard({
  chart,
  fallbackCategory,
}: {
  chart: ChartItem;
  fallbackCategory: string;
}) {
  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:border-sky-500/40 transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 flex-shrink-0 text-sky-400 ml-2" />
              <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-400 ml-2">
                {displayText(chart.category, fallbackCategory)}
              </span>
            </div>

            <h3 className="text-lg font-light text-zinc-100 break-words ml-2">
              {displayText(chart.name, "Unnamed Chart")}
            </h3>

            <p className="mt-2 text-sm text-zinc-500 ml-2">
              {getCategoryLabel(displayText(chart.category, fallbackCategory))}
            </p>
          </div>

          {chart.url ? (
            <a
              href={chart.url}
              target="_blank"
              rel="noreferrer"
              className="mr-2 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-black/40 text-zinc-300 transition-all hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-400"
              title="Open chart"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-black/20 text-zinc-700">
              <ExternalLink className="h-4 w-4" />
            </div>
          )}
        </div>

        {chart.url && (
          <div className="mt-4">
            <Button
              asChild
              variant="outline"
              className="ml-2 h-[38px] border-zinc-700 bg-black/40 text-zinc-300 hover:bg-sky-500/10 hover:text-sky-400 hover:border-sky-500/50 rounded-full"
            >
              <a href={chart.url} target="_blank" rel="noreferrer">
                Open Chart
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
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

function normalizeAirportChartsResponse(data: unknown): AirportChartsResponse {
  if (typeof data !== "object" || data === null) {
    return {
      icao_code: null,
      source: null,
      charts: {},
      total_count: 0,
      fetched_at: null,
    };
  }

  const value = data as Partial<AirportChartsResponse>;

  const safeCharts =
    value.charts && typeof value.charts === "object" && !Array.isArray(value.charts)
      ? value.charts
      : {};

  return {
    icao_code: value.icao_code ?? null,
    source: value.source ?? null,
    charts: safeCharts,
    total_count:
      typeof value.total_count === "number"
        ? value.total_count
        : countCharts(safeCharts),
    fetched_at: value.fetched_at ?? null,
  };
}

function countCharts(charts: ChartsByCategory) {
  return Object.values(charts).reduce((total, items) => {
    if (!Array.isArray(items)) return total;
    return total + items.length;
  }, 0);
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    GND: "Ground / Airport Diagram",
    APD: "Airport Diagram",
    SID: "Standard Instrument Departure",
    STAR: "Standard Terminal Arrival Route",
    IAP: "Instrument Approach Procedure",
    DEP: "Departure Procedure",
    ARR: "Arrival Procedure",
    MIN: "Minimums",
    HOT: "Hot Spot / Special Chart",
    REF: "Reference Chart",
  };

  return labels[category.toUpperCase()] || "Airport chart category";
}

function displayText(value: string | null | undefined, fallback = "N/A") {
  if (value === undefined || value === null || value.trim() === "") {
    return fallback;
  }

  return value;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "N/A";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
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