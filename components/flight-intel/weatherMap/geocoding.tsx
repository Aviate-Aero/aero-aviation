"use client";

import { useState } from "react";
import { Search, MapPin, Navigation, Hash, AlertCircle } from "lucide-react";
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
  zip?: string;
}

type Mode = "name" | "coords" | "zip";

const MODES: { id: Mode; label: string; icon: typeof MapPin }[] = [
  { id: "name", label: "By Name", icon: MapPin },
  { id: "coords", label: "By Coordinates", icon: Navigation },
  { id: "zip", label: "By Zip", icon: Hash },
];

export default function Geocoding() {
  const [mode, setMode] = useState<Mode>("name");
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GeoResult[]>([]);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      if (mode === "name") {
        if (!name.trim()) return;
        const res = await fetch(
          `/api/openweather/geo?q=${encodeURIComponent(name.trim())}`
        );
        if (!res.ok) throw new Error("Lookup failed");
        const data = await res.json();
        if (!data.results?.length) {
          setError("No matching location found.");
          return;
        }
        setResults(data.results);
      } else if (mode === "coords") {
        const latNum = Number(lat);
        const lonNum = Number(lon);
        if (
          !Number.isFinite(latNum) ||
          !Number.isFinite(lonNum) ||
          Math.abs(latNum) > 90 ||
          Math.abs(lonNum) > 180
        ) {
          setError("Enter a valid latitude (−90…90) and longitude (−180…180).");
          return;
        }
        const res = await fetch(
          `/api/openweather/geo-reverse?lat=${latNum}&lon=${lonNum}`
        );
        if (!res.ok) throw new Error("Reverse lookup failed");
        const data = await res.json();
        if (!data.results?.length) {
          setError("No place found at those coordinates.");
          return;
        }
        setResults(data.results);
      } else {
        if (!zip.trim()) return;
        const res = await fetch(
          `/api/openweather/geo-zip?zip=${encodeURIComponent(zip.trim())}`
        );
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setError(data?.error ?? "Zip lookup failed");
          return;
        }
        setResults([data.result]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-zinc-800/50">
          <CardTitle className="text-2xl font-light text-zinc-100">
            Geocoding
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Convert between place names, coordinates and post codes. Powered by{" "}
            <span className="font-medium text-sky-400">OpenWeather</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Mode selector */}
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => {
              const Icon = m.icon;
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMode(m.id);
                    setError(null);
                    setResults([]);
                  }}
                  className={[
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                    active
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      : "border border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Inputs */}
          <form onSubmit={run} className="flex flex-wrap gap-2">
            {mode === "name" && (
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="City name (e.g. London, GB)"
                className="flex-1 min-w-[220px] border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-sm"
              />
            )}

            {mode === "coords" && (
              <>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="Latitude (e.g. 51.5074)"
                  className="flex-1 min-w-[160px] border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-sm"
                />
                <Input
                  type="text"
                  inputMode="decimal"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  placeholder="Longitude (e.g. -0.1278)"
                  className="flex-1 min-w-[160px] border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-sm"
                />
              </>
            )}

            {mode === "zip" && (
              <Input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="Zip / post code with country (e.g. 94040,US)"
                className="flex-1 min-w-[220px] border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-sm"
              />
            )}

            <Button
              type="submit"
              disabled={loading}
              className="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-5 h-[42px] text-sm font-medium transition-all duration-300 disabled:opacity-50 shadow-lg shadow-sky-500/20"
            >
              <Search className="w-4 h-4 mr-2" />
              {loading ? "Looking…" : "Lookup"}
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

      {/* Results */}
      {results.length > 0 && (
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-zinc-800/50">
            <CardTitle className="text-base font-light text-zinc-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              {results.length} {results.length === 1 ? "Match" : "Matches"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {results.map((r, i) => (
                <div
                  key={`${r.lat}-${r.lon}-${i}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/50 bg-black/20 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      {r.name}
                      {r.zip ? (
                        <span className="text-zinc-500 ml-2 font-mono text-xs">
                          {r.zip}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {r.state ? `${r.state}, ` : ""}
                      {r.country}
                    </p>
                  </div>
                  <p className="font-mono text-xs text-sky-400 text-right shrink-0">
                    {r.lat.toFixed(4)}°, {r.lon.toFixed(4)}°
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
