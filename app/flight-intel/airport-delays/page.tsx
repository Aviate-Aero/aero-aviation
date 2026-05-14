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
  ArrowDownToLine,
  ArrowUpFromLine,
  BadgeCheck,
  Calendar,
  CheckCircle,
  Clock,
  Gauge,
  Loader2,
  Plane,
  Search,
  Timer,
  XCircle,
} from "lucide-react";

type CodeType = "iata" | "icao";

type DateTimeValue = {
  utc?: string;
  local?: string;
};

type DelayInformation = {
  numTotal?: number;
  numQualifiedTotal?: number;
  numCancelled?: number;
  medianDelay?: string;
  delayIndex?: number;
};

type AirportDelayResponse = {
  airportIcao?: string;
  from?: DateTimeValue;
  to?: DateTimeValue;
  departuresDelayInformation?: DelayInformation;
  arrivalsDelayInformation?: DelayInformation;
};

export default function AirportDelaysPage() {
  const [codeType, setCodeType] = useState<CodeType>("iata");
  const [code, setCode] = useState("DXB");
  const [dateLocal, setDateLocal] = useState("");

  const [result, setResult] = useState<AirportDelayResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const searchAirportDelays = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setResult(null);

      const cleanCode = code.trim().toUpperCase();
      const cleanDateLocal = dateLocal.trim();

      if (!cleanCode) {
        setErrorMessage("Please enter an airport code.");
        return;
      }

      if (codeType === "iata" && cleanCode.length !== 3) {
        setErrorMessage("For IATA, use 3-letter airport codes like LHE, DXB, LHR.");
        return;
      }

      if (codeType === "icao" && cleanCode.length !== 4) {
        setErrorMessage(
          "For ICAO, use 4-letter airport codes like OPLA, OMDB, EGLL."
        );
        return;
      }

      if (
        cleanDateLocal &&
        !/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(cleanDateLocal)
      ) {
        setErrorMessage(
          "Invalid date format. Use YYYY-MM-DD or YYYY-MM-DDTHH:mm."
        );
        return;
      }

      const params = new URLSearchParams();

      params.set("codeType", codeType);
      params.set("code", cleanCode);

      if (cleanDateLocal) {
        params.set("dateLocal", cleanDateLocal);
      }

      const response = await fetch(
        `/api/aerodatabox/airport-delays?${params.toString()}`
      );

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setErrorMessage(data?.message || "Failed to fetch airport delay data.");
        return;
      }

      setResult(data);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch airport delay data."
      );
    } finally {
      setLoading(false);
    }
  };

  const departures = result?.departuresDelayInformation;
  const arrivals = result?.arrivalsDelayInformation;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-40">
      <div className="space-y-6">
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-zinc-800/50">
            <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
              <Gauge className="w-7 h-7 text-sky-400" />
              Airport Delay Index
            </CardTitle>

            <CardDescription className="text-zinc-400">
              Check current or historical airport delay information, including
              median delay, delay index, cancellations, arrivals, and departures.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Code Type
                </label>

                <select
                  value={codeType}
                  onChange={(e) => {
                    const nextCodeType = e.target.value as CodeType;
                    setCodeType(nextCodeType);
                    setErrorMessage("");

                    if (nextCodeType === "iata") {
                      setCode("DXB");
                    } else {
                      setCode("OMDB");
                    }
                  }}
                  className="w-full h-[42px] border border-zinc-700 rounded-full px-4 py-2 text-zinc-200 bg-black/40 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                >
                  <option value="iata">IATA</option>
                  <option value="icao">ICAO</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Airport Code
                </label>

                <Input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchAirportDelays();
                    }
                  }}
                  placeholder={codeType === "iata" ? "e.g., DXB" : "e.g., OMDB"}
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Historical Local Time
                </label>

                <Input
                  type="text"
                  value={dateLocal}
                  onChange={(e) => {
                    setDateLocal(e.target.value);
                    setErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchAirportDelays();
                    }
                  }}
                  placeholder="Optional: 2026-05-13T17:21"
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={searchAirportDelays}
                  disabled={loading || !code.trim()}
                  className="w-full h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Checking..." : "Check Delays"}
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-zinc-500">
              <Clock className="w-4 h-4 text-sky-400 mt-0.5" />
              <p>
                Leave historical time empty for current delay data. If provided,
                use airport local time in <span className="text-zinc-400">YYYY-MM-DDTHH:mm</span>{" "}
                format.
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
                  <p className="font-medium">Failed to fetch airport delays</p>
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
                icon={<Plane className="w-5 h-5 text-sky-400" />}
                label="Airport ICAO"
                value={result.airportIcao || "N/A"}
              />

              <StatsCard
                icon={<Calendar className="w-5 h-5 text-sky-400" />}
                label="From Local"
                value={formatDateTime(result.from?.local)}
              />

              <StatsCard
                icon={<Clock className="w-5 h-5 text-sky-400" />}
                label="To Local"
                value={formatDateTime(result.to?.local)}
              />

              <StatsCard
                icon={<BadgeCheck className="w-5 h-5 text-emerald-400" />}
                label="Data Window"
                value="2 Hours"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DelayPanel
                title="Departures Delay Information"
                icon={<ArrowUpFromLine className="w-6 h-6 text-sky-400" />}
                data={departures}
              />

              <DelayPanel
                title="Arrivals Delay Information"
                icon={<ArrowDownToLine className="w-6 h-6 text-sky-400" />}
                data={arrivals}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DelayPanel({
  title,
  icon,
  data,
}: {
  title: string;
  icon: React.ReactNode;
  data?: DelayInformation;
}) {
  const delayIndex = data?.delayIndex ?? 0;

  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-zinc-800/50">
        <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
          {icon}
          {title}
        </CardTitle>

        <CardDescription className="text-zinc-400">
          Statistical delay data calculated from qualifying flight movements.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="mb-6 rounded-2xl border border-zinc-800/50 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-1">
                Delay Index
              </p>
              <p className="text-4xl font-light text-sky-400">
                {formatNumber(delayIndex)}
              </p>
            </div>

            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getDelayBadgeClass(
                delayIndex
              )}`}
            >
              {getDelayLabel(delayIndex)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <MiniStat
            icon={<Plane className="w-4 h-4 text-sky-400" />}
            label="Total Flights"
            value={data?.numTotal}
          />

          <MiniStat
            icon={<CheckCircle className="w-4 h-4 text-emerald-400" />}
            label="Qualified Flights"
            value={data?.numQualifiedTotal}
          />

          <MiniStat
            icon={<XCircle className="w-4 h-4 text-red-400" />}
            label="Cancelled"
            value={data?.numCancelled}
          />

          <MiniStat
            icon={<Timer className="w-4 h-4 text-sky-400" />}
            label="Median Delay"
            value={formatDuration(data?.medianDelay)}
          />
        </div>

        <div className="space-y-0 divide-y divide-zinc-800/50 text-sm">
          <InfoRow label="Delay Index" value={formatNumber(delayIndex)} />
          <InfoRow label="Total Movements" value={data?.numTotal} />
          <InfoRow label="Qualified Movements" value={data?.numQualifiedTotal} />
          <InfoRow label="Cancelled Flights" value={data?.numCancelled} />
          <InfoRow label="Median Delay" value={formatDuration(data?.medianDelay)} />
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

        <p className="text-lg font-light text-zinc-100 break-words">{value}</p>
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
    <div className="p-3 bg-black/20 border border-zinc-800/50 rounded-xl">
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

function formatDateTime(value?: string) {
  if (!value) return "N/A";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatNumber(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "N/A";
  }

  return Number(value.toFixed(2)).toLocaleString();
}

function formatDuration(value?: string) {
  if (!value) return "N/A";

  const isNegative = value.startsWith("-");
  const cleanValue = value.replace("-", "");
  const parts = cleanValue.split(":");

  if (parts.length < 2) return value;

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return value;
  }

  const sign = isNegative ? "-" : "";

  if (hours === 0) {
    return `${sign}${minutes}m`;
  }

  return `${sign}${hours}h ${minutes}m`;
}

function getDelayLabel(delayIndex: number) {
  if (delayIndex >= 4) return "Severe";
  if (delayIndex >= 3) return "High";
  if (delayIndex >= 2) return "Moderate";
  if (delayIndex > 0) return "Low";
  return "Normal";
}

function getDelayBadgeClass(delayIndex: number) {
  if (delayIndex >= 4) {
    return "bg-red-500/20 text-red-400 border-red-500/30";
  }

  if (delayIndex >= 3) {
    return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  }

  if (delayIndex >= 2) {
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  }

  if (delayIndex > 0) {
    return "bg-sky-500/20 text-sky-400 border-sky-500/30";
  }

  return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
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