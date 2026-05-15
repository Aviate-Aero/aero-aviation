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
  BadgeAlert,
  Clock,
  CloudSun,
  Gauge,
  Hash,
  Loader2,
  Map,
  MapPin,
  Plane,
  RadioTower,
  Search,
  ShieldAlert,
  Timer,
  Wind,
} from "lucide-react";

type PirepReport = {
  raw: string | null;
  report_type: string | null;
  location: string | null;
  time: string | null;
  altitude: string | null;
  aircraft_type: string | null;
  turbulence: string | null;
  remarks: string | null;
};

type PirepsResponse = {
  bbox: string | null;
  hours: number | null;
  reports: PirepReport[];
  total: number;
};

export default function PirepsPage() {
  const [bbox, setBbox] = useState("39,-78,42,-71");
  const [hours, setHours] = useState(2);

  const [result, setResult] = useState<PirepsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const searchPireps = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setResult(null);

      const safeHours = Math.min(Math.max(Number(hours) || 2, 1), 24);
      const cleanBbox = bbox.trim();

      if (!cleanBbox) {
        setErrorMessage(
          "Bounding box is required. Use minLat,minLon,maxLat,maxLon like 39,-78,42,-71."
        );
        return;
      }

      if (!isValidBbox(cleanBbox)) {
        setErrorMessage(
          "Invalid bbox format. Use minLat,minLon,maxLat,maxLon like 39,-78,42,-71."
        );
        return;
      }

      const params = new URLSearchParams();

      params.set("bbox", cleanBbox);
      params.set("hours", String(safeHours));

      const response = await fetch(`/api/skylink/pireps?${params.toString()}`);

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setErrorMessage(
          data?.message ||
            stringifyErrorDetails(data?.details) ||
            "Failed to fetch PIREP data."
        );
        return;
      }

      setHours(safeHours);
      setResult(normalizePirepsResponse(data));
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error ? error.message : "Failed to fetch PIREP data."
      );
    } finally {
      setLoading(false);
    }
  };

  const reports = result?.reports || [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-40">
      <div className="space-y-6">
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-zinc-800/50">
            <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
              <RadioTower className="w-7 h-7 text-sky-400" />
              Pilot Reports / PIREPs
            </CardTitle>

            <CardDescription className="text-zinc-400">
              Search recent pilot weather reports by bounding box, including
              turbulence, altitude, aircraft type, location, remarks, and raw
              PIREP text.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Bounding Box
                  <span className="ml-2 text-xs text-zinc-500">
                    minLat,minLon,maxLat,maxLon
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
                      searchPireps();
                    }
                  }}
                  placeholder="e.g. 39,-78,42,-71"
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Report Window
                  <span className="ml-2 text-xs text-zinc-500">
                    Hours, max 24
                  </span>
                </label>

                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={hours}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    const safeValue = Math.min(Math.max(value || 2, 1), 24);
                    setHours(safeValue);
                    setErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchPireps();
                    }
                  }}
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base"
                />
              </div>

              <div className="md:col-span-1 flex items-end">
                <Button
                  onClick={searchPireps}
                  disabled={loading || !bbox.trim()}
                  className="w-full h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Searching..." : "Search PIREPs"}
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-zinc-500">
              <ShieldAlert className="w-4 h-4 text-sky-400 mt-0.5" />
              <p>
                PIREPs are pilot-submitted weather observations and should be
                cross-checked with official aviation weather sources before
                operational use.
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
                  <p className="font-medium">Failed to fetch PIREPs</p>
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
                icon={<Timer className="w-5 h-5 text-sky-400" />}
                label="Window"
                value={`${result.hours ?? hours} hours`}
              />

              <StatsCard
                icon={<Hash className="w-5 h-5 text-sky-400" />}
                label="Total Reports"
                value={result.total ?? reports.length}
              />

              <StatsCard
                icon={<Map className="w-5 h-5 text-sky-400" />}
                label="Bounding Box"
                value={result.bbox || bbox}
              />

              <StatsCard
                icon={<CloudSun className="w-5 h-5 text-sky-400" />}
                label="Displayed"
                value={reports.length}
              />
            </div>

            {reports.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reports.map((report, index) => (
                  <PirepCard
                    key={`${report.location || "pirep"}-${
                      report.time || index
                    }`}
                    report={report}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <RadioTower className="w-16 h-16 text-zinc-600 mb-4" />

                  <h3 className="text-2xl font-light text-zinc-300 mb-3">
                    No PIREPs Found
                  </h3>

                  <p className="text-zinc-500 max-w-md">
                    No pilot reports were returned for the selected bounding box
                    and time window.
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

function PirepCard({
  report,
  index,
}: {
  report: PirepReport;
  index: number;
}) {
  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:border-sky-500/40 transition-all duration-300">
      <CardHeader className="pb-4 border-b border-zinc-800/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
              <BadgeAlert className="w-6 h-6 text-sky-400" />
              PIREP {index + 1}
            </CardTitle>

            <CardDescription className="mt-2 text-zinc-400">
              {displayText(report.location, "Unknown location")} ·{" "}
              {displayText(report.report_type, "UA")}
            </CardDescription>
          </div>

          <span className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
            {displayText(report.aircraft_type, "Aircraft N/A")}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 mb-5">
          <p className="text-sm font-medium text-sky-300 mb-2">Pilot Remarks</p>

          <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap">
            {displayText(report.remarks, "No remarks available.")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <MiniStat
            icon={<MapPin className="w-4 h-4 text-sky-400" />}
            label="Location"
            value={displayText(report.location)}
          />

          <MiniStat
            icon={<Gauge className="w-4 h-4 text-sky-400" />}
            label="Altitude"
            value={displayText(report.altitude)}
          />

          <MiniStat
            icon={<Wind className="w-4 h-4 text-sky-400" />}
            label="Turbulence"
            value={displayText(report.turbulence)}
          />

          <MiniStat
            icon={<Plane className="w-4 h-4 text-sky-400" />}
            label="Aircraft"
            value={displayText(report.aircraft_type)}
          />

          <MiniStat
            icon={<Clock className="w-4 h-4 text-sky-400" />}
            label="Time"
            value={formatDateTime(report.time)}
          />

          <MiniStat
            icon={<RadioTower className="w-4 h-4 text-sky-400" />}
            label="Type"
            value={displayText(report.report_type)}
          />
        </div>

        {report.raw && (
          <div className="rounded-xl border border-zinc-800/50 bg-black/20 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Raw PIREP
            </p>

            <p className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-zinc-300">
              {report.raw}
            </p>
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
    <div className="rounded-xl border border-zinc-800/50 bg-black/20 p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}

        <span className="text-xs text-zinc-500">{label}</span>
      </div>

      <div className="font-medium text-zinc-200 break-words">
        {value !== undefined && value !== null && value !== "" ? value : "N/A"}
      </div>
    </div>
  );
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

function normalizePirepsResponse(data: unknown): PirepsResponse {
  if (typeof data !== "object" || data === null) {
    return {
      bbox: null,
      hours: null,
      reports: [],
      total: 0,
    };
  }

  const value = data as Partial<PirepsResponse>;

  return {
    bbox: value.bbox ?? null,
    hours: typeof value.hours === "number" ? value.hours : null,
    reports: Array.isArray(value.reports) ? value.reports : [],
    total:
      typeof value.total === "number"
        ? value.total
        : Array.isArray(value.reports)
        ? value.reports.length
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