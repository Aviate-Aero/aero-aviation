'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/buttons/Standard';
import { Input } from '@/components/input/Standard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card/Standard';
import { Loader2, Plane, AlertCircle, Calendar, Clock, MapPin, Route, Wifi, BarChart, Briefcase, Package, Shield, Zap, Wind, Hash, List, Map } from 'lucide-react';

interface Flight {
  fr24_id: string;
  flight: string;
  callsign: string;
  operating_as: string;
  painted_as: string;
  type: string;
  reg: string;
  orig_icao: string;
  orig_iata: string;
  datetime_takeoff: string;
  runway_takeoff: string;
  dest_icao: string;
  dest_iata: string;
  dest_icao_actual: string;
  dest_iata_actual: string;
  datetime_landed: string;
  runway_landed: string;
  flight_time: number;
  actual_distance: number;
  circle_distance: number;
  category: string | null;
  hex: string;
  first_seen: string;
  last_seen: string;
  flight_ended: boolean;
}

interface SearchTypeOption {
  value: 'flights' | 'callsigns' | 'registrations' | 'airlines';
  label: string;
  placeholder: string;
  description: string;
}

interface FlightInformationProps {
  onFlightSelect?: (flight: Flight) => void;
  initialSearchType?: 'flights' | 'callsigns' | 'registrations' | 'airlines';
}

export default function FlightInformation({ 
  onFlightSelect, 
  initialSearchType = 'flights' 
}: FlightInformationProps) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [searchType, setSearchType] = useState<'flights' | 'callsigns' | 'registrations' | 'airlines'>(initialSearchType);

  const searchTypeOptions: SearchTypeOption[] = [
    { 
      value: 'flights', 
      label: 'Flight Number', 
      placeholder: 'e.g., BA123, RR9407, EK184',
      description: 'Search by flight number'
    },
    { 
      value: 'callsigns', 
      label: 'Callsign', 
      placeholder: 'e.g., BAW123, RYS9407',
      description: 'Search by radio callsign'
    },
    { 
      value: 'registrations', 
      label: 'Registration', 
      placeholder: 'e.g., G-ZBLB, SP-RSZ',
      description: 'Search by aircraft registration'
    },
    { 
      value: 'airlines', 
      label: 'Airline', 
      placeholder: 'e.g., BAW, RYS, EK',
      description: 'Search by airline ICAO code'
    },
  ];

  // Format date time to readable format
  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  // Format flight time (seconds to hours:minutes)
  const formatFlightTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Format distance in kilometers
  const formatDistance = (km: number) => {
    return `${km.toFixed(1)} km`;
  };

  // Calculate average speed in km/h
  const calculateAverageSpeed = (distance: number, time: number) => {
    const hours = time / 3600;
    return hours > 0 ? (distance / hours).toFixed(0) : '0';
  };

  // Flight search function
  const searchFlights = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setError(null);
    setSelectedFlight(null);

    try {
      if (!searchQuery.trim()) {
        setError('Please enter a search query');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      params.append('query', searchQuery);
      params.append('searchType', searchType);

      const response = await fetch(`/api/flightData?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch flight data');
      }

      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        setFlights(data.data);
        if (data.data.length > 0) {
          const firstFlight = data.data[0];
          setSelectedFlight(firstFlight);
          onFlightSelect?.(firstFlight);
        }
      } else {
        setFlights([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchType, onFlightSelect]);

  const currentSearchType = searchTypeOptions.find(opt => opt.value === searchType);

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    onFlightSelect?.(flight);
  };

  return (
    <div className="space-y-6">
      {/* Flight Search Card */}
      <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-zinc-800/50">
          <CardTitle className="text-2xl font-light text-zinc-100">Flight Search</CardTitle>
          <CardDescription className="text-zinc-400">
            Search flights by number, callsign, registration, or airline. Results from last 7 days will be displayed.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={searchFlights} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Type Selector */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Search Type
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="w-full h-[42px] border border-zinc-700 rounded-full px-4 py-2 text-zinc-200 bg-black/40 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                >
                  {searchTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Input */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Search Query
                  <span className="text-xs text-zinc-500 ml-2">
                    {currentSearchType?.description}
                  </span>
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder={currentSearchType?.placeholder}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value.toUpperCase());
                      setError(null);
                    }}
                    className="border-zinc-700 bg-black/40 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px] text-base"
                    autoFocus
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="md:col-span-1 flex items-end">
                <Button
                  type="submit"
                  disabled={loading || !searchQuery.trim()}
                  className="w-full h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                  {loading ? 'Searching...' : 'Search Flights'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Flight Error Display */}
      {error && (
        <Card className="border-red-500/30 bg-red-500/10 backdrop-blur-sm rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-red-300">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{error}</p>
                <p className="text-sm text-red-400 mt-1">
                  Check your query format and try again. Make sure to use correct codes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flight Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flight List - Left Column */}
        <div className="lg:col-span-1">
          <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl h-full">
            <CardHeader className="pb-3 border-b border-zinc-800/50">
              <CardTitle className="flex items-center gap-2 text-zinc-100 font-light">
                <List className="w-5 h-5 text-sky-400" />
                Flight Results
                {flights.length > 0 && (
                  <span className="ml-auto bg-sky-500/20 text-sky-400 text-xs font-medium px-2.5 py-0.5 rounded-full border border-sky-500/30">
                    {flights.length} flights
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-zinc-500">
                {flights.length > 0 
                  ? `Found ${flights.length} flight${flights.length !== 1 ? 's' : ''} in the last 7 days`
                  : 'Search results will appear here'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {flights.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {flights.map((flight, index) => (
                    <div
                      key={`${flight.fr24_id}-${index}`}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedFlight?.fr24_id === flight.fr24_id 
                          ? 'border-sky-500 bg-sky-500/10' 
                          : 'border-zinc-800/50 bg-black/20 hover:border-zinc-700 hover:bg-black/30'
                      }`}
                      onClick={() => handleFlightSelect(flight)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-light text-lg text-sky-400">{flight.flight}</span>
                            <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                              {flight.callsign}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                            <MapPin className="w-3 h-3" />
                            <span className="font-medium">{flight.orig_iata} → {flight.dest_iata}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-zinc-500" />
                              <span className="text-zinc-400">{flight.operating_as}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Hash className="w-3 h-3 text-zinc-500" />
                              <span className="font-mono text-zinc-400">{flight.reg}</span>
                            </div>
                          </div>
                        </div>
                        {flight.datetime_takeoff && (
                          <div className="text-right">
                            <div className="text-xs text-zinc-500">
                              {new Date(flight.datetime_takeoff).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-xs text-zinc-600">
                              {new Date(flight.datetime_takeoff).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : !loading && !error ? (
                <div className="text-center py-12">
                  <Plane className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500">
                    {searchQuery
                      ? 'No flights found. Try adjusting your search criteria.'
                      : 'Enter a search query to find flights'}
                  </p>
                </div>
              ) : null}

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                  <span className="ml-3 text-zinc-400">Fetching flight data...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Flight Details - Right Column */}
        <div className="lg:col-span-2">
          {selectedFlight ? (
            <div className="space-y-6">
              {/* Flight Header Card */}
              <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Plane className="w-8 h-8 text-sky-400" />
                        <h2 className="text-2xl font-light text-zinc-100">
                          {selectedFlight.flight} - {selectedFlight.callsign}
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedFlight.category === 'Passenger' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : selectedFlight.category === 'Cargo'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
                        }`}>
                          {selectedFlight.category || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Hash className="w-4 h-4" />
                          <span className="font-mono font-medium">{selectedFlight.reg}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span>Operated by: {selectedFlight.operating_as}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          <span>Painted as: {selectedFlight.painted_as}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-light text-sky-400 mb-1">
                        {selectedFlight.type}
                      </div>
                      <div className="text-sm text-zinc-500">Aircraft Type</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Route & Timing Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Origin & Destination */}
                <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                  <CardHeader className="pb-3 border-b border-zinc-800/50">
                    <CardTitle className="flex items-center gap-2 text-lg font-light text-zinc-100">
                      <Route className="w-5 h-5 text-sky-400" />
                      Route Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-sky-500/5 border border-sky-500/20 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-sky-400" />
                          <span className="font-medium text-sky-300">Origin</span>
                        </div>
                        <div className="text-2xl font-light text-zinc-100 mb-1">
                          {selectedFlight.orig_iata}
                        </div>
                        <div className="text-sm text-zinc-400">{selectedFlight.orig_icao}</div>
                        {selectedFlight.runway_takeoff && (
                          <div className="text-sm text-zinc-500 mt-2">
                            Runway: {selectedFlight.runway_takeoff}
                          </div>
                        )}
                      </div>
                      <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-purple-400" />
                          <span className="font-medium text-purple-300">Destination</span>
                        </div>
                        <div className="text-2xl font-light text-zinc-100 mb-1">
                          {selectedFlight.dest_iata}
                        </div>
                        <div className="text-sm text-zinc-400">{selectedFlight.dest_icao}</div>
                        {selectedFlight.runway_landed && (
                          <div className="text-sm text-zinc-500 mt-2">
                            Runway: {selectedFlight.runway_landed}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-zinc-800/50">
                      <div className="flex items-center justify-between text-sm text-zinc-400">
                        <span>Actual Distance:</span>
                        <span className="font-medium text-zinc-200">{formatDistance(selectedFlight.actual_distance)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-zinc-400 mt-1">
                        <span>Great Circle Distance:</span>
                        <span className="font-medium text-zinc-200">{formatDistance(selectedFlight.circle_distance)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timing Information */}
                <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                  <CardHeader className="pb-3 border-b border-zinc-800/50">
                    <CardTitle className="flex items-center gap-2 text-lg font-light text-zinc-100">
                      <Clock className="w-5 h-5 text-sky-400" />
                      Timing Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-black/20 border border-zinc-800/50 rounded-xl">
                          <div className="text-xs text-zinc-500 mb-1">Takeoff</div>
                          <div className="font-medium text-zinc-200 text-sm">
                            {selectedFlight.datetime_takeoff ? formatDateTime(selectedFlight.datetime_takeoff) : 'N/A'}
                          </div>
                        </div>
                        <div className="p-3 bg-black/20 border border-zinc-800/50 rounded-xl">
                          <div className="text-xs text-zinc-500 mb-1">Landed</div>
                          <div className="font-medium text-zinc-200 text-sm">
                            {selectedFlight.datetime_landed ? formatDateTime(selectedFlight.datetime_landed) : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-black/20 border border-zinc-800/50 rounded-xl">
                          <div className="text-xs text-zinc-500 mb-1">First Seen</div>
                          <div className="font-medium text-zinc-200 text-sm">
                            {formatDateTime(selectedFlight.first_seen)}
                          </div>
                        </div>
                        <div className="p-3 bg-black/20 border border-zinc-800/50 rounded-xl">
                          <div className="text-xs text-zinc-500 mb-1">Last Seen</div>
                          <div className="font-medium text-zinc-200 text-sm">
                            {formatDateTime(selectedFlight.last_seen)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-zinc-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-sky-400" />
                          <span className="text-zinc-300">Flight Duration:</span>
                        </div>
                        <span className="text-xl font-light text-sky-400">
                          {formatFlightTime(selectedFlight.flight_time)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-zinc-400">Average Speed:</span>
                        <span className="font-medium text-zinc-200">
                          {calculateAverageSpeed(selectedFlight.actual_distance, selectedFlight.flight_time)} km/h
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Technical & Status Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Technical Details */}
                <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                  <CardHeader className="pb-3 border-b border-zinc-800/50">
                    <CardTitle className="flex items-center gap-2 text-lg font-light text-zinc-100">
                      <Wifi className="w-5 h-5 text-sky-400" />
                      Technical Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-black/20 border border-zinc-800/50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Wifi className="w-4 h-4 text-sky-400" />
                            <span className="text-sm font-medium text-zinc-300">Hex Code</span>
                          </div>
                          <div className="font-mono font-medium text-zinc-200">{selectedFlight.hex}</div>
                        </div>
                        <div className="p-3 bg-black/20 border border-zinc-800/50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Hash className="w-4 h-4 text-sky-400" />
                            <span className="text-sm font-medium text-zinc-300">FR24 ID</span>
                          </div>
                          <div className="font-mono text-sm text-zinc-200 break-all">{selectedFlight.fr24_id}</div>
                        </div>
                      </div>
                      <div className="p-3 bg-black/20 border border-zinc-800/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart className="w-4 h-4 text-sky-400" />
                          <span className="text-sm font-medium text-zinc-300">Flight Statistics</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <div className="text-2xl font-light text-sky-400">
                              {(selectedFlight.actual_distance / 1.852).toFixed(0)}
                            </div>
                            <div className="text-xs text-zinc-500">Nautical Miles</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-light text-sky-400">
                              {Math.floor(selectedFlight.flight_time / 60)}
                            </div>
                            <div className="text-xs text-zinc-500">Total Minutes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-light text-sky-400">
                              {(selectedFlight.actual_distance / selectedFlight.flight_time * 3600 / 1.852).toFixed(0)}
                            </div>
                            <div className="text-xs text-zinc-500">Knots Avg</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Flight Status */}
                <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                  <CardHeader className="pb-3 border-b border-zinc-800/50">
                    <CardTitle className="flex items-center gap-2 text-lg font-light text-zinc-100">
                      <Shield className="w-5 h-5 text-sky-400" />
                      Flight Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className={`p-4 rounded-xl border ${
                        selectedFlight.flight_ended 
                          ? 'bg-emerald-500/5 border-emerald-500/30' 
                          : 'bg-amber-500/5 border-amber-500/30'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Zap className={`w-5 h-5 ${
                              selectedFlight.flight_ended ? 'text-emerald-400' : 'text-amber-400'
                            }`} />
                            <span className="font-medium text-zinc-200">Flight Status</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            selectedFlight.flight_ended 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {selectedFlight.flight_ended ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400">
                          {selectedFlight.flight_ended 
                            ? 'This flight has completed its journey and landed at the destination.'
                            : 'This flight is currently in progress or its status is not yet confirmed as completed.'}
                        </p>
                      </div>
                      <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Wind className="w-4 h-4 text-sky-400" />
                          <span className="font-medium text-zinc-200">Additional Info</span>
                        </div>
                        <div className="text-sm text-zinc-400 space-y-1">
                          <div className="flex justify-between">
                            <span>Circle Distance Efficiency:</span>
                            <span className="font-medium text-zinc-200">
                              {((selectedFlight.circle_distance / selectedFlight.actual_distance) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Distance Delta:</span>
                            <span className="font-medium text-zinc-200">
                              {formatDistance(selectedFlight.actual_distance - selectedFlight.circle_distance)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl h-full">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <Map className="w-24 h-24 text-zinc-600 mb-6" />
                <h3 className="text-2xl font-light text-zinc-300 mb-3">
                  No Flight Selected
                </h3>
                <p className="text-zinc-500 max-w-md">
                  Select a flight from the search results to view detailed information, 
                  including route, timing, technical specifications, and flight statistics.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}