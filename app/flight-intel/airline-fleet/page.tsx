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
  Plane,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Hash,
  Users,
  Fuel,
  Gauge,
  Calendar,
  List,
} from "lucide-react";

type AircraftImage = {
  url?: string;
  webUrl?: string;
  author?: string;
  title?: string;
};

type AircraftItem = {
  id: number;
  reg?: string;
  active?: boolean;
  serial?: string;
  hexIcao?: string;
  airlineName?: string;
  iataType?: string;
  iataCodeShort?: string;
  icaoCode?: string;
  model?: string;
  modelCode?: string;
  numSeats?: number;
  rolloutDate?: string;
  firstFlightDate?: string;
  deliveryDate?: string;
  registrationDate?: string;
  typeName?: string;
  numEngines?: number;
  engineType?: string;
  isFreighter?: boolean;
  productionLine?: string;
  ageYears?: number;
  verified?: boolean;
  image?: AircraftImage;
  numRegistrations?: number;
  registrations?: unknown[];
};

type FleetResponse = {
  totalCount: number;
  pageOffset: number;
  pageSize: number;
  hasNextPage: boolean;
  count: number;
  items: AircraftItem[];
};

export default function AirlineFleetPage() {
  const [airlineCode, setAirlineCode] = useState("KLM");
  const [pageSize, setPageSize] = useState(20);
  const [pageOffset, setPageOffset] = useState(0);
  const [withRegistrations, setWithRegistrations] = useState(false);

  const [fleetData, setFleetData] = useState<FleetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getSafePageSize = () => {
    return Math.min(Math.max(Number(pageSize) || 20, 1), 100);
  };

  const getSafePageOffset = (offset: number) => {
    return Math.max(Number(offset) || 0, 0);
  };

  const fetchFleet = async () => {
    await fetchFleetWithOffset(pageOffset, true);
  };

  const fetchFleetWithOffset = async (
    offset: number,
    clearPreviousData = false
  ) => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (clearPreviousData) {
        setFleetData(null);
      }

      const cleanAirlineCode = airlineCode.trim().toUpperCase();

      if (!cleanAirlineCode) {
        setErrorMessage("Please enter an airline code.");
        return;
      }

      const currentSafePageSize = getSafePageSize();
      const currentSafePageOffset = getSafePageOffset(offset);

      const url =
        `/api/aerodatabox/airline-fleet` +
        `?airlineCode=${encodeURIComponent(cleanAirlineCode)}` +
        `&pageSize=${currentSafePageSize}` +
        `&pageOffset=${currentSafePageOffset}` +
        `&withRegistrations=${withRegistrations}`;

      const response = await fetch(url);
      const data = await parseApiResponse(response);

      if (!response.ok) {
        setErrorMessage(data?.message || "Something went wrong.");
        return;
      }

      setPageSize(currentSafePageSize);
      setPageOffset(currentSafePageOffset);
      setFleetData(data);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load fleet data."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = async () => {
    const currentSafePageSize = getSafePageSize();
    const nextOffset = pageOffset + currentSafePageSize;

    await fetchFleetWithOffset(nextOffset);
  };

  const handlePreviousPage = async () => {
    const currentSafePageSize = getSafePageSize();
    const previousOffset = Math.max(0, pageOffset - currentSafePageSize);

    await fetchFleetWithOffset(previousOffset);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-40">
      <div className="space-y-6">
        {/* Fleet Search Card */}
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-zinc-800/50">
            <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
              <Plane className="w-7 h-7 text-sky-400" />
              Fleet Search
            </CardTitle>

            <CardDescription className="text-zinc-400">
              Discover verified airline fleets worldwide. Enter an airline ICAO
              code like KLM, UAE, QTR, BAW, AAL, or PIA.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Airline Code */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Airline Code
                </label>

                <Input
                  type="text"
                  value={airlineCode}
                  onChange={(e) => {
                    setAirlineCode(e.target.value.toUpperCase());
                    setErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      fetchFleet();
                    }
                  }}
                  placeholder="e.g., KLM"
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base uppercase"
                />
              </div>

              {/* Page Size */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Results Per Page
                </label>

                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base"
                />
              </div>

              {/* Offset */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Starting Offset
                </label>

                <Input
                  type="number"
                  min={0}
                  value={pageOffset}
                  onChange={(e) => setPageOffset(Number(e.target.value))}
                  className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base"
                />
              </div>

              {/* Include Registrations */}
              <div className="md:col-span-1 flex items-end">
                <label className="w-full h-[42px] flex cursor-pointer items-center gap-3 rounded-full border border-zinc-700 bg-black/40 px-4 py-2 hover:border-zinc-600 transition-all">
                  <input
                    type="checkbox"
                    checked={withRegistrations}
                    onChange={(e) => setWithRegistrations(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 accent-sky-500"
                  />

                  <span className="text-sm font-medium text-zinc-300">
                    Include registrations
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={fetchFleet}
                disabled={loading || !airlineCode.trim()}
                className="h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                <Search className="w-4 h-4 mr-2" />
                {loading ? "Searching..." : "Search Fleet"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {errorMessage && (
          <Card className="border-red-500/30 bg-red-500/10 backdrop-blur-sm rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 text-red-300">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />

                <div>
                  <p className="font-medium">Failed to load fleet data</p>
                  <p className="text-sm text-red-400 mt-1 whitespace-pre-wrap">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {fleetData && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatsCard
              icon={<Plane className="w-5 h-5 text-sky-400" />}
              label="Total Aircraft"
              value={fleetData.totalCount}
            />

            <StatsCard
              icon={<List className="w-5 h-5 text-sky-400" />}
              label="This Page"
              value={fleetData.count}
            />

            <StatsCard
              icon={<Gauge className="w-5 h-5 text-sky-400" />}
              label="Page Size"
              value={fleetData.pageSize}
            />

            <StatsCard
              icon={<Hash className="w-5 h-5 text-sky-400" />}
              label="Offset"
              value={fleetData.pageOffset}
            />

            <StatsCard
              icon={
                fleetData.hasNextPage ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-zinc-500" />
                )
              }
              label="Next Page"
              value={fleetData.hasNextPage ? "Yes" : "No"}
            />
          </div>
        )}

        {/* Aircraft Results */}
        {fleetData && fleetData.items.length > 0 && (
          <div className="space-y-6">
            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm text-zinc-400">
                    Showing{" "}
                    <span className="text-sky-400 font-medium">
                      {fleetData.pageOffset + 1}
                    </span>{" "}
                    to{" "}
                    <span className="text-sky-400 font-medium">
                      {fleetData.pageOffset + fleetData.count}
                    </span>{" "}
                    of{" "}
                    <span className="text-sky-400 font-medium">
                      {fleetData.totalCount}
                    </span>{" "}
                    aircraft
                  </p>

                  <div className="flex gap-2">
                    <Button
                      onClick={handlePreviousPage}
                      disabled={loading || pageOffset === 0}
                      variant="outline"
                      className="h-[38px] border-zinc-700 bg-black/40 text-zinc-300 hover:bg-sky-500/10 hover:text-sky-400 hover:border-sky-500/50 rounded-full disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>

                    <Button
                      onClick={handleNextPage}
                      disabled={loading || !fleetData.hasNextPage}
                      variant="outline"
                      className="h-[38px] border-zinc-700 bg-black/40 text-zinc-300 hover:bg-sky-500/10 hover:text-sky-400 hover:border-sky-500/50 rounded-full disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {fleetData.items.map((aircraft, index) => (
                <AircraftCard
                  key={`${aircraft.id}-${aircraft.reg || index}`}
                  aircraft={aircraft}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {fleetData && fleetData.items.length === 0 && (
          <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Plane className="w-16 h-16 text-zinc-600 mb-4" />

              <h3 className="text-2xl font-light text-zinc-300 mb-3">
                No Aircraft Found
              </h3>

              <p className="text-zinc-500 max-w-md">
                Try another airline ICAO code or adjust your search criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function AircraftCard({ aircraft }: { aircraft: AircraftItem }) {
  return (
    <Card className="group border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:border-sky-500/40 transition-all duration-300">
      {aircraft.image?.url && (
        <div className="relative h-48 overflow-hidden bg-black/20 border-b border-zinc-800/50">
          <img
            src={aircraft.image.url}
            alt={aircraft.reg || "Aircraft"}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
          />
        </div>
      )}

      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-light text-zinc-100 mb-1">
              {aircraft.reg || "Unknown Registration"}
            </h2>

            <p className="text-sm text-zinc-400">
              {aircraft.model || aircraft.typeName || "Unknown Model"}
            </p>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium flex-shrink-0 border ${
              aircraft.active
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/20 text-red-400 border-red-500/30"
            }`}
          >
            {aircraft.active ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <MiniStat
            icon={<Hash className="w-4 h-4 text-sky-400" />}
            label="Model"
            value={aircraft.modelCode}
          />

          <MiniStat
            icon={<Users className="w-4 h-4 text-sky-400" />}
            label="Seats"
            value={aircraft.numSeats}
          />

          <MiniStat
            icon={<Fuel className="w-4 h-4 text-sky-400" />}
            label="Engines"
            value={aircraft.numEngines}
          />

          <MiniStat
            icon={<Gauge className="w-4 h-4 text-sky-400" />}
            label="Age"
            value={
              aircraft.ageYears !== undefined
                ? `${aircraft.ageYears} yrs`
                : undefined
            }
          />
        </div>

        <div className="space-y-0 divide-y divide-zinc-800/50 text-sm">
          <InfoRow label="Airline" value={aircraft.airlineName} />
          <InfoRow label="ICAO Code" value={aircraft.icaoCode} />
          <InfoRow label="IATA Type" value={aircraft.iataType} />
          <InfoRow label="Serial" value={aircraft.serial} />
          <InfoRow label="Hex ICAO" value={aircraft.hexIcao} />
          <InfoRow label="Engine Type" value={aircraft.engineType} />
          <InfoRow
            label="Freighter"
            value={aircraft.isFreighter ? "Yes" : "No"}
          />
          <InfoRow
            label="Verified"
            value={aircraft.verified ? "Yes" : "No"}
          />
          <InfoRow
            label="Delivery Date"
            value={formatDate(aircraft.deliveryDate)}
          />
          <InfoRow
            label="First Flight"
            value={formatDate(aircraft.firstFlightDate)}
          />
        </div>

        {aircraft.numRegistrations !== undefined && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-zinc-800/50 bg-black/20 px-3 py-2 text-xs text-zinc-400">
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>Registration records:</span>
            <span className="font-medium text-zinc-200">
              {aircraft.numRegistrations}
            </span>
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

        <p className="text-2xl font-light text-zinc-100">{value}</p>
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

function formatDate(date?: string) {
  if (!date) return "N/A";

  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return "N/A";
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