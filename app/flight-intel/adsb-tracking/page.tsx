"use client";

import { useState } from "react";
import { Button } from "@/components/buttons/Standard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card/Standard";
import {
  AlertCircle,
  BarChart3,
  Database,
  Hash,
  Loader2,
  Plane,
  RefreshCw,
  Radar,
  ShieldAlert,
} from "lucide-react";

type StatisticsResponse = Record<string, unknown>;

export default function AdsbAircraftStatisticsPage() {
  const [result, setResult] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setResult(null);

      const response = await fetch("/api/skylink/adsbTracking");

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setErrorMessage(
          data?.message ||
            stringifyErrorDetails(data?.details) ||
            "Failed to fetch ADS-B aircraft statistics."
        );
        return;
      }

      setResult(normalizeStatisticsResponse(data));
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch ADS-B aircraft statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  const topLevelEntries = result ? Object.entries(result) : [];
  const primitiveEntries = topLevelEntries.filter(([, value]) =>
    isPrimitiveValue(value)
  );
  const objectEntries = topLevelEntries.filter(
    ([, value]) => !isPrimitiveValue(value)
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-40">
      <div className="space-y-6">
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-zinc-800/50">
            <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
              <Radar className="w-7 h-7 text-sky-400" />
              ADS-B Aircraft Statistics
            </CardTitle>

            <CardDescription className="text-zinc-400">
              Fetch aircraft statistics from Skylink ADS-B data. This endpoint
              returns a flexible object, so the response is displayed as both
              summary cards and raw JSON.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-xs text-zinc-500">
                <ShieldAlert className="w-4 h-4 text-sky-400 mt-0.5" />

                <p>
                  ADS-B statistics are useful for monitoring aircraft data
                  availability, counts, and feed-level summaries.
                </p>
              </div>

              <Button
                onClick={fetchStatistics}
                disabled={loading}
                className="h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                <RefreshCw className="w-4 h-4 mr-2" />
                {loading ? "Fetching..." : "Fetch Statistics"}
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
                  <p className="font-medium">
                    Failed to fetch ADS-B aircraft statistics
                  </p>

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
                icon={<Database className="w-5 h-5 text-sky-400" />}
                label="Top-Level Fields"
                value={topLevelEntries.length}
              />

              <StatsCard
                icon={<Hash className="w-5 h-5 text-sky-400" />}
                label="Simple Values"
                value={primitiveEntries.length}
              />

              <StatsCard
                icon={<BarChart3 className="w-5 h-5 text-sky-400" />}
                label="Nested Sections"
                value={objectEntries.length}
              />

              <StatsCard
                icon={<Plane className="w-5 h-5 text-sky-400" />}
                label="Source"
                value="Skylink ADS-B"
              />
            </div>

            {primitiveEntries.length > 0 && (
              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-zinc-800/50">
                  <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
                    <BarChart3 className="w-6 h-6 text-sky-400" />
                    Statistics Summary
                  </CardTitle>

                  <CardDescription className="text-zinc-400">
                    Top-level aircraft statistics returned by the API.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {primitiveEntries.map(([key, value]) => (
                      <MiniStat
                        key={key}
                        label={formatLabel(key)}
                        value={formatValue(value)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {objectEntries.length > 0 && (
              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-zinc-800/50">
                  <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
                    <Database className="w-6 h-6 text-sky-400" />
                    Nested Sections
                  </CardTitle>

                  <CardDescription className="text-zinc-400">
                    Complex objects or arrays returned by the endpoint.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {objectEntries.map(([key, value]) => (
                      <NestedSection key={key} title={formatLabel(key)} value={value} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 border-b border-zinc-800/50">
                <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
                  <Database className="w-6 h-6 text-sky-400" />
                  Raw API Response
                </CardTitle>

                <CardDescription className="text-zinc-400">
                  Full JSON response from the Skylink ADS-B aircraft statistics
                  endpoint.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <pre className="max-h-[620px] overflow-auto rounded-2xl border border-zinc-800/50 bg-black/30 p-5 text-xs leading-relaxed text-zinc-300">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
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

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/50 bg-black/20 p-4">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-lg font-light text-zinc-100 break-words">{value}</p>
    </div>
  );
}

function NestedSection({
  title,
  value,
}: {
  title: string;
  value: unknown;
}) {
  const isArrayValue = Array.isArray(value);

  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-200">{title}</p>
          <p className="text-xs text-zinc-500">
            {isArrayValue
              ? `${value.length} item${value.length === 1 ? "" : "s"}`
              : "Object"}
          </p>
        </div>

        <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
          {isArrayValue ? "Array" : "Object"}
        </span>
      </div>

      <pre className="max-h-[320px] overflow-auto rounded-xl border border-zinc-800/50 bg-black/30 p-4 text-xs leading-relaxed text-zinc-300">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function normalizeStatisticsResponse(data: unknown): StatisticsResponse {
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    return data as StatisticsResponse;
  }

  return {
    response: data,
  };
}

function isPrimitiveValue(value: unknown) {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  if (typeof value === "number") {
    return Number.isInteger(value)
      ? value.toLocaleString()
      : Number(value.toFixed(2)).toLocaleString();
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
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