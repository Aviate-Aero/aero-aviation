'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import FlightSearch from '../search/Standard';
import FlightTable from '../flightTable/Standard';
import FlightMap from '../../flightMaps/Standard';
import FlightPerformanceDashboard from '../flightPerformance/Standard';
import AirportDashboard from '../airportDashboard/Standard';
import { Card, CardTitle, CardDescription } from '@/components/card/Standard';
import { Plane, MapPin, List, Grid3x3, BarChart3, RefreshCw } from 'lucide-react';

interface TrackPoint {
  timestamp: string;
  lat: number;
  lon: number;
  alt?: number;
  gspeed?: number;
  vspeed?: number;
  track?: number;
  squawk?: string;
  callsign?: string;
  source?: string;
}

interface FlightRecord {
  fr24_id: string;
  flight?: string;
  callsign?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lon?: number;
  track?: number;
  alt?: number;
  gspeed?: number;
  vspeed?: number;
  squawk?: number;
  timestamp?: string;
  source?: string;
  hex?: string;
  type?: string;
  reg?: string;
  painted_as?: string;
  operating_as?: string;
  orig_iata?: string;
  orig_icao?: string;
  dest_iata?: string;
  dest_icao?: string;
  eta?: string;
  on_ground?: boolean;
}

interface FlightSearchParams {
  flights?: string;
  airports?: string;
  operating_as?: string;
}

export default function FlightTracker() {
  const [flights, setFlights] = useState<FlightRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<string>('flight');
  const [selectedFlight, setSelectedFlight] = useState<FlightRecord | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'table' | 'split'>('split');
  const [showPerformance, setShowPerformance] = useState(false);
  const [airportCode, setAirportCode] = useState<string>('');
  const [activeView, setActiveView] = useState<'flight' | 'airport'>('flight');

  const [flightTracks, setFlightTracks] = useState<{ [flightId: string]: TrackPoint[] }>({});
  const [tracksLoading, setTracksLoading] = useState(false);
  const [tracksError, setTracksError] = useState<string | null>(null);

  // Stores the latest search so the user can refresh manually.
  const lastSearchRef = useRef<{ params: FlightSearchParams; type: string } | null>(null);

  const fetchFlights = useCallback(
    async (
      params: FlightSearchParams,
      type: string,
      options?: {
        silent?: boolean;
        resetSelection?: boolean;
      }
    ) => {
      const silent = options?.silent ?? false;
      const resetSelection = options?.resetSelection ?? false;

      if (!silent) {
        setIsLoading(true);
      }

      setError(null);
      setSearchType(type);

      if (resetSelection) {
        setSelectedFlight(null);
        setFlightTracks({});
      }

      try {
        const response = await fetch('/api/flightTracker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = (await response.json()) as { flights?: FlightRecord[] };

        const normalizedFlights = (data.flights || []).map((f) => ({
          ...f,
          lat: f.latitude ?? f.lat,
          lon: f.longitude ?? f.lon,
        }));

        setFlights(normalizedFlights);

        // During manual refresh, keep the same selected aircraft selected,
        // but update its lat/lon/alt/speed/heading from the new API response.
        setSelectedFlight((previousSelectedFlight) => {
          if (resetSelection) return null;
          if (!previousSelectedFlight?.fr24_id) return previousSelectedFlight;

          return (
            normalizedFlights.find(
              (f) => f.fr24_id === previousSelectedFlight.fr24_id
            ) ?? previousSelectedFlight
          );
        });

        if (normalizedFlights.length === 0) {
          setError('No flights found for your search criteria');
        }

        if (type === 'airport') {
          setActiveView('airport');
          setAirportCode(params.airports ?? '');
        } else {
          setActiveView('flight');
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch flights';

        if (!silent) {
          setError(message);
          setFlights([]);
        } else {
          // For silent refresh, do not clear the map on one failed request.
          console.error('Silent flight refresh failed:', message);
        }
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  const handleSearch = useCallback(
    async (params: FlightSearchParams, type: string) => {
      lastSearchRef.current = { params, type };

      await fetchFlights(params, type, {
        silent: false,
        resetSelection: true,
      });
    },
    [fetchFlights]
  );

  const handleManualRefresh = useCallback(async () => {
    if (!lastSearchRef.current || isLoading) return;

    await fetchFlights(lastSearchRef.current.params, lastSearchRef.current.type, {
      silent: false,
      resetSelection: false,
    });
  }, [fetchFlights, isLoading]);

  useEffect(() => {
    if (activeView === 'flight' && flights.length > 0 && !selectedFlight) {
      const flightWithPosition = flights.find(f => f.lat != null && f.lon != null);

      if (flightWithPosition) {
        setSelectedFlight(flightWithPosition);
      }
    }
  }, [flights, selectedFlight, activeView]);

  useEffect(() => {
    if (activeView !== 'flight' || !selectedFlight?.fr24_id) return;

    const flightId = selectedFlight.fr24_id;

    // Fetch route/track only once per selected flight.
    // Latest position updates only when the user refreshes the search.
    if (flightTracks[flightId]) return;

    const fetchTracks = async () => {
      setTracksLoading(true);
      setTracksError(null);

      try {
        const response = await fetch(`/api/flightTracks?flight_id=${flightId}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch tracks: ${response.statusText}`);
        }

        const data = await response.json();

        setFlightTracks(prev => ({
          ...prev,
          [flightId]: data.tracks || [],
        }));
      } catch (err) {
        setTracksError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching flight tracks:', err);
      } finally {
        setTracksLoading(false);
      }
    };

    fetchTracks();
  }, [selectedFlight, flightTracks, activeView]);

  const currentTracks = selectedFlight?.fr24_id
    ? flightTracks[selectedFlight.fr24_id]
    : [];

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <CardTitle className="text-2xl font-light text-zinc-100">
                Flight Tracker
              </CardTitle>
              <CardDescription className="text-zinc-400 mt-2">
                Enter flight details, airport, or airline to track real-time positions
              </CardDescription>
            </div>

            {/* View Mode Toggle - only for flight view */}
            {activeView === 'flight' && flights.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex bg-zinc-800/50 backdrop-blur-sm rounded-full p-1 border border-zinc-700/50">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                      viewMode === 'table'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">Table</span>
                  </button>

                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                      viewMode === 'split'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Split</span>
                  </button>

                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                      viewMode === 'map'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="hidden sm:inline">Map</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <FlightSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </Card>

      {/* Error Card */}
      {error && (
        <Card className="border-red-500/30 bg-red-500/10 backdrop-blur-sm rounded-2xl overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-full">
                <Plane className="w-5 h-5 text-red-400 rotate-45" />
              </div>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {tracksError && (
        <Card className="border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm rounded-2xl overflow-hidden">
          <div className="p-4">
            <p className="text-yellow-300">{tracksError}</p>
          </div>
        </Card>
      )}

      {flights.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-light text-zinc-100">
              {activeView === 'flight' ? 'Live Flight Data' : `${airportCode} Airport`}
            </h2>

            {activeView === 'flight' && lastSearchRef.current && (
              <button
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium bg-sky-500/15 text-sky-300 rounded-full border border-sky-500/30 hover:bg-sky-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}

            {activeView === 'airport' && (
              <button
                onClick={() => setActiveView('flight')}
                className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
              >
                ← Back to flights
              </button>
            )}
          </div>

          {activeView === 'flight' && (
            <>
              {viewMode === 'table' && (
                <FlightTable
                  flights={flights}
                  searchType={searchType}
                  onRowClick={setSelectedFlight}
                  selectedFlight={selectedFlight}
                />
              )}

              {viewMode === 'map' && (
                <div className="space-y-4">
                  <Card className="border-sky-500/20 bg-sky-500/5 backdrop-blur-sm rounded-2xl overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-sky-400" />
                          <div>
                            <h3 className="font-medium text-sky-300">
                              Interactive Flight Map
                            </h3>
                            <p className="text-sm text-sky-400/80">
                              Click on aircraft icons for details. Use refresh when you need updated positions.
                            </p>
                          </div>
                        </div>

                        {selectedFlight && (
                          <button
                            onClick={() => setShowPerformance(!showPerformance)}
                            className="px-4 py-2 text-sm font-medium bg-black/40 text-sky-400 rounded-full border border-sky-500/30 hover:bg-sky-500/10 transition flex items-center gap-2"
                          >
                            <BarChart3 className="w-4 h-4" />
                            {showPerformance ? 'Hide Performance' : 'Show Performance'}
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>

                  <FlightMap
                    flights={flights}
                    selectedFlight={selectedFlight}
                    onFlightSelect={setSelectedFlight}
                    tracks={currentTracks}
                    tracksLoading={tracksLoading}
                    height={showPerformance ? '400px' : '600px'}
                  />

                  {showPerformance && selectedFlight && (
                    <div className="mt-4 animate-in slide-in-from-bottom-4 duration-300">
                      <FlightPerformanceDashboard
                        tracks={currentTracks}
                        flight={selectedFlight}
                        isLoading={tracksLoading}
                      />
                    </div>
                  )}
                </div>
              )}

              {viewMode === 'split' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-light text-zinc-200">
                        Flight List
                      </h3>
                    </div>

                    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
                      <FlightTable
                        flights={flights}
                        searchType={searchType}
                        onRowClick={setSelectedFlight}
                        selectedFlight={selectedFlight}
                        compact={false}
                      />
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-light text-zinc-200">
                        {selectedFlight
                          ? `Flight Map - ${
                              selectedFlight.callsign ||
                              selectedFlight.flight ||
                              'Selected Flight'
                            }`
                          : 'Flight Map'}
                      </h3>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-sky-400 font-mono">
                          Manual refresh
                        </span>

                        {selectedFlight && (
                          <button
                            onClick={() => setShowPerformance(!showPerformance)}
                            className="px-4 py-2 text-sm font-medium bg-black/40 text-sky-400 rounded-full border border-sky-500/30 hover:bg-sky-500/10 transition flex items-center gap-2"
                          >
                            <BarChart3 className="w-4 h-4" />
                            {showPerformance ? 'Hide Performance' : 'Show Performance'}
                          </button>
                        )}

                        {selectedFlight && (
                          <div
                            className={`w-2 h-2 rounded-full ${
                              selectedFlight.on_ground
                                ? 'bg-zinc-500'
                                : 'bg-emerald-500 animate-pulse'
                            }`}
                          />
                        )}
                      </div>
                    </div>

                    <FlightMap
                      flights={flights}
                      selectedFlight={selectedFlight}
                      onFlightSelect={setSelectedFlight}
                      tracks={currentTracks}
                      tracksLoading={tracksLoading}
                      height={showPerformance ? '400px' : '600px'}
                    />

                    {showPerformance && selectedFlight && (
                      <div className="mt-4 animate-in slide-in-from-bottom-4 duration-300">
                        <FlightPerformanceDashboard
                          tracks={currentTracks}
                          flight={selectedFlight}
                          isLoading={tracksLoading}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activeView === 'airport' && (
            <AirportDashboard
              flights={flights}
              airportCode={airportCode}
              isLoading={isLoading}
            />
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && flights.length === 0 && !error && (
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-zinc-800/50 rounded-full flex items-center justify-center border border-zinc-700">
                <Plane className="w-10 h-10 text-zinc-500" />
              </div>

              <h3 className="text-xl font-light text-zinc-200 mb-2">
                Ready for Takeoff
              </h3>

              <p className="text-zinc-400 mb-6">
                Enter search criteria to begin tracking live flights on the interactive map.
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/10 rounded-full border border-sky-500/30">
                <span className="text-sm font-medium text-sky-400">
                  Tip: Try &quot;UA123&quot;, &quot;JFK&quot;, or &quot;AA&quot; to see flights on the map
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 border-4 border-zinc-700 border-t-sky-400 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Plane className="w-10 h-10 text-sky-400" />
                </div>
              </div>

              <h3 className="text-xl font-light text-zinc-200 mb-2">
                Scanning Airspace
              </h3>

              <p className="text-zinc-400">
                Gathering live flight data from global tracking networks...
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
