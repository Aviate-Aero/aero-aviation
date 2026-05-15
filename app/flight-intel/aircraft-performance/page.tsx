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
  Gauge,
  Hash,
  Loader2,
  Plane,
  Ruler,
  Search,
  Shield,
  Users,
  Wind,
  Zap,
} from "lucide-react";

type AircraftPerformance = {
  icao_type?: string;
  name?: string;
  engine_type?: string;
  engine_code?: string;
  wake_category?: string;
  cruise_speed_ktas?: number;
  service_ceiling_ft?: number;
  max_range_nm?: number;
  wing_span_m?: number;
  length_m?: number;
  mtow_t?: number;
  max_passengers?: number;
};

export default function AircraftPerformancePage() {
  const [icaoType, setIcaoType] = useState("B77W");
  const [result, setResult] = useState<AircraftPerformance | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const searchAircraftPerformance = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setResult(null);

      const cleanIcaoType = icaoType.trim().toUpperCase();

      if (!cleanIcaoType) {
        setErrorMessage("Please enter an aircraft ICAO type. Example: B77W.");
        return;
      }

      const response = await fetch(
        `/api/skylink/aircraftPerformance?icaoType=${encodeURIComponent(
          cleanIcaoType
        )}`
      );

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setErrorMessage(
          data?.message || "Failed to fetch aircraft performance data."
        );
        return;
      }

      setResult(data);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch aircraft performance data."
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
              <Plane className="w-7 h-7 text-sky-400" />
              Aircraft Performance
            </CardTitle>

            <CardDescription className="text-zinc-400">
              Search aircraft performance data by ICAO type code, including
              range, cruise speed, service ceiling, MTOW, dimensions, engine
              type, wake category, and passenger capacity.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Aircraft ICAO Type
                </label>

                <Input
                  type="text"
                  value={icaoType}
                  onChange={(e) => {
                    setIcaoType(e.target.value.toUpperCase());
                    setErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchAircraftPerformance();
                    }
                  }}
                  placeholder="e.g., B77W, A320, B738"
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base uppercase"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={searchAircraftPerformance}
                  disabled={loading || !icaoType.trim()}
                  className="w-full h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Searching..." : "Search Performance"}
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-zinc-500">
              <Hash className="w-4 h-4 text-sky-400 mt-0.5" />
              <p>
                Use ICAO aircraft type designators such as{" "}
                <span className="text-zinc-400">B77W</span>,{" "}
                <span className="text-zinc-400">A320</span>,{" "}
                <span className="text-zinc-400">B738</span>,{" "}
                <span className="text-zinc-400">A359</span>, or{" "}
                <span className="text-zinc-400">B789</span>.
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
                  <p className="font-medium">
                    Failed to load aircraft performance
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
            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Plane className="w-8 h-8 text-sky-400" />
                      <h2 className="text-3xl font-light text-zinc-100">
                        {result.icao_type || "N/A"}
                      </h2>

                      {result.wake_category && (
                        <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
                          Wake {result.wake_category}
                        </span>
                      )}
                    </div>

                    <p className="text-lg text-zinc-300">
                      {result.name || "Unknown Aircraft"}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Engine: {result.engine_type || "N/A"}{" "}
                      {result.engine_code ? `(${result.engine_code})` : ""}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <MiniStat
                      icon={<Gauge className="w-4 h-4 text-sky-400" />}
                      label="Cruise"
                      value={`${formatNumber(result.cruise_speed_ktas)} ktas`}
                    />

                    <MiniStat
                      icon={<Shield className="w-4 h-4 text-sky-400" />}
                      label="Ceiling"
                      value={`${formatNumber(result.service_ceiling_ft)} ft`}
                    />

                    <MiniStat
                      icon={<Users className="w-4 h-4 text-sky-400" />}
                      label="Passengers"
                      value={formatNumber(result.max_passengers)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard
                icon={<Gauge className="w-5 h-5 text-sky-400" />}
                label="Cruise Speed"
                value={`${formatNumber(result.cruise_speed_ktas)} ktas`}
              />

              <StatsCard
                icon={<Zap className="w-5 h-5 text-sky-400" />}
                label="Max Range"
                value={`${formatNumber(result.max_range_nm)} NM`}
              />

              <StatsCard
                icon={<Shield className="w-5 h-5 text-sky-400" />}
                label="Service Ceiling"
                value={`${formatNumber(result.service_ceiling_ft)} ft`}
              />

              <StatsCard
                icon={<Users className="w-5 h-5 text-sky-400" />}
                label="Max Passengers"
                value={formatNumber(result.max_passengers)}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-zinc-800/50">
                  <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
                    <Ruler className="w-6 h-6 text-sky-400" />
                    Dimensions
                  </CardTitle>

                  <CardDescription className="text-zinc-400">
                    Aircraft size and physical performance reference values.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="space-y-0 divide-y divide-zinc-800/50 text-sm">
                    <InfoRow
                      label="Wingspan"
                      value={`${formatNumber(result.wing_span_m)} m`}
                    />
                    <InfoRow
                      label="Length"
                      value={`${formatNumber(result.length_m)} m`}
                    />
                    <InfoRow
                      label="MTOW"
                      value={`${formatNumber(result.mtow_t)} tonnes`}
                    />
                    <InfoRow
                      label="Wake Category"
                      value={result.wake_category}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-zinc-800/50">
                  <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
                    <Wind className="w-6 h-6 text-sky-400" />
                    Engine & Flight Envelope
                  </CardTitle>

                  <CardDescription className="text-zinc-400">
                    Engine category, speed, ceiling, and operational range.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="space-y-0 divide-y divide-zinc-800/50 text-sm">
                    <InfoRow label="Engine Type" value={result.engine_type} />
                    <InfoRow label="Engine Code" value={result.engine_code} />
                    <InfoRow
                      label="Cruise Speed"
                      value={`${formatNumber(result.cruise_speed_ktas)} ktas`}
                    />
                    <InfoRow
                      label="Service Ceiling"
                      value={`${formatNumber(result.service_ceiling_ft)} ft`}
                    />
                    <InfoRow
                      label="Maximum Range"
                      value={`${formatNumber(result.max_range_nm)} NM`}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
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
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="min-w-[120px] rounded-xl border border-zinc-800/50 bg-black/20 p-3">
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

  return Number(value.toFixed(1)).toLocaleString();
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