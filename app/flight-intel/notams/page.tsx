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
  Calendar,
  Clock,
  FileText,
  Hash,
  Loader2,
  MapPin,
  RadioTower,
  Search,
  ShieldAlert,
} from "lucide-react";

type NotamItem = {
  raw?: string;
  notam_id?: string;
  notam_id_domestic?: string;
  type?: string;
  location?: string;
  effective?: string;
  expiration?: string;
  body?: string;
};

type NotamResponse = {
  icao?: string;
  notams?: NotamItem[];
  total?: number;
};

export default function NotamsPage() {
  const [icao, setIcao] = useState("KJFK");

  const [result, setResult] = useState<NotamResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const searchNotams = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setResult(null);

      const cleanIcao = icao.trim().toUpperCase();

      if (!cleanIcao) {
        setErrorMessage("Please enter an airport ICAO code.");
        return;
      }

      if (cleanIcao.length !== 4) {
        setErrorMessage("ICAO airport code must be 4 characters. Example: KJFK.");
        return;
      }

      const response = await fetch(
        `/api/skylink/notams?icao=${encodeURIComponent(cleanIcao)}`
      );

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setErrorMessage(data?.message || "Failed to fetch NOTAM data.");
        return;
      }

      setResult(data);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error ? error.message : "Failed to fetch NOTAM data."
      );
    } finally {
      setLoading(false);
    }
  };

  const notams = result?.notams || [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-40">
      <div className="space-y-6">
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-zinc-800/50">
            <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
              <RadioTower className="w-7 h-7 text-sky-400" />
              Airport NOTAMs
            </CardTitle>

            <CardDescription className="text-zinc-400">
              Search current NOTAM data by airport ICAO code, including runway
              closures, airspace restrictions, operational notices, effective
              times, and expiry times.
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
                  value={icao}
                  onChange={(e) => {
                    setIcao(e.target.value.toUpperCase());
                    setErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchNotams();
                    }
                  }}
                  placeholder="e.g., KJFK, EGLL, OPLA"
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base uppercase"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={searchNotams}
                  disabled={loading || !icao.trim()}
                  className="w-full h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Searching..." : "Search NOTAMs"}
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-zinc-500">
              <ShieldAlert className="w-4 h-4 text-sky-400 mt-0.5" />
              <p>
                Use 4-letter ICAO airport codes only. For example{" "}
                <span className="text-zinc-400">KJFK</span>,{" "}
                <span className="text-zinc-400">EGLL</span>,{" "}
                <span className="text-zinc-400">OMDB</span>, or{" "}
                <span className="text-zinc-400">OPLA</span>.
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
                  <p className="font-medium">Failed to fetch NOTAMs</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard
                icon={<MapPin className="w-5 h-5 text-sky-400" />}
                label="Airport"
                value={result.icao || icao}
              />

              <StatsCard
                icon={<FileText className="w-5 h-5 text-sky-400" />}
                label="Total NOTAMs"
                value={result.total ?? notams.length}
              />

              <StatsCard
                icon={<BadgeAlert className="w-5 h-5 text-amber-400" />}
                label="Operational Notices"
                value={notams.length}
              />
            </div>

            {notams.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {notams.map((notam, index) => (
                  <NotamCard
                    key={`${notam.notam_id || "notam"}-${index}`}
                    notam={notam}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <FileText className="w-16 h-16 text-zinc-600 mb-4" />

                  <h3 className="text-2xl font-light text-zinc-300 mb-3">
                    No NOTAMs Found
                  </h3>

                  <p className="text-zinc-500 max-w-md">
                    No active NOTAM records were returned for this airport.
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

function NotamCard({ notam, index }: { notam: NotamItem; index: number }) {
  const isExpired = isPastDate(notam.expiration);

  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:border-sky-500/40 transition-all duration-300">
      <CardHeader className="pb-4 border-b border-zinc-800/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
              <BadgeAlert className="w-6 h-6 text-amber-400" />
              NOTAM {notam.notam_id || index + 1}
            </CardTitle>

            <CardDescription className="mt-2 text-zinc-400">
              {notam.location || "Unknown location"} · Type {notam.type || "N/A"}
            </CardDescription>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium flex-shrink-0 border ${
              isExpired
                ? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            }`}
          >
            {isExpired ? "Expired" : "Active/Valid"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-5">
          <p className="text-sm font-medium text-amber-300 mb-2">Notice Body</p>
          <p className="text-zinc-200 leading-relaxed">
            {notam.body || "No NOTAM body available."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <MiniStat
            icon={<Hash className="w-4 h-4 text-sky-400" />}
            label="NOTAM ID"
            value={notam.notam_id}
          />

          <MiniStat
            icon={<Hash className="w-4 h-4 text-sky-400" />}
            label="Domestic ID"
            value={notam.notam_id_domestic}
          />

          <MiniStat
            icon={<Calendar className="w-4 h-4 text-sky-400" />}
            label="Effective"
            value={formatDateTime(notam.effective)}
          />

          <MiniStat
            icon={<Clock className="w-4 h-4 text-sky-400" />}
            label="Expiration"
            value={formatDateTime(notam.expiration)}
          />
        </div>

        {notam.raw && (
          <div className="rounded-xl border border-zinc-800/50 bg-black/20 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Raw NOTAM
            </p>
            <p className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-zinc-300">
              {notam.raw}
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

function formatDateTime(value?: string) {
  if (!value) return "N/A";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function isPastDate(value?: string) {
  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() < Date.now();
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