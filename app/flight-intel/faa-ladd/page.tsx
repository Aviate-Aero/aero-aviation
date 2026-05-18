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
  Ban,
  CheckCircle2,
  Clock,
  Database,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";

type FaaLaddStatusResponse = {
  id: string;
  isBlocked: boolean;
  blockedSince?: string | null;
  lastBlockedOn?: string | null;
  message?: string;
};

export default function FaaLaddPage() {
  const [aircraftId, setAircraftId] = useState("");
  const [result, setResult] = useState<FaaLaddStatusResponse | null>(null);
  const [rawResult, setRawResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchFaaLaddStatus = async () => {
    try {
      const cleanAircraftId = aircraftId.trim().toUpperCase();

      if (!cleanAircraftId) {
        setErrorMessage("Please enter an aircraft tail number or callsign.");
        return;
      }

      setLoading(true);
      setErrorMessage("");
      setResult(null);
      setRawResult(null);

      const response = await fetch(
        `/api/aerodatabox/faa-ladd/${encodeURIComponent(cleanAircraftId)}`
      );

      const data: unknown = await response.json();

      if (!response.ok) {
        setErrorMessage(
          getApiErrorMessage(data) || "Failed to fetch FAA LADD status."
        );
        return;
      }

      const normalizedResult = normalizeFaaLaddResult(data, cleanAircraftId);

      setResult(normalizedResult);
      setRawResult(data);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch FAA LADD status."
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
              <ShieldAlert className="w-7 h-7 text-sky-400" />
              FAA LADD Aircraft Status
            </CardTitle>

            <CardDescription className="text-zinc-400">
              Check whether an aircraft tail number or callsign is currently
              blocked in the FAA Limiting Aircraft Data Displayed list.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-500">
                  Tail Number or Callsign
                </label>

                <input
                  value={aircraftId}
                  onChange={(event) =>
                    setAircraftId(event.target.value.toUpperCase())
                  }
                  placeholder="Example: N123AB, ASA829, NH8421"
                  className="h-[42px] w-full rounded-full border border-zinc-800/70 bg-black/20 px-4 text-sm text-zinc-100 outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10"
                />
              </div>

              <Button
                onClick={fetchFaaLaddStatus}
                disabled={loading}
                className="h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}

                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Check Status
                  </>
                )}
              </Button>
            </div>

            <div className="mt-5 flex items-start gap-2 text-xs text-zinc-500">
              <ShieldAlert className="w-4 h-4 text-sky-400 mt-0.5" />

              <p>
                This endpoint checks FAA LADD status only. It does not retrieve
                hidden flight activity. AeroDataBox states this list is
                synchronized weekly and is not the official FAA source.
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
                    Failed to fetch FAA LADD status
                  </p>

                  <p className="text-sm text-red-400 mt-1 whitespace-pre-wrap">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result !== null && (
          <div className="space-y-6">
            <Card
              className={
                result.isBlocked
                  ? "border-red-500/30 bg-red-500/10 backdrop-blur-xl rounded-2xl overflow-hidden"
                  : "border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl rounded-2xl overflow-hidden"
              }
            >
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    {result.isBlocked ? (
                      <Ban className="w-9 h-9 text-red-400 mt-1" />
                    ) : (
                      <CheckCircle2 className="w-9 h-9 text-emerald-400 mt-1" />
                    )}

                    <div>
                      <p className="text-sm text-zinc-400">Aircraft</p>

                      <h2 className="mt-1 text-3xl font-light text-zinc-100">
                        {result.id}
                      </h2>

                      <p
                        className={
                          result.isBlocked
                            ? "mt-2 text-sm text-red-300"
                            : "mt-2 text-sm text-emerald-300"
                        }
                      >
                        {result.isBlocked
                          ? "This aircraft is currently listed as FAA LADD blocked."
                          : "This aircraft is not currently listed as FAA LADD blocked."}
                      </p>

                      {result.message && (
                        <p className="mt-2 text-xs text-zinc-400">
                          {result.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className={
                      result.isBlocked
                        ? "rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300"
                        : "rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300"
                    }
                  >
                    {result.isBlocked ? "Blocked" : "Not Blocked"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard
                icon={<ShieldAlert className="w-5 h-5 text-sky-400" />}
                label="LADD Status"
                value={result.isBlocked ? "Blocked" : "Not Blocked"}
              />

              <StatsCard
                icon={<Clock className="w-5 h-5 text-sky-400" />}
                label="Blocked Since"
                value={formatDateTime(result.blockedSince)}
              />

              <StatsCard
                icon={<Clock className="w-5 h-5 text-sky-400" />}
                label="Last Blocked On"
                value={formatDateTime(result.lastBlockedOn)}
              />
            </div>

            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 border-b border-zinc-800/50">
                <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
                  <Database className="w-6 h-6 text-sky-400" />
                  Raw API Response
                </CardTitle>

                <CardDescription className="text-zinc-400">
                  Full JSON response from the AeroDataBox FAA LADD endpoint.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <pre className="max-h-[620px] overflow-auto rounded-2xl border border-zinc-800/50 bg-black/30 p-5 text-xs leading-relaxed text-zinc-300">
                  {JSON.stringify(rawResult, null, 2)}
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

function normalizeFaaLaddResult(
  data: unknown,
  fallbackId: string
): FaaLaddStatusResponse {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return {
      id: fallbackId,
      isBlocked: false,
      blockedSince: null,
      lastBlockedOn: null,
    };
  }

  const record = data as Record<string, unknown>;

  return {
    id: typeof record.id === "string" ? record.id : fallbackId,
    isBlocked:
      typeof record.isBlocked === "boolean" ? record.isBlocked : false,
    blockedSince:
      typeof record.blockedSince === "string" ? record.blockedSince : null,
    lastBlockedOn:
      typeof record.lastBlockedOn === "string" ? record.lastBlockedOn : null,
    message: typeof record.message === "string" ? record.message : undefined,
  };
}

function getApiErrorMessage(data: unknown) {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return "";
  }

  const record = data as Record<string, unknown>;

  const message = typeof record.message === "string" ? record.message : "";

  const details = stringifyErrorDetails(record.details);

  return message || details;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
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