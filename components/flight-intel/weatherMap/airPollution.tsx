"use client";

import { useState } from "react";
import { Search, Wind, AlertCircle, Gauge } from "lucide-react";
import { Button } from "@/components/buttons/Standard";
import { Input } from "@/components/input/Standard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card/Standard";

interface GeoResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

interface AirPollution {
  list: {
    main: { aqi: number };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
    dt: number;
  }[];
}

// OpenWeather AQI is a 1–5 qualitative index.
const AQI_LEVELS: Record<
  number,
  { label: string; text: string; bg: string; border: string }
> = {
  1: { label: "Good", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  2: { label: "Fair", text: "text-lime-400", bg: "bg-lime-500/10", border: "border-lime-500/30" },
  3: { label: "Moderate", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  4: { label: "Poor", text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  5: { label: "Very Poor", text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
};

// Pollutant display metadata. Concentrations are in μg/m³.
const POLLUTANTS: { key: keyof AirPollution["list"][0]["components"]; label: string }[] = [
  { key: "pm2_5", label: "PM2.5" },
  { key: "pm10", label: "PM10" },
  { key: "o3", label: "Ozone (O₃)" },
  { key: "no2", label: "NO₂" },
  { key: "so2", label: "SO₂" },
  { key: "co", label: "CO" },
  { key: "no", label: "NO" },
  { key: "nh3", label: "NH₃" },
];

async function geocode(query: string): Promise<GeoResult[]> {
  const res = await fetch(`/api/openweather/geo?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Location lookup failed");
  const data = await res.json();
  return data.results ?? [];
}

async function fetchPollution(loc: GeoResult): Promise<AirPollution> {
  const res = await fetch(
    `/api/openweather/air-pollution?lat=${loc.lat}&lon=${loc.lon}`
  );
  if (!res.ok) throw new Error("Air pollution fetch failed");
  return res.json();
}

export default function AirPollution() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [location, setLocation] = useState<GeoResult | null>(null);
  const [data, setData] = useState<AirPollution | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setData(null);

    try {
      const results = await geocode(query.trim());
      if (results.length === 0) {
        setError("No location found. Try a city name or airport city.");
        return;
      }
      if (results.length === 1) {
        await load(results[0]);
      } else {
        setSuggestions(results);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function load(loc: GeoResult) {
    setLoading(true);
    setSuggestions([]);
    setError(null);
    try {
      const result = await fetchPollution(loc);
      setLocation(loc);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const reading = data?.list?.[0] ?? null;
  const aqi = reading ? AQI_LEVELS[reading.main.aqi] ?? AQI_LEVELS[3] : null;

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-zinc-800/50">
          <CardTitle className="text-2xl font-light text-zinc-100">
            Air Pollution
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Search a city or airport location for the current Air Quality Index
            and pollutant concentrations. Powered by{" "}
            <span className="font-medium text-sky-400">OpenWeather</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter city or airport location (e.g. Dubai, London, New York)"
              className="flex-1 border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-sm"
            />
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-5 h-[42px] text-sm font-medium transition-all duration-300 disabled:opacity-50 shadow-lg shadow-sky-500/20"
            >
              <Search className="w-4 h-4 mr-2" />
              {loading ? "Loading…" : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-red-500/30 bg-red-500/10 backdrop-blur-sm rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-red-300">
              <div className="p-1 bg-red-500/20 rounded-full">
                <AlertCircle className="w-4 h-4" />
              </div>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {suggestions.length > 1 && (
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardContent className="p-4">
            <p className="text-sm text-zinc-400 mb-3">
              Multiple locations found — select one:
            </p>
            <div className="space-y-2">
              {suggestions.map((loc, i) => (
                <button
                  key={`${loc.lat}-${loc.lon}-${i}`}
                  onClick={() => load(loc)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-zinc-800/50 bg-black/20 hover:bg-sky-500/10 hover:border-sky-500/30 transition-all text-sm"
                >
                  <span className="font-medium text-zinc-200">{loc.name}</span>
                  <span className="text-zinc-500 ml-2">
                    {loc.state ? `${loc.state}, ` : ""}
                    {loc.country}
                  </span>
                  <span className="text-xs text-zinc-500 ml-2 font-mono">
                    {loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {reading && aqi && location && (
        <>
          {/* AQI summary */}
          <Card className={`rounded-2xl overflow-hidden backdrop-blur-xl ${aqi.bg} ${aqi.border}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-2xl font-light text-zinc-100">
                    {location.name}
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    {location.state ? `${location.state}, ` : ""}
                    {location.country}
                    <span className="font-mono ml-2 text-xs text-zinc-500">
                      {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Wind className={`w-5 h-5 ${aqi.text}`} />
                    <span className={`text-3xl font-light ${aqi.text}`}>
                      {aqi.label}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-sm">
                    Air Quality Index {reading.main.aqi} / 5
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pollutant concentrations */}
          <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-zinc-800/50">
              <CardTitle className="text-base font-light text-zinc-100 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-sky-400" />
                Pollutant Concentrations
              </CardTitle>
              <CardDescription className="text-zinc-500 text-xs">
                Measured in μg/m³
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {POLLUTANTS.map((p) => (
                  <div
                    key={p.key}
                    className="bg-black/20 border border-zinc-800/50 rounded-xl p-4"
                  >
                    <p className="text-xs text-zinc-500">{p.label}</p>
                    <p className="text-lg font-light text-zinc-100">
                      {reading.components[p.key].toFixed(2)}
                    </p>
                    <p className="text-[10px] text-zinc-600">μg/m³</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
