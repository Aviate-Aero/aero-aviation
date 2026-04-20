'use client';

import { useState } from 'react';
import { Search, Wind, Thermometer, Droplets, Eye, CloudRain, Navigation, AlertCircle } from 'lucide-react';
import { Button } from '@/components/buttons/Standard';
import { Input } from '@/components/input/Standard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card/Standard';

interface GeoResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface WeatherData {
  location: GeoResult;
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    precipitation: number;
    weather_code: number;
    visibility: number;
  };
  current_units: Record<string, string>;
  hourly: {
    time: string[];
    temperature_2m: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    precipitation_probability: number[];
    windspeed_850hpa: number[];
    winddirection_850hpa: number[];
    windspeed_700hpa: number[];
    winddirection_700hpa: number[];
    windspeed_500hpa: number[];
    winddirection_500hpa: number[];
  };
}

function windDirection(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function weatherDescription(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 9) return 'Foggy';
  if (code <= 19) return 'Drizzle';
  if (code <= 29) return 'Rain';
  if (code <= 39) return 'Snow';
  if (code <= 49) return 'Freezing drizzle';
  if (code <= 59) return 'Rain showers';
  if (code <= 69) return 'Snow showers';
  if (code <= 79) return 'Hail';
  if (code <= 84) return 'Rain showers';
  if (code <= 94) return 'Snow showers';
  return 'Thunderstorm';
}

function weatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 9) return '🌫️';
  if (code <= 29) return '🌧️';
  if (code <= 49) return '🌨️';
  if (code <= 69) return '🌧️';
  if (code <= 79) return '🌨️';
  if (code <= 84) return '🌦️';
  if (code <= 94) return '❄️';
  return '⛈️';
}

async function geocode(query: string): Promise<GeoResult[]> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
  );
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  return data.results ?? [];
}

async function fetchWeather(location: GeoResult): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,weather_code,visibility',
    hourly: 'temperature_2m,wind_speed_10m,wind_direction_10m,precipitation_probability,windspeed_850hPa,winddirection_850hPa,windspeed_700hPa,winddirection_700hPa,windspeed_500hPa,winddirection_500hPa',
    wind_speed_unit: 'kn',
    timezone: 'auto',
    forecast_days: '1',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error('Weather fetch failed');
  const data = await res.json();
  return {
    location,
    current: data.current,
    current_units: data.current_units,
    hourly: {
      time: data.hourly.time,
      temperature_2m: data.hourly.temperature_2m,
      wind_speed_10m: data.hourly.wind_speed_10m,
      wind_direction_10m: data.hourly.wind_direction_10m,
      precipitation_probability: data.hourly.precipitation_probability,
      windspeed_850hpa: data.hourly.windspeed_850hPa,
      winddirection_850hpa: data.hourly.winddirection_850hPa,
      windspeed_700hpa: data.hourly.windspeed_700hPa,
      winddirection_700hpa: data.hourly.winddirection_700hPa,
      windspeed_500hpa: data.hourly.windspeed_500hPa,
      winddirection_500hpa: data.hourly.winddirection_500hPa,
    },
  };
}

export default function WeatherTracker() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);

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
        setError('No location found. Try a city name or airport city.');
        return;
      }
      if (results.length === 1) {
        const data = await fetchWeather(results[0]);
        setWeather(data);
      } else {
        setSuggestions(results);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function selectLocation(loc: GeoResult) {
    setLoading(true);
    setSuggestions([]);
    setError(null);
    try {
      const data = await fetchWeather(loc);
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const nowHourIndex = weather
    ? (() => {
        const nowISO = new Date().toISOString().slice(0, 13);
        const idx = weather.hourly.time.findIndex((t) => t.startsWith(nowISO));
        return idx >= 0 ? idx : 0;
      })()
    : 0;

  const nextHours = weather ? weather.hourly.time.slice(nowHourIndex, nowHourIndex + 6) : [];

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-zinc-800/50">
          <CardTitle className="text-2xl font-light text-zinc-100">Aviation Weather</CardTitle>
          <CardDescription className="text-zinc-400">
            Search by city or airport location to get current weather and wind conditions at multiple flight levels.
            Powered by <span className="font-medium text-sky-400">Open-Meteo</span>.
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
              {loading ? 'Loading…' : 'Search'}
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
            <p className="text-sm text-zinc-400 mb-3">Multiple locations found — select one:</p>
            <div className="space-y-2">
              {suggestions.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => selectLocation(loc)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-zinc-800/50 bg-black/20 hover:bg-sky-500/10 hover:border-sky-500/30 transition-all text-sm"
                >
                  <span className="font-medium text-zinc-200">{loc.name}</span>
                  <span className="text-zinc-500 ml-2">
                    {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                  </span>
                  <span className="text-xs text-zinc-500 ml-2 font-mono">
                    {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather results */}
      {weather && (
        <>
          {/* Location header */}
          <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl">{weatherEmoji(weather.current.weather_code)}</span>
                    <h3 className="text-2xl font-light text-zinc-100">{weather.location.name}</h3>
                  </div>
                  <p className="text-zinc-400 text-sm">
                    {weather.location.admin1 ? `${weather.location.admin1}, ` : ''}{weather.location.country}
                    <span className="font-mono ml-2 text-xs text-zinc-500">
                      {weather.location.latitude.toFixed(4)}°N {weather.location.longitude.toFixed(4)}°E
                    </span>
                  </p>
                  <p className="text-zinc-300 text-sm mt-1">{weatherDescription(weather.current.weather_code)}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-light text-zinc-100">{Math.round(weather.current.temperature_2m)}°C</p>
                  <p className="text-zinc-500 text-sm">Surface temp</p>
                </div>
              </div>

              {/* Current condition cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-3 flex items-center gap-3">
                  <Wind className="w-5 h-5 text-sky-400 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500">Surface Wind</p>
                    <p className="font-medium text-zinc-200 text-sm">
                      {Math.round(weather.current.wind_speed_10m)} kts
                    </p>
                    <p className="text-xs text-zinc-500">
                      {windDirection(weather.current.wind_direction_10m)} ({Math.round(weather.current.wind_direction_10m)}°)
                    </p>
                  </div>
                </div>

                <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-3 flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-teal-400 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500">Humidity</p>
                    <p className="font-medium text-zinc-200 text-sm">{weather.current.relative_humidity_2m}%</p>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3">
                  <Eye className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500">Visibility</p>
                    <p className="font-medium text-zinc-200 text-sm">
                      {weather.current.visibility >= 1000
                        ? `${(weather.current.visibility / 1000).toFixed(1)} km`
                        : `${weather.current.visibility} m`}
                    </p>
                  </div>
                </div>

                <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3 flex items-center gap-3">
                  <CloudRain className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500">Precipitation</p>
                    <p className="font-medium text-zinc-200 text-sm">{weather.current.precipitation} mm</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pressure level winds */}
          <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-zinc-800/50">
              <CardTitle className="text-base font-light text-zinc-100 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-sky-400" />
                Wind at Flight Levels (Current Hour)
              </CardTitle>
              <CardDescription className="text-zinc-500 text-xs">
                Pressure level wind data — relevant for flight planning
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: '5,000 ft',
                    hPa: '850 hPa',
                    speed: weather.hourly.windspeed_850hpa[nowHourIndex],
                    dir: weather.hourly.winddirection_850hpa[nowHourIndex],
                    color: 'border-emerald-500/30 bg-emerald-500/5',
                    dot: 'bg-emerald-400',
                  },
                  {
                    label: '10,000 ft',
                    hPa: '700 hPa',
                    speed: weather.hourly.windspeed_700hpa[nowHourIndex],
                    dir: weather.hourly.winddirection_700hpa[nowHourIndex],
                    color: 'border-sky-500/30 bg-sky-500/5',
                    dot: 'bg-sky-400',
                  },
                  {
                    label: '18,000 ft',
                    hPa: '500 hPa',
                    speed: weather.hourly.windspeed_500hpa[nowHourIndex],
                    dir: weather.hourly.winddirection_500hpa[nowHourIndex],
                    color: 'border-indigo-500/30 bg-indigo-500/5',
                    dot: 'bg-indigo-400',
                  },
                ].map((level) => (
                  <div key={level.hPa} className={`rounded-xl border p-4 ${level.color}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-zinc-200 text-sm">{level.label}</span>
                      <span className={`w-2 h-2 rounded-full ${level.dot}`} />
                    </div>
                    <p className="text-xs text-zinc-500 mb-3">{level.hPa}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-light text-zinc-100">{Math.round(level.speed ?? 0)}</p>
                        <p className="text-xs text-zinc-500">knots</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-zinc-300">{windDirection(level.dir ?? 0)}</p>
                        <p className="text-xs text-zinc-500">{Math.round(level.dir ?? 0)}°</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hourly forecast */}
          <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-zinc-800/50">
              <CardTitle className="text-base font-light text-zinc-100 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                6-Hour Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {nextHours.map((time, i) => {
                  const idx = nowHourIndex + i;
                  const hour = new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={time} className="bg-black/20 border border-zinc-800/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-zinc-500 mb-1">{hour}</p>
                      <p className="font-medium text-zinc-200 text-sm">
                        {Math.round(weather.hourly.temperature_2m[idx])}°C
                      </p>
                      <div className="mt-2 pt-2 border-t border-zinc-800/50">
                        <p className="text-xs text-sky-400 font-medium">
                          {Math.round(weather.hourly.wind_speed_10m[idx])} kts
                        </p>
                        <p className="text-xs text-zinc-500">
                          {windDirection(weather.hourly.wind_direction_10m[idx])}
                        </p>
                      </div>
                      <p className="text-xs text-purple-400 mt-1">
                        {weather.hourly.precipitation_probability[idx]}% rain
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}