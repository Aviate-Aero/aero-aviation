"use client";

import { useState } from "react";
import {
  Search,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Gauge,
  Cloud,
  CloudRain,
  Snowflake,
  Waves,
  Mountain,
  Sunrise,
  Sunset,
  Navigation,
  AlertCircle,
  CloudSun,
  Calendar,
  CalendarDays,
  Clock,
} from "lucide-react";
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

interface CurrentWeather {
  weather: { id: number; main: string; description: string; icon: string }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: { speed: number; deg: number; gust?: number };
  rain?: { "1h"?: number; "3h"?: number };
  snow?: { "1h"?: number; "3h"?: number };
  clouds: { all: number };
  dt: number;
  sys: { country?: string; sunrise?: number; sunset?: number };
  timezone: number;
  name: string;
}

type WeatherIcon = { id: number; main: string; description: string; icon: string };

// 5 day / 3 hour forecast — one entry per 3-hour step.
interface ForecastSlice {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: WeatherIcon[];
  clouds: { all: number };
  wind: { speed: number; deg: number; gust?: number };
  visibility: number;
  pop: number; // probability of precipitation, 0..1
  rain?: { "3h"?: number };
  snow?: { "3h"?: number };
  dt_txt: string;
}

interface Forecast5 {
  list: ForecastSlice[];
  city: { timezone: number; sunrise: number; sunset: number };
}

// Daily 16 day forecast — one entry per day (paid endpoint).
interface DailySlice {
  dt: number;
  temp: { day: number; min: number; max: number; night: number; eve: number; morn: number };
  feels_like: { day: number };
  pressure: number;
  humidity: number;
  weather: WeatherIcon[];
  speed: number;
  deg: number;
  gust?: number;
  clouds: number;
  pop: number;
  rain?: number;
  snow?: number;
}

interface Forecast16 {
  list: DailySlice[];
  city: { timezone: number };
}

const MS_TO_KNOTS = 1.94384;

function windDirection(deg: number): string {
  const dirs = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
  ];
  return dirs[Math.round(deg / 22.5) % 16];
}

// Format a UTC unix timestamp into the searched location's local time, using
// the timezone offset (seconds) OpenWeather returns alongside the data.
function localTime(unix: number, tzOffsetSeconds: number): string {
  const date = new Date((unix + tzOffsetSeconds) * 1000);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

// Shift a UTC unix timestamp by the location's tz offset, then format a date
// part in UTC so the result reflects local calendar time at that location.
function shifted(unix: number, tz: number): Date {
  return new Date((unix + tz) * 1000);
}

function dayKey(unix: number, tz: number): string {
  return shifted(unix, tz).toISOString().slice(0, 10);
}

function weekdayLabel(unix: number, tz: number): string {
  return shifted(unix, tz).toLocaleDateString([], {
    weekday: "short",
    timeZone: "UTC",
  });
}

function dateLabel(unix: number, tz: number): string {
  return shifted(unix, tz).toLocaleDateString([], {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function hourLabel(unix: number, tz: number): string {
  return shifted(unix, tz).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

// Collapse the 3-hourly 5-day list into per-day summaries.
interface DaySummary {
  key: string;
  dt: number;
  min: number;
  max: number;
  pop: number;
  windKts: number;
  icon?: string;
  desc?: string;
}

function summarizeByDay(f5: Forecast5): DaySummary[] {
  const tz = f5.city.timezone;
  const groups = new Map<string, ForecastSlice[]>();

  for (const slice of f5.list) {
    const key = dayKey(slice.dt, tz);
    const bucket = groups.get(key);
    if (bucket) bucket.push(slice);
    else groups.set(key, [slice]);
  }

  return Array.from(groups.entries()).map(([key, slices]) => {
    // Representative icon = the slice closest to local noon.
    const noon = slices.reduce((best, s) => {
      const h = shifted(s.dt, tz).getUTCHours();
      const bh = shifted(best.dt, tz).getUTCHours();
      return Math.abs(h - 12) < Math.abs(bh - 12) ? s : best;
    }, slices[0]);

    return {
      key,
      dt: slices[0].dt,
      min: Math.min(...slices.map((s) => s.main.temp_min)),
      max: Math.max(...slices.map((s) => s.main.temp_max)),
      pop: Math.max(...slices.map((s) => s.pop ?? 0)),
      windKts: Math.round(Math.max(...slices.map((s) => s.wind.speed)) * MS_TO_KNOTS),
      icon: noon.weather[0]?.icon,
      desc: noon.weather[0]?.description,
    };
  });
}

async function geocode(query: string): Promise<GeoResult[]> {
  const res = await fetch(`/api/openweather/geo?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Location lookup failed");
  const data = await res.json();
  return data.results ?? [];
}

async function fetchCurrent(loc: GeoResult): Promise<CurrentWeather> {
  const res = await fetch(
    `/api/openweather/current?lat=${loc.lat}&lon=${loc.lon}`
  );
  if (!res.ok) throw new Error("Weather fetch failed");
  return res.json();
}

async function fetchForecast5(loc: GeoResult): Promise<Forecast5> {
  const res = await fetch(
    `/api/openweather/forecast?lat=${loc.lat}&lon=${loc.lon}`
  );
  if (!res.ok) throw new Error("5-day forecast unavailable");
  return res.json();
}

async function fetchForecast16(loc: GeoResult): Promise<Forecast16> {
  const res = await fetch(
    `/api/openweather/forecast-daily?lat=${loc.lat}&lon=${loc.lon}`
  );
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "16-day forecast unavailable");
  }
  return res.json();
}

export default function LiveWeather() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [location, setLocation] = useState<GeoResult | null>(null);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [forecast5, setForecast5] = useState<Forecast5 | null>(null);
  const [forecast16, setForecast16] = useState<Forecast16 | null>(null);
  const [forecast16Error, setForecast16Error] = useState<string | null>(null);
  const [view, setView] = useState<"now" | "5day" | "16day">("now");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setWeather(null);

    try {
      const results = await geocode(query.trim());
      if (results.length === 0) {
        setError("No location found. Try a city name or airport city.");
        return;
      }
      if (results.length === 1) {
        await loadWeather(results[0]);
      } else {
        setSuggestions(results);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function loadWeather(loc: GeoResult) {
    setLoading(true);
    setSuggestions([]);
    setError(null);
    setForecast5(null);
    setForecast16(null);
    setForecast16Error(null);
    setView("now");
    try {
      const data = await fetchCurrent(loc);
      setLocation(loc);
      setWeather(data);

      // Forecasts are supplementary — load them independently so a failure
      // (e.g. 16-day not on the plan) never blocks the current conditions.
      fetchForecast5(loc)
        .then(setForecast5)
        .catch(() => setForecast5(null));

      fetchForecast16(loc)
        .then((f) => {
          setForecast16(f);
          setForecast16Error(null);
        })
        .catch((err) =>
          setForecast16Error(
            err instanceof Error ? err.message : "16-day forecast unavailable"
          )
        );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const windKts = weather ? Math.round(weather.wind.speed * MS_TO_KNOTS) : 0;
  const gustKts =
    weather && weather.wind.gust != null
      ? Math.round(weather.wind.gust * MS_TO_KNOTS)
      : null;

  // OpenWeather only includes rain/snow keys when precipitation is occurring,
  // and reports a 1h volume (falling back to 3h) in mm.
  const rainMm = weather?.rain?.["1h"] ?? weather?.rain?.["3h"] ?? null;
  const snowMm = weather?.snow?.["1h"] ?? weather?.snow?.["3h"] ?? null;

  const daySummaries = forecast5 ? summarizeByDay(forecast5) : [];
  // First 8 slices = next ~24h of 3-hourly data.
  const next24h = forecast5 ? forecast5.list.slice(0, 8) : [];

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-zinc-800/50">
          <CardTitle className="text-2xl font-light text-zinc-100">
            Live Weather
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Search by city or airport location for current surface conditions —
            temperature, wind, pressure and visibility. 
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

      {/* Location suggestions */}
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
                  onClick={() => loadWeather(loc)}
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

      {/* Weather result */}
      {weather && location && (
        <>
          {/* Forecast range sub-tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "now" as const, label: "Now", icon: CloudSun },
              { id: "5day" as const, label: "5-Day", icon: Calendar },
              { id: "16day" as const, label: "16-Day", icon: CalendarDays },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = view === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setView(tab.id)}
                  className={[
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                    active
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      : "border border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {view === "now" && (
          <>
          <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    {weather.weather[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                        alt={weather.weather[0].description}
                        width={56}
                        height={56}
                        className="h-14 w-14"
                      />
                    )}
                    <h3 className="text-2xl font-light text-zinc-100">
                      {location.name}
                    </h3>
                  </div>
                  <p className="text-zinc-400 text-sm">
                    {location.state ? `${location.state}, ` : ""}
                    {location.country}
                    <span className="font-mono ml-2 text-xs text-zinc-500">
                      {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
                    </span>
                  </p>
                  {weather.weather[0] && (
                    <p className="text-zinc-300 text-sm mt-1 capitalize">
                      {weather.weather[0].description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-4xl font-light text-zinc-100">
                    {Math.round(weather.main.temp)}°C
                  </p>
                  <p className="text-zinc-500 text-sm">
                    Feels like {Math.round(weather.main.feels_like)}°C
                  </p>
                </div>
              </div>

              {/* Condition cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-3 flex items-center gap-3">
                  <Wind className="w-5 h-5 text-sky-400 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500">Surface Wind</p>
                    <p className="font-medium text-zinc-200 text-sm">
                      {windKts} kts
                    </p>
                    <p className="text-xs text-zinc-500">
                      {windDirection(weather.wind.deg)} ({Math.round(weather.wind.deg)}°)
                      {gustKts != null ? ` · G${gustKts}` : ""}
                    </p>
                  </div>
                </div>

                <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-3 flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-teal-400 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500">Humidity</p>
                    <p className="font-medium text-zinc-200 text-sm">
                      {weather.main.humidity}%
                    </p>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3">
                  <Eye className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500">Visibility</p>
                    <p className="font-medium text-zinc-200 text-sm">
                      {weather.visibility >= 1000
                        ? `${(weather.visibility / 1000).toFixed(1)} km`
                        : `${weather.visibility} m`}
                    </p>
                  </div>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3 flex items-center gap-3">
                  <Gauge className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500">Pressure</p>
                    <p className="font-medium text-zinc-200 text-sm">
                      {weather.main.pressure} hPa
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secondary details */}
          <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-zinc-800/50">
              <CardTitle className="text-base font-light text-zinc-100 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-sky-400" />
                Conditions Detail
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-black/20 border border-zinc-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-zinc-500">Min / Max</span>
                  </div>
                  <p className="text-lg font-light text-zinc-100">
                    {Math.round(weather.main.temp_min)}° /{" "}
                    {Math.round(weather.main.temp_max)}°C
                  </p>
                </div>

                <div className="bg-black/20 border border-zinc-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Cloud className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs text-zinc-500">Cloud Cover</span>
                  </div>
                  <p className="text-lg font-light text-zinc-100">
                    {weather.clouds.all}%
                  </p>
                </div>

                <div className="bg-black/20 border border-zinc-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sunrise className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-zinc-500">Sunrise</span>
                  </div>
                  <p className="text-lg font-light text-zinc-100">
                    {weather.sys.sunrise
                      ? localTime(weather.sys.sunrise, weather.timezone)
                      : "—"}
                  </p>
                </div>

                <div className="bg-black/20 border border-zinc-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sunset className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-zinc-500">Sunset</span>
                  </div>
                  <p className="text-lg font-light text-zinc-100">
                    {weather.sys.sunset
                      ? localTime(weather.sys.sunset, weather.timezone)
                      : "—"}
                  </p>
                </div>

                <div className="bg-black/20 border border-zinc-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-4 h-4 text-sky-400" />
                    <span className="text-xs text-zinc-500">Wind Gust</span>
                  </div>
                  <p className="text-lg font-light text-zinc-100">
                    {gustKts != null ? `${gustKts} kts` : "—"}
                  </p>
                </div>

                <div className="bg-black/20 border border-zinc-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-zinc-500">Observed</span>
                  </div>
                  <p className="text-lg font-light text-zinc-100">
                    {localTime(weather.dt, weather.timezone)} LT
                  </p>
                </div>

                <div className="bg-black/20 border border-zinc-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CloudRain className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-zinc-500">Rain (last 1h)</span>
                  </div>
                  <p className="text-lg font-light text-zinc-100">
                    {rainMm != null ? `${rainMm} mm` : "None"}
                  </p>
                </div>

                <div className="bg-black/20 border border-zinc-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Snowflake className="w-4 h-4 text-cyan-300" />
                    <span className="text-xs text-zinc-500">Snow (last 1h)</span>
                  </div>
                  <p className="text-lg font-light text-zinc-100">
                    {snowMm != null ? `${snowMm} mm` : "None"}
                  </p>
                </div>

                <div className="bg-black/20 border border-zinc-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Waves className="w-4 h-4 text-sky-400" />
                    <span className="text-xs text-zinc-500">Sea-Level Pressure</span>
                  </div>
                  <p className="text-lg font-light text-zinc-100">
                    {weather.main.sea_level != null
                      ? `${weather.main.sea_level} hPa`
                      : "—"}
                  </p>
                </div>

                <div className="bg-black/20 border border-zinc-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mountain className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-zinc-500">Ground-Level Pressure</span>
                  </div>
                  <p className="text-lg font-light text-zinc-100">
                    {weather.main.grnd_level != null
                      ? `${weather.main.grnd_level} hPa`
                      : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          </>
          )}

          {/* 5-Day / 3-Hour forecast */}
          {view === "5day" && (
            <>
              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-zinc-800/50">
                  <CardTitle className="text-base font-light text-zinc-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-400" />
                    5-Day Forecast
                  </CardTitle>
                  <CardDescription className="text-zinc-500 text-xs">
                    Daily high / low, precipitation chance and peak wind.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {forecast5 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {daySummaries.map((d) => (
                        <div
                          key={d.key}
                          className="bg-black/20 border border-zinc-800/50 rounded-xl p-4 text-center"
                        >
                          <p className="text-sm font-medium text-zinc-200">
                            {weekdayLabel(d.dt, forecast5.city.timezone)}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {dateLabel(d.dt, forecast5.city.timezone)}
                          </p>
                          {d.icon && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`}
                              alt={d.desc ?? ""}
                              width={56}
                              height={56}
                              className="mx-auto h-14 w-14"
                            />
                          )}
                          <p className="text-lg font-light text-zinc-100">
                            {Math.round(d.max)}°{" "}
                            <span className="text-zinc-500 text-sm">
                              / {Math.round(d.min)}°
                            </span>
                          </p>
                          {d.desc && (
                            <p className="text-[11px] text-zinc-400 capitalize mt-1">
                              {d.desc}
                            </p>
                          )}
                          <div className="mt-2 pt-2 border-t border-zinc-800/50 flex items-center justify-center gap-3 text-xs">
                            <span className="text-blue-400">
                              {Math.round(d.pop * 100)}%
                            </span>
                            <span className="text-sky-400">{d.windKts} kts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400">Loading forecast…</p>
                  )}
                </CardContent>
              </Card>

              {forecast5 && next24h.length > 0 && (
                <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
                  <CardHeader className="pb-3 border-b border-zinc-800/50">
                    <CardTitle className="text-base font-light text-zinc-100 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      Next 24 Hours (3-hourly)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                      {next24h.map((slice) => (
                        <div
                          key={slice.dt}
                          className="bg-black/20 border border-zinc-800/50 rounded-xl p-3 text-center"
                        >
                          <p className="text-xs text-zinc-500">
                            {hourLabel(slice.dt, forecast5.city.timezone)}
                          </p>
                          {slice.weather[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`https://openweathermap.org/img/wn/${slice.weather[0].icon}.png`}
                              alt={slice.weather[0].description}
                              width={40}
                              height={40}
                              className="mx-auto h-10 w-10"
                            />
                          )}
                          <p className="font-medium text-zinc-200 text-sm">
                            {Math.round(slice.main.temp)}°C
                          </p>
                          <div className="mt-1 text-[11px]">
                            <p className="text-sky-400">
                              {Math.round(slice.wind.speed * MS_TO_KNOTS)} kts
                            </p>
                            <p className="text-blue-400">
                              {Math.round((slice.pop ?? 0) * 100)}% rain
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* 16-Day daily forecast */}
          {view === "16day" && (
            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-zinc-800/50">
                <CardTitle className="text-base font-light text-zinc-100 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-sky-400" />
                  16-Day Forecast
                </CardTitle>
                <CardDescription className="text-zinc-500 text-xs">
                  Daily outlook — day temp, high / low, precip chance and wind.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {forecast16 ? (
                  <div className="space-y-2">
                    {forecast16.list.map((d) => (
                      <div
                        key={d.dt}
                        className="flex items-center gap-3 rounded-xl border border-zinc-800/50 bg-black/20 px-4 py-3"
                      >
                        <div className="w-20 shrink-0">
                          <p className="text-sm font-medium text-zinc-200">
                            {weekdayLabel(d.dt, forecast16.city.timezone)}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {dateLabel(d.dt, forecast16.city.timezone)}
                          </p>
                        </div>
                        {d.weather[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`https://openweathermap.org/img/wn/${d.weather[0].icon}.png`}
                            alt={d.weather[0].description}
                            width={40}
                            height={40}
                            className="h-10 w-10 shrink-0"
                          />
                        )}
                        <p className="hidden sm:block flex-1 text-xs text-zinc-400 capitalize">
                          {d.weather[0]?.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-blue-400 w-12 text-right">
                            {Math.round((d.pop ?? 0) * 100)}%
                          </span>
                          <span className="text-sky-400 w-16 text-right">
                            {Math.round(d.speed * MS_TO_KNOTS)} kts
                          </span>
                          <span className="text-zinc-100 w-20 text-right">
                            {Math.round(d.temp.max)}°{" "}
                            <span className="text-zinc-500">
                              / {Math.round(d.temp.min)}°
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-sm">
                      {forecast16Error ??
                        "Loading 16-day forecast…"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
