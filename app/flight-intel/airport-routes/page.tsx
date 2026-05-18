"use client";

import { useMemo, useState } from "react";
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
  ArrowDownUp,
  BarChart3,
  Database,
  Loader2,
  MapPin,
  Plane,
  RefreshCw,
  Route,
  Search,
  ShieldAlert,
} from "lucide-react";

type AirportRoutesResponse = unknown;

type NormalizedRoute = {
  id: string;
  departureAirport?: string;
  arrivalAirport?: string;
  airlines: string[];
  distanceKm?: number;
  durationMin?: number;
  raw: unknown;
};

type Direction = "both" | "departure" | "arrival";

export default function AirportRoutesPage() {
  const [airportCode, setAirportCode] = useState("OPIS");
  const [limit, setLimit] = useState("100");
  const [direction, setDirection] = useState<Direction>("both");
  const [result, setResult] = useState<AirportRoutesResponse | null>(null);
  const [routes, setRoutes] = useState<NormalizedRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAirportRoutes = async () => {
    try {
      const cleanAirportCode = airportCode.trim().toUpperCase();

      if (!cleanAirportCode) {
        setErrorMessage("Please enter an airport code.");
        return;
      }

      setLoading(true);
      setErrorMessage("");
      setResult(null);
      setRoutes([]);

      const response = await fetch(
        `/api/skylink/airportRoutes/${encodeURIComponent(
          cleanAirportCode
        )}?limit=${encodeURIComponent(limit)}&direction=${encodeURIComponent(
          direction
        )}`
      );

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setErrorMessage(
          data?.message ||
            stringifyErrorDetails(data?.details) ||
            "Failed to fetch airport routes."
        );
        return;
      }

      const normalizedRoutes = normalizeAirportRoutesResponse(data);

      setResult(data);
      setRoutes(normalizedRoutes);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch airport routes."
      );
    } finally {
      setLoading(false);
    }
  };

  const routeCount = routes.length;

  const airlineCount = useMemo(() => {
    const airlines = new Set<string>();

    routes.forEach((route) => {
      const routeAirlines = Array.isArray(route.airlines)
        ? route.airlines
        : [];

      routeAirlines.forEach((airline) => {
        airlines.add(airline);
      });
    });

    return airlines.size;
  }, [routes]);

  const routeAirportCount = useMemo(() => {
    const airports = new Set<string>();

    routes.forEach((route) => {
      if (route.departureAirport) airports.add(route.departureAirport);
      if (route.arrivalAirport) airports.add(route.arrivalAirport);
    });

    return airports.size;
  }, [routes]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-40">
      <div className="space-y-6">
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-zinc-800/50">
            <CardTitle className="flex items-center gap-3 text-2xl font-light text-zinc-100">
              <Route className="w-7 h-7 text-sky-400" />
              Airport Routes
            </CardTitle>

            <CardDescription className="text-zinc-400">
              Fetch route data for a specific airport using the Skylink airport
              routes endpoint.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.7fr_0.7fr_auto] lg:items-end">
              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-500">
                  Airport Code
                </label>

                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                  <input
                    value={airportCode}
                    onChange={(event) =>
                      setAirportCode(event.target.value.toUpperCase())
                    }
                    placeholder="Example: OPIS, OPLA, OMDB"
                    className="h-[42px] w-full rounded-full border border-zinc-800/70 bg-black/20 pl-11 pr-4 text-sm text-zinc-100 outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-500">
                  Direction
                </label>

                <select
                  value={direction}
                  onChange={(event) =>
                    setDirection(event.target.value as Direction)
                  }
                  className="h-[42px] w-full rounded-full border border-zinc-800/70 bg-black/20 px-4 text-sm text-zinc-100 outline-none transition-all duration-300 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10"
                >
                  <option className="bg-zinc-950" value="both">
                    Both
                  </option>
                  <option className="bg-zinc-950" value="departure">
                    Departure
                  </option>
                  <option className="bg-zinc-950" value="arrival">
                    Arrival
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-500">
                  Limit
                </label>

                <input
                  value={limit}
                  onChange={(event) => setLimit(event.target.value)}
                  type="number"
                  min="1"
                  max="100"
                  className="h-[42px] w-full rounded-full border border-zinc-800/70 bg-black/20 px-4 text-sm text-zinc-100 outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10"
                />
              </div>

              <Button
                onClick={fetchAirportRoutes}
                disabled={loading}
                className="h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}

                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Fetch Routes
                  </>
                )}
              </Button>
            </div>

            <div className="mt-5 flex items-start gap-2 text-xs text-zinc-500">
              <ShieldAlert className="w-4 h-4 text-sky-400 mt-0.5" />

              <p>
                The RapidAPI key stays protected because this page calls your
                own Next.js API route instead of calling Skylink directly from
                the browser.
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
                  <p className="font-medium">Failed to fetch airport routes</p>

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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard
                icon={<Route className="w-5 h-5 text-sky-400" />}
                label="Routes Found"
                value={routeCount}
              />

              <StatsCard
                icon={<Plane className="w-5 h-5 text-sky-400" />}
                label="Airlines"
                value={airlineCount}
              />

              <StatsCard
                icon={<MapPin className="w-5 h-5 text-sky-400" />}
                label="Airports"
                value={routeAirportCount}
              />

              <StatsCard
                icon={<ArrowDownUp className="w-5 h-5 text-sky-400" />}
                label="Direction"
                value={formatLabel(direction)}
              />
            </div>

            {routes.length > 0 ? (
              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-zinc-800/50">
                  <CardTitle className="flex items-center gap-3 text-xl font-light text-zinc-100">
                    <BarChart3 className="w-6 h-6 text-sky-400" />
                    Route Results
                  </CardTitle>

                  <CardDescription className="text-zinc-400">
                    Route cards generated from the Skylink API response.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {routes.map((route) => (
                      <RouteCard key={route.id} route={route} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 text-zinc-400">
                    <Database className="w-5 h-5 mt-0.5 text-sky-400" />

                    <div>
                      <p className="font-medium text-zinc-200">
                        No routes found
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        The API returned data, but no route list was found.
                        Check the raw response below.
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

function RouteCard({ route }: { route: NormalizedRoute }) {
  const airlines = Array.isArray(route.airlines) ? route.airlines : [];

  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-black/20 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-500 mt-2 ml-2">Route</p>

          <p className="mt-1 text-xl font-light text-zinc-100 mt-2 ml-2">
            {route.departureAirport || "N/A"} → {route.arrivalAirport || "N/A"}
          </p>
        </div>

        <span className="mt-2 mr-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
          {route.durationMin ? formatDuration(route.durationMin) : "N/A"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MiniStat
          label="Departure"
          value={route.departureAirport || "Not Available"}
        />

        <MiniStat
          label="Arrival"
          value={route.arrivalAirport || "Not Available"}
        />

        <MiniStat
          label="Distance"
          value={
            route.distanceKm
              ? `${route.distanceKm.toLocaleString()} km`
              : "N/A"
          }
        />

        <MiniStat
          label="Duration"
          value={route.durationMin ? formatDuration(route.durationMin) : "N/A"}
        />
      </div>

      <div className="mt-4 rounded-xl border border-zinc-800/50 bg-black/20 p-4">
        <p className="text-xs text-zinc-500 mb-3">Airlines</p>

        {airlines.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {airlines.map((airline) => (
              <span
                key={airline}
                className="rounded-full border border-zinc-700/70 bg-zinc-900/70 px-3 py-1 text-xs text-zinc-300"
              >
                {airline}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm font-light text-zinc-100">N/A</p>
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
      <p className="text-sm font-light text-zinc-100 break-words">{value}</p>
    </div>
  );
}

function normalizeAirportRoutesResponse(data: unknown): NormalizedRoute[] {
  const routeItems = extractArrayFromResponse(data);

  return routeItems.map((item, index) => {
    const objectItem = isRecord(item) ? item : {};

    const departureAirport =
      getStringValue(objectItem, ["departure"]) || undefined;

    const arrivalAirport =
      getStringValue(objectItem, ["arrival"]) || undefined;

    const airlines = getStringArrayValue(objectItem, ["airlines"]);

    return {
      id: `${departureAirport || "departure"}-${
        arrivalAirport || "arrival"
      }-${index}`,
      departureAirport,
      arrivalAirport,
      airlines,
      distanceKm: getNumberValue(objectItem, ["km"]) || undefined,
      durationMin: getNumberValue(objectItem, ["duration_min"]) || undefined,
      raw: item,
    };
  });
}

function extractArrayFromResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (!isRecord(data)) {
    return [];
  }

  const possibleKeys = [
    "routes",
    "data",
    "items",
    "results",
    "response",
    "airport_routes",
    "airportRoutes",
  ];

  for (const key of possibleKeys) {
    const value = data[key];

    if (Array.isArray(value)) {
      return value;
    }

    if (isRecord(value)) {
      const nestedArray = extractArrayFromResponse(value);

      if (nestedArray.length > 0) {
        return nestedArray;
      }
    }
  }

  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStringValue(object: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = object[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

function getNumberValue(object: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = object[key];

    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      const parsedValue = Number(value);

      if (!Number.isNaN(parsedValue)) {
        return parsedValue;
      }
    }
  }

  return 0;
}

function getStringArrayValue(object: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = object[key];

    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === "string")
        .filter(Boolean);
    }
  }

  return [];
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours <= 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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