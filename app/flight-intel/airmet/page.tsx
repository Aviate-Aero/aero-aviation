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
  CloudLightning,
  Database,
  FileText,
  Loader2,
  Map,
  RefreshCw,
  ShieldAlert,
  Wind,
} from "lucide-react";

type ApiErrorResponse = {
  message?: string;
  status?: number;
  details?: unknown;
};

type AirSigmetType = "airmet" | "sigmet";

type AirSigmetObservation = {
  type?: string;
  floor?: string;
  ceiling?: string;
};

type AirSigmetReport = {
  raw?: string;
  bulletin_type?: string;
  report_type?: string;
  area?: string;
  body?: string;
  observation?: AirSigmetObservation;
};

type AirSigmetResponse = {
  bbox?: string;
  reports?: AirSigmetReport[];
  total?: number;
  response?: unknown;
  [key: string]: unknown;
};

export default function AirSigmetPage() {
  const [bboxInput, setBboxInput] = useState("38,-90,45,-80");
  const [typeInput, setTypeInput] = useState<AirSigmetType>("airmet");
  const [result, setResult] = useState<AirSigmetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAirSigmet = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setResult(null);

      const trimmedBbox = bboxInput.trim();

      if (!trimmedBbox) {
        setErrorMessage("Bounding box is required. Example: 38,-90,45,-80");
        return;
      }

      if (!isValidBbox(trimmedBbox)) {
        setErrorMessage(
          "Invalid bbox. Use lat1,lon1,lat2,lon2 from SW corner to NE corner. Example: 38,-90,45,-80"
        );
        return;
      }

      const query = new URLSearchParams({
        bbox: trimmedBbox,
        type: typeInput,
      });

      const response = await fetch(`/api/skylink/airsigmet?${query.toString()}`);

      const data = await parseApiResponse(response);

      if (!response.ok) {
        const apiError = data as ApiErrorResponse;

        setErrorMessage(
          apiError?.message ||
            stringifyErrorDetails(apiError?.details) ||
            "Failed to fetch AIRSIGMET reports."
        );
        return;
      }

      setResult(normalizeAirSigmetResponse(data));
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch AIRSIGMET reports."
      );
    } finally {
      setLoading(false);
    }
  };

  const reports = Array.isArray(result?.reports) ? result.reports : [];
  const totalReports =
    typeof result?.total === "number" ? result.total : reports.length;
  const bbox = result?.bbox || bboxInput || "N/A";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-40">
      <div className="space-y-6">
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-zinc-800/50">
            <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
              <CloudLightning className="w-7 h-7 text-sky-400" />
              AIRSIGMET Weather Reports
            </CardTitle>

            <CardDescription className="text-zinc-400">
              Fetch aviation weather advisories from Skylink. Enter a bounding
              box and optionally filter by AIRMET or SIGMET.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-2 text-xs text-zinc-500">
                <ShieldAlert className="w-4 h-4 text-sky-400 mt-0.5" />

                <p>
                  AIRSIGMET data is useful for checking IFR, turbulence, icing,
                  mountain obscuration, convective activity, and other aviation
                  weather advisories.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_auto] gap-4 items-end">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Bounding Box
                  </label>

                  <input
                    value={bboxInput}
                    onChange={(event) => setBboxInput(event.target.value)}
                    placeholder="38,-90,45,-80"
                    className="h-[42px] w-full rounded-full border border-zinc-800/70 bg-black/30 px-4 text-sm text-zinc-100 outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/20"
                  />

                  <p className="mt-2 text-xs text-zinc-500">
                    Format: lat1,lon1,lat2,lon2. SW corner → NE corner.
                    Example: 38,-90,45,-80
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Report Type
                  </label>

                  <select
                    value={typeInput}
                    onChange={(event) =>
                      setTypeInput(event.target.value as AirSigmetType)
                    }
                    className="h-[42px] w-full rounded-full border border-zinc-800/70 bg-black/30 px-4 text-sm text-zinc-100 outline-none transition-all duration-300 focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="airmet">AIRMET</option>
                    <option value="sigmet">SIGMET</option>
                  </select>

                  <p className="mt-2 text-xs text-zinc-500">
                    Optional filter.
                  </p>
                </div>

                <Button
                  onClick={fetchAirSigmet}
                  disabled={loading}
                  className="h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
                >
                  {loading && (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  )}
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {loading ? "Fetching..." : "Fetch AIRSIGMET"}
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
                  <p className="font-medium">
                    Failed to fetch AIRSIGMET reports
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
                icon={<FileText className="w-5 h-5 text-sky-400" />}
                label="Total Reports"
                value={totalReports}
              />

              <StatsCard
                icon={<Map className="w-5 h-5 text-sky-400" />}
                label="BBox"
                value={bbox}
              />

              <StatsCard
                icon={<Wind className="w-5 h-5 text-sky-400" />}
                label="Selected Type"
                value={typeInput.toUpperCase()}
              />
            </div>

            {reports.length > 0 && (
              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-zinc-800/50">
                  <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
                    <CloudLightning className="w-6 h-6 text-sky-400" />
                    Reports
                  </CardTitle>

                  <CardDescription className="text-zinc-400">
                    Parsed AIRSIGMET reports returned by the endpoint.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {reports.map((report, index) => (
                      <ReportCard key={index} report={report} index={index} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {reports.length === 0 && (
              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 text-zinc-300">
                    <FileText className="w-5 h-5 text-sky-400 mt-0.5 flex-shrink-0" />

                    <div>
                      <p className="font-medium">No reports found</p>

                      <p className="text-sm text-zinc-500 mt-1">
                        The API responded successfully, but no AIRSIGMET reports
                        were returned for this bounding box and type.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

function ReportCard({
  report,
  index,
}: {
  report: AirSigmetReport;
  index: number;
}) {
  const observation = report.observation;

  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-black/20 p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-200">
            Report #{index + 1}
          </p>

          <p className="text-xs text-zinc-500 mt-1">
            {report.bulletin_type || "Unknown Bulletin"} /{" "}
            {report.report_type || "Unknown Report"}
          </p>
        </div>

        <span className="w-fit rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
          Area {report.area || "N/A"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <MiniStat label="Observation Type" value={observation?.type || "N/A"} />
        <MiniStat label="Floor" value={observation?.floor || "N/A"} />
        <MiniStat label="Ceiling" value={observation?.ceiling || "N/A"} />
      </div>

      {report.body && (
        <div className="mb-4 rounded-xl border border-zinc-800/50 bg-black/30 p-4">
          <p className="text-xs text-zinc-500 mb-2">Body</p>

          <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
            {report.body}
          </p>
        </div>
      )}

      {report.raw && (
        <div className="rounded-xl border border-zinc-800/50 bg-black/30 p-4">
          <p className="text-xs text-zinc-500 mb-2">Raw Bulletin</p>

          <pre className="max-h-[260px] overflow-auto text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap">
            {report.raw}
          </pre>
        </div>
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

function normalizeAirSigmetResponse(data: unknown): AirSigmetResponse {
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    return data as AirSigmetResponse;
  }

  return {
    reports: [],
    total: 0,
    response: data,
  };
}

function isValidBbox(value: string) {
  const parts = value.split(",").map((item) => Number(item.trim()));

  if (parts.length !== 4) return false;

  const [lat1, lon1, lat2, lon2] = parts;

  const validNumbers = parts.every((part) => Number.isFinite(part));

  const validLatitudes =
    lat1 >= -90 && lat1 <= 90 && lat2 >= -90 && lat2 <= 90;

  const validLongitudes =
    lon1 >= -180 && lon1 <= 180 && lon2 >= -180 && lon2 <= 180;

  const validSwToNeOrder = lat1 < lat2 && lon1 < lon2;

  return validNumbers && validLatitudes && validLongitudes && validSwToNeOrder;
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

async function parseApiResponse(response: Response): Promise<unknown> {
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