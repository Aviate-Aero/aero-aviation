'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building,
  Clock,
  Compass,
  Flag,
  Globe,
  Hash,
  Layers,
  List,
  Loader2,
  MapPin,
  Navigation,
  PlaneLanding,
  Ruler,
} from 'lucide-react';
import { Button } from '@/components/buttons/Standard';
import { Input } from '@/components/input/Standard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card/Standard';
import { Badge } from '@/components/badge/Standard';

interface AirportRunway {
  designator: string;
  heading?: number;
  length?: number;
  width?: number;
  elevation?: number;
  threshold_coordinates?: number[];
  surface_type?: string;
  surface_description?: string;
}

interface Airport {
  iata: string;
  icao: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  country_code?: string;
  elevation?: number;
  elevation_meters?: number;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  timezone_offset?: number;
  timezone_offset_hours?: number;
  runways?: AirportRunway[];
}

interface AirportInformationProps {
  onAirportSelect?: (airport: Airport) => void;
}

type DetailItem = {
  label: string;
  value?: string | number;
  icon: React.ReactNode;
};

export default function AirportInformation({ onAirportSelect }: AirportInformationProps) {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);

  const searchAirports = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setError(null);
    setSelectedAirport(null);

    try {
      if (!searchQuery.trim()) {
        setError('Please enter an airport IATA or ICAO code');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/airports?query=${encodeURIComponent(searchQuery.trim())}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to fetch airport data');
      }

      const data = await response.json();

      let airportData: Airport[] = [];
      if (Array.isArray(data)) {
        airportData = data;
      } else if (data.data && Array.isArray(data.data)) {
        airportData = data.data;
      } else if (data.iata || data.icao) {
        airportData = [data];
      } else {
        throw new Error('No airport data found');
      }

      setAirports(airportData);
      if (airportData.length > 0) {
        const firstAirport = airportData[0];
        setSelectedAirport(firstAirport);
        onAirportSelect?.(firstAirport);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAirports([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, onAirportSelect]);

  const handleAirportSelect = (airport: Airport) => {
    setSelectedAirport(airport);
    onAirportSelect?.(airport);
  };

  const selectedRunways = useMemo(() => selectedAirport?.runways ?? [], [selectedAirport?.runways]);
  const longestRunway = useMemo(() => {
    return selectedRunways.reduce<AirportRunway | null>((longest, runway) => {
      if (!runway.length) return longest;
      if (!longest?.length || runway.length > longest.length) return runway;
      return longest;
    }, null);
  }, [selectedRunways]);

  const locationItems: DetailItem[] = selectedAirport ? [
    {
      label: 'Coordinates',
      value: formatCoordinates(selectedAirport.latitude, selectedAirport.longitude),
      icon: <MapPin className="h-4 w-4 text-sky-400" />,
    },
    {
      label: 'Elevation',
      value: formatElevation(selectedAirport.elevation, selectedAirport.elevation_meters),
      icon: <Navigation className="h-4 w-4 text-purple-400" />,
    },
    {
      label: 'Timezone',
      value: formatTimezone(selectedAirport.timezone, selectedAirport.timezone_offset_hours),
      icon: <Clock className="h-4 w-4 text-emerald-400" />,
    },
    {
      label: 'Region',
      value: formatRegion(selectedAirport.city, selectedAirport.state, selectedAirport.country),
      icon: <Globe className="h-4 w-4 text-zinc-400" />,
    },
  ] : [];

  return (
    <div className="space-y-6">
      <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-zinc-800/50">
          <CardTitle className="text-2xl font-light text-zinc-100">Airport Search</CardTitle>
          <CardDescription className="text-zinc-400">
            Search detailed FlightRadar24 airport data by IATA or ICAO code
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={searchAirports} className="space-y-4">
            <label className="block text-sm font-medium text-zinc-400">
              Airport Code
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="e.g., LHR, DXB, EGLL, OMDB"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value.toUpperCase());
                  setError(null);
                }}
                className="flex-1 border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base font-mono"
                autoFocus
              />
              <Button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="h-[42px] px-6 bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50 whitespace-nowrap"
              >
                {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                {loading ? 'Searching...' : 'Search Airports'}
              </Button>
            </div>

            <p className="text-sm text-zinc-500">
              Use a 3-letter IATA code or 4-letter ICAO code.
            </p>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500/30 bg-red-500/10 backdrop-blur-sm rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-red-300">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{error}</p>
                <p className="text-sm text-red-400 mt-1">
                  Try codes like LHR, DXB, EGLL, or OMDB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {airports.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl h-full">
              <CardHeader className="pb-3 border-b border-zinc-800/50">
                <CardTitle className="flex items-center gap-2 text-zinc-100 font-light">
                  <List className="w-5 h-5 text-sky-400" />
                  Airport Results
                  <span className="ml-auto bg-sky-500/20 text-sky-400 text-xs font-medium px-2.5 py-0.5 rounded-full border border-sky-500/30">
                    {airports.length}
                  </span>
                </CardTitle>
                <CardDescription className="text-zinc-500">
                  Select an airport to inspect its full profile
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {airports.map((airport, index) => {
                    const isSelected = selectedAirport?.iata === airport.iata && selectedAirport?.icao === airport.icao;

                    return (
                      <button
                        key={`${airport.iata}-${airport.icao}-${index}`}
                        type="button"
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-sky-500 bg-sky-500/10'
                            : 'border-zinc-800/50 bg-black/20 hover:border-zinc-700 hover:bg-black/30'
                        }`}
                        onClick={() => handleAirportSelect(airport)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-light text-lg text-sky-400">{airport.iata || 'N/A'}</span>
                              <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                                {airport.icao || 'N/A'}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-zinc-200 mb-2 line-clamp-2">
                              {airport.name || 'Unknown airport'}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {formatRegion(airport.city, airport.state, airport.country)}
                            </div>
                          </div>
                          <Building className="w-6 h-6 text-zinc-600 shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedAirport && (
              <div className="space-y-6">
                <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <Building className="w-8 h-8 text-sky-400 mt-1 shrink-0" />
                          <div>
                            <h2 className="text-2xl font-light text-zinc-100">
                              {selectedAirport.name || 'Unknown airport'}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-zinc-400">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {formatRegion(selectedAirport.city, selectedAirport.state, selectedAirport.country)}
                              </span>
                              {selectedAirport.country_code && (
                                <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                                  {selectedAirport.country_code}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 min-w-52">
                        <CodePill label="IATA" value={selectedAirport.iata} tone="sky" />
                        <CodePill label="ICAO" value={selectedAirport.icao} tone="purple" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <MetricCard
                    icon={<PlaneLanding className="h-5 w-5 text-sky-400" />}
                    label="Runways"
                    value={selectedRunways.length}
                    detail={selectedRunways.length === 1 ? 'available runway' : 'available runways'}
                  />
                  <MetricCard
                    icon={<Ruler className="h-5 w-5 text-emerald-400" />}
                    label="Longest"
                    value={longestRunway?.length ? formatFeet(longestRunway.length) : 'N/A'}
                    detail={longestRunway?.designator ? `Runway ${longestRunway.designator}` : 'runway length'}
                  />
                  <MetricCard
                    icon={<Clock className="h-5 w-5 text-purple-400" />}
                    label="UTC Offset"
                    value={formatUtcOffset(selectedAirport.timezone_offset_hours)}
                    detail={selectedAirport.timezone || 'local timezone'}
                  />
                </div>

                <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                  <CardHeader className="pb-3 border-b border-zinc-800/50">
                    <CardTitle className="flex items-center gap-2 text-lg font-light text-zinc-100">
                      <Globe className="w-5 h-5 text-sky-400" />
                      Airport Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {locationItems.map((item) => (
                        <DetailTile key={item.label} item={item} />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                  <CardHeader className="pb-3 border-b border-zinc-800/50">
                    <CardTitle className="flex items-center gap-2 text-lg font-light text-zinc-100">
                      <PlaneLanding className="w-5 h-5 text-sky-400" />
                      Runway Details
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                      Dimensions, headings, thresholds, elevations, and surfaces from the full airport response
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {selectedRunways.length > 0 ? (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {selectedRunways.map((runway, index) => (
                          <RunwayCard key={`${runway.designator}-${index}`} runway={runway} />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-zinc-800/50 bg-black/20 p-6 text-center text-zinc-500">
                        No runway details were returned for this airport.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Building className="w-6 h-6 text-sky-400 mt-1 shrink-0" />
                      <div>
                        <h3 className="text-lg font-light text-zinc-100 mb-2">Airport Summary</h3>
                        <p className="text-zinc-400">
                          {selectedAirport.name || 'This airport'} ({selectedAirport.iata || 'N/A'}/{selectedAirport.icao || 'N/A'})
                          {selectedAirport.city && ` is located in ${selectedAirport.city}${selectedAirport.country ? `, ${selectedAirport.country}` : ''}.`}
                          {selectedAirport.elevation && ` Field elevation is ${formatElevation(selectedAirport.elevation, selectedAirport.elevation_meters)}.`}
                          {selectedAirport.timezone && ` It operates on ${selectedAirport.timezone}${formatUtcOffset(selectedAirport.timezone_offset_hours) !== 'N/A' ? ` (${formatUtcOffset(selectedAirport.timezone_offset_hours)})` : ''}.`}
                          {selectedRunways.length > 0 && ` The full profile includes ${selectedRunways.length} runway${selectedRunways.length === 1 ? '' : 's'}.`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      ) : !loading && !error && (
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Building className="w-24 h-24 text-zinc-600 mb-6" />
            <h3 className="text-2xl font-light text-zinc-300 mb-3">
              No Airport Selected
            </h3>
            <p className="text-zinc-500 max-w-md">
              Enter an IATA or ICAO airport code to view full airport details, including location, timezone, elevation, and runways.
            </p>
          </CardContent>
        </Card>
      )}

      {loading && !selectedAirport && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
          <span className="ml-3 text-zinc-400">Fetching airport data...</span>
        </div>
      )}
    </div>
  );
}

function CodePill({ label, value, tone }: { label: string; value?: string; tone: 'sky' | 'purple' }) {
  const toneClass = tone === 'sky' ? 'text-sky-400 border-sky-500/25 bg-sky-500/10' : 'text-purple-400 border-purple-500/25 bg-purple-500/10';

  return (
    <div className={`rounded-xl border p-3 text-center ${toneClass}`}>
      <div className="text-2xl font-light font-mono">{value || 'N/A'}</div>
      <div className="text-xs text-zinc-500 mt-1">{label}</div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-4">
      <div className="flex items-center gap-2 text-zinc-400 text-sm mb-3">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-light text-zinc-100">{value}</div>
      <div className="text-xs text-zinc-500 mt-1 line-clamp-1">{detail}</div>
    </div>
  );
}

function DetailTile({ item }: { item: DetailItem }) {
  return (
    <div className="p-4 bg-black/20 border border-zinc-800/50 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        {item.icon}
        <span className="font-medium text-zinc-300">{item.label}</span>
      </div>
      <div className="text-sm text-zinc-100 break-words">{displayValue(item.value)}</div>
    </div>
  );
}

function RunwayCard({ runway }: { runway: AirportRunway }) {
  const thresholdCoordinates = formatCoordinates(
    runway.threshold_coordinates?.[0],
    runway.threshold_coordinates?.[1]
  );

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <PlaneLanding className="h-5 w-5 text-sky-400" />
            <h4 className="text-lg font-light text-zinc-100">Runway {runway.designator || 'N/A'}</h4>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {runway.surface_description || runway.surface_type || 'Surface not reported'}
          </p>
        </div>
        {runway.heading !== undefined && (
          <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-300">
            {formatHeading(runway.heading)}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <RunwayFact icon={<Ruler className="h-4 w-4 text-emerald-400" />} label="Length" value={formatFeet(runway.length)} />
        <RunwayFact icon={<Layers className="h-4 w-4 text-purple-400" />} label="Width" value={formatFeet(runway.width)} />
        <RunwayFact icon={<Navigation className="h-4 w-4 text-sky-400" />} label="Elevation" value={formatElevation(runway.elevation)} />
        <RunwayFact icon={<Compass className="h-4 w-4 text-zinc-400" />} label="Threshold" value={thresholdCoordinates} />
        <RunwayFact icon={<Flag className="h-4 w-4 text-zinc-400" />} label="Surface Type" value={runway.surface_type || 'N/A'} />
        <RunwayFact icon={<Hash className="h-4 w-4 text-zinc-400" />} label="Designator" value={runway.designator || 'N/A'} />
      </div>
    </div>
  );
}

function RunwayFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800/50 bg-zinc-950/40 p-3 min-h-20">
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm text-zinc-200 break-words">{value}</div>
    </div>
  );
}

function displayValue(value?: string | number) {
  if (value === undefined || value === null || value === '') return 'N/A';
  return String(value);
}

function formatCoordinates(lat?: number, lon?: number) {
  if (lat === undefined || lon === undefined) return 'N/A';

  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';

  return `${Math.abs(lat).toFixed(4)} deg ${latDir}, ${Math.abs(lon).toFixed(4)} deg ${lonDir}`;
}

function formatElevation(elevation?: number, elevationMeters?: number) {
  if (elevation === undefined) return 'N/A';
  const meters = elevationMeters ?? Math.round(elevation * 0.3048);
  return `${Math.round(elevation).toLocaleString()} ft (${meters.toLocaleString()} m)`;
}

function formatFeet(value?: number) {
  if (value === undefined) return 'N/A';
  return `${Math.round(value).toLocaleString()} ft`;
}

function formatHeading(value?: number) {
  if (value === undefined) return 'N/A';
  return `${Math.round(value).toString().padStart(3, '0')} deg`;
}

function formatRegion(city?: string, state?: string, country?: string) {
  const parts = [city, state, country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'N/A';
}

function formatTimezone(timezone?: string, offsetHours?: number) {
  const offset = formatUtcOffset(offsetHours);
  if (!timezone && offset === 'N/A') return 'N/A';
  if (!timezone) return offset;
  if (offset === 'N/A') return timezone;
  return `${timezone} (${offset})`;
}

function formatUtcOffset(offsetHours?: number) {
  if (offsetHours === undefined) return 'N/A';

  const sign = offsetHours >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetHours);
  const hours = Math.floor(absolute);
  const minutes = Math.round((absolute - hours) * 60);

  return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
