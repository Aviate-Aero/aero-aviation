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
  BadgeAlert,
  CloudAlert,
  FileWarning,
  Gauge,
  Loader2,
  Plane,
  RadioTower,
  RefreshCw,
  ShieldAlert,
  Timer,
  XCircle,
} from "lucide-react";

type GroundDelay = {
  airport: string | null;
  airport_name?: string | null;
  reason: string | null;
  avg_delay: string | null;
  max_delay: string | null;
};

type GroundStop = {
  airport: string | null;
  airport_name?: string | null;
  reason: string | null;
  end_time: string | null;
};

type Closure = {
  airport: string | null;
  airport_name?: string | null;
  reason: string | null;
  begin: string | null;
  reopen: string | null;
};

type AirspaceFlowProgram = {
  facility: string | null;
  reason: string | null;
  fca_start: string | null;
  fca_end: string | null;
};

type GlobalFaaDelaysResponse = {
  ground_delays: GroundDelay[];
  ground_stops: GroundStop[];
  closures: Closure[];
  airspace_flow_programs: AirspaceFlowProgram[];
  total_alerts: number;
  message?: string | null;
};

export default function GlobalFaaDelaysPage() {
  const [result, setResult] = useState<GlobalFaaDelaysResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchGlobalFaaDelays = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setResult(null);

      const response = await fetch("/api/skylink/delays/faa-delays");

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setErrorMessage(
          data?.message ||
            stringifyErrorDetails(data?.details) ||
            "Failed to fetch global FAA delay data."
        );
        return;
      }

      setResult(normalizeGlobalFaaDelaysResponse(data));
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch global FAA delay data."
      );
    } finally {
      setLoading(false);
    }
  };

  const groundDelays = result?.ground_delays || [];
  const groundStops = result?.ground_stops || [];
  const closures = result?.closures || [];
  const flowPrograms = result?.airspace_flow_programs || [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-40">
      <div className="space-y-6">
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-zinc-800/50">
            <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
              <CloudAlert className="w-7 h-7 text-sky-400" />
              Global FAA Delays
            </CardTitle>

            <CardDescription className="text-zinc-400">
              View current FAA delay alerts across airports, including ground
              delays, ground stops, closures, and airspace flow programs.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-xs text-zinc-500">
                <ShieldAlert className="w-4 h-4 text-sky-400 mt-0.5" />
                <p>
                  FAA delay data should be verified with official FAA sources
                  before operational use.
                </p>
              </div>

              <Button
                onClick={fetchGlobalFaaDelays}
                disabled={loading}
                className="h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                <RefreshCw className="w-4 h-4 mr-2" />
                {loading ? "Checking..." : "Check Global FAA Delays"}
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
                    Failed to fetch global FAA delays
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <StatsCard
                icon={<BadgeAlert className="w-5 h-5 text-amber-400" />}
                label="Total Alerts"
                value={result.total_alerts ?? totalAlerts(result)}
              />

              <StatsCard
                icon={<Timer className="w-5 h-5 text-sky-400" />}
                label="Ground Delays"
                value={groundDelays.length}
              />

              <StatsCard
                icon={<XCircle className="w-5 h-5 text-red-400" />}
                label="Ground Stops"
                value={groundStops.length}
              />

              <StatsCard
                icon={<FileWarning className="w-5 h-5 text-amber-400" />}
                label="Closures"
                value={closures.length}
              />

              <StatsCard
                icon={<Gauge className="w-5 h-5 text-sky-400" />}
                label="Flow Programs"
                value={flowPrograms.length}
              />
            </div>

            {result.message && (
              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 text-zinc-300">
                    <RadioTower className="w-5 h-5 mt-0.5 text-sky-400 flex-shrink-0" />
                    <p className="text-sm leading-relaxed">{result.message}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {totalAlerts(result) > 0 ? (
              <div className="space-y-6">
                {groundDelays.length > 0 && (
                  <AlertSection
                    title="Ground Delays"
                    description="Current FAA-reported ground delay programs."
                    icon={<Timer className="w-6 h-6 text-amber-400" />}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {groundDelays.map((item, index) => (
                        <GroundDelayCard
                          key={`${item.airport || "delay"}-${index}`}
                          item={item}
                        />
                      ))}
                    </div>
                  </AlertSection>
                )}

                {groundStops.length > 0 && (
                  <AlertSection
                    title="Ground Stops"
                    description="Current FAA-reported ground stop programs."
                    icon={<XCircle className="w-6 h-6 text-red-400" />}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {groundStops.map((item, index) => (
                        <GroundStopCard
                          key={`${item.airport || "stop"}-${index}`}
                          item={item}
                        />
                      ))}
                    </div>
                  </AlertSection>
                )}

                {closures.length > 0 && (
                  <AlertSection
                    title="Airport Closures"
                    description="Current FAA-reported airport closure information."
                    icon={<FileWarning className="w-6 h-6 text-red-400" />}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {closures.map((item, index) => (
                        <ClosureCard
                          key={`${item.airport || "closure"}-${index}`}
                          item={item}
                        />
                      ))}
                    </div>
                  </AlertSection>
                )}

                {flowPrograms.length > 0 && (
                  <AlertSection
                    title="Airspace Flow Programs"
                    description="Traffic management programs and flow constraints."
                    icon={<Gauge className="w-6 h-6 text-sky-400" />}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {flowPrograms.map((item, index) => (
                        <FlowProgramCard
                          key={`${item.facility || "flow"}-${index}`}
                          item={item}
                        />
                      ))}
                    </div>
                  </AlertSection>
                )}
              </div>
            ) : (
              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <Plane className="w-16 h-16 text-zinc-600 mb-4" />

                  <h3 className="text-2xl font-light text-zinc-300 mb-3">
                    No FAA Delay Alerts
                  </h3>

                  <p className="text-zinc-500 max-w-md">
                    No ground delay, ground stop, closure, or airspace flow
                    program alerts were returned.
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

function AlertSection({
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
    <div className="space-y-4">
      <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            {icon}

            <div>
              <h2 className="text-xl font-light text-zinc-100">{title}</h2>
              <p className="mt-1 text-sm text-zinc-500">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {children}
    </div>
  );
}

function GroundDelayCard({ item }: { item: GroundDelay }) {
  return (
    <AlertCard
      title={displayText(item.airport, "Ground Delay")}
      subtitle={displayText(item.airport_name, "Unknown airport")}
      badge="Delay"
      badgeClass="border-amber-500/30 bg-amber-500/10 text-amber-400"
    >
      <InfoRow label="Reason" value={displayText(item.reason)} />
      <InfoRow label="Average Delay" value={displayText(item.avg_delay)} />
      <InfoRow label="Maximum Delay" value={displayText(item.max_delay)} />
    </AlertCard>
  );
}

function GroundStopCard({ item }: { item: GroundStop }) {
  return (
    <AlertCard
      title={displayText(item.airport, "Ground Stop")}
      subtitle={displayText(item.airport_name, "Unknown airport")}
      badge="Stop"
      badgeClass="border-red-500/30 bg-red-500/10 text-red-400"
    >
      <InfoRow label="Reason" value={displayText(item.reason)} />
      <InfoRow label="End Time" value={displayText(item.end_time)} />
    </AlertCard>
  );
}

function ClosureCard({ item }: { item: Closure }) {
  return (
    <AlertCard
      title={displayText(item.airport, "Closure")}
      subtitle={displayText(item.airport_name, "Unknown airport")}
      badge="Closure"
      badgeClass="border-red-500/30 bg-red-500/10 text-red-400"
    >
      <InfoRow label="Reason" value={displayText(item.reason)} />
      <InfoRow label="Begin" value={displayText(item.begin)} />
      <InfoRow label="Reopen" value={displayText(item.reopen)} />
    </AlertCard>
  );
}

function FlowProgramCard({ item }: { item: AirspaceFlowProgram }) {
  return (
    <AlertCard
      title={displayText(item.facility, "Flow Program")}
      subtitle="Airspace Flow Program"
      badge="AFP"
      badgeClass="border-sky-500/30 bg-sky-500/10 text-sky-400"
    >
      <InfoRow label="Reason" value={displayText(item.reason)} />
      <InfoRow label="FCA Start" value={displayText(item.fca_start)} />
      <InfoRow label="FCA End" value={displayText(item.fca_end)} />
    </AlertCard>
  );
}

function AlertCard({
  title,
  subtitle,
  badge,
  badgeClass,
  children,
}: {
  title: string;
  subtitle: string;
  badge: string;
  badgeClass: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:border-sky-500/40 transition-all duration-300">
      <CardHeader className="pb-4 border-b border-zinc-800/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-light text-zinc-100">
              {title}
            </CardTitle>

            <CardDescription className="mt-2 text-zinc-400">
              {subtitle}
            </CardDescription>
          </div>

          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium flex-shrink-0 ${badgeClass}`}
          >
            {badge}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-0 divide-y divide-zinc-800/50 text-sm">
          {children}
        </div>
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

function normalizeGlobalFaaDelaysResponse(
  data: unknown
): GlobalFaaDelaysResponse {
  if (typeof data !== "object" || data === null) {
    return {
      ground_delays: [],
      ground_stops: [],
      closures: [],
      airspace_flow_programs: [],
      total_alerts: 0,
      message: null,
    };
  }

  const value = data as Partial<GlobalFaaDelaysResponse>;

  const normalizedAlerts = {
    ground_delays: Array.isArray(value.ground_delays)
      ? value.ground_delays
      : [],
    ground_stops: Array.isArray(value.ground_stops) ? value.ground_stops : [],
    closures: Array.isArray(value.closures) ? value.closures : [],
    airspace_flow_programs: Array.isArray(value.airspace_flow_programs)
      ? value.airspace_flow_programs
      : [],
  };

  return {
    ...normalizedAlerts,
    total_alerts:
      typeof value.total_alerts === "number"
        ? value.total_alerts
        : totalAlerts(normalizedAlerts),
    message: value.message ?? null,
  };
}

function totalAlerts(
  result: Pick<
    GlobalFaaDelaysResponse,
    "ground_delays" | "ground_stops" | "closures" | "airspace_flow_programs"
  >
) {
  return (
    result.ground_delays.length +
    result.ground_stops.length +
    result.closures.length +
    result.airspace_flow_programs.length
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