'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/buttons/Standard';
import { Input } from '@/components/input/Standard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card/Standard';
import { Loader2, AlertCircle, Building, MapPin, Globe, Navigation, Clock, Hash, List, Globe as GlobeIcon } from 'lucide-react';

interface Airport {
  iata: string;
  icao: string;
  name: string;
  city?: string;
  country?: string;
  country_code?: string;
  elevation?: number;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

interface AirportInformationProps {
  onAirportSelect?: (airport: Airport) => void;
}

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
        setError('Please enter an airport IATA/ICAO code');
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

  const formatCoordinates = (lat?: number, lon?: number) => {
    if (!lat || !lon) return 'N/A';
    
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
  };

  const formatElevation = (elevation?: number) => {
    if (!elevation) return 'N/A';
    return `${elevation} ft (${Math.round(elevation * 0.3048)} m)`;
  };

  return (
    <div className="space-y-6">
      {/* Airport Search Card */}
      <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-zinc-800/50">
          <CardTitle className="text-2xl font-light text-zinc-100">Airport Search</CardTitle>
          <CardDescription className="text-zinc-400">
            Search for airport information by IATA or ICAO code
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
<form onSubmit={searchAirports} className="space-y-4">
  {/* Label - full width */}
  <label className="block text-sm font-medium text-zinc-400">
    Airport Code (IATA or ICAO)
  </label>

  {/* Input + Button Row */}
  <div className="flex flex-col sm:flex-row gap-3">
    <Input
      placeholder="e.g., LHR, EGLL, JFK, KJFK"
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

  {/* Description below */}
  <p className="text-sm text-zinc-500">
    Enter a 3-letter IATA code (e.g., LHR) or 4-letter ICAO code (e.g., EGLL)
  </p>
</form>
        </CardContent>
      </Card>

      {/* Airport Error Display */}
      {error && (
        <Card className="border-red-500/30 bg-red-500/10 backdrop-blur-sm rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-red-300">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{error}</p>
                <p className="text-sm text-red-400 mt-1">
                  Make sure you're using a valid 3-letter IATA code or 4-letter ICAO code.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Airport Results */}
      {airports.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Airport List - Left Column */}
          <div className="lg:col-span-1">
            <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl h-full">
              <CardHeader className="pb-3 border-b border-zinc-800/50">
                <CardTitle className="flex items-center gap-2 text-zinc-100 font-light">
                  <List className="w-5 h-5 text-sky-400" />
                  Airport Results
                  <span className="ml-auto bg-sky-500/20 text-sky-400 text-xs font-medium px-2.5 py-0.5 rounded-full border border-sky-500/30">
                    {airports.length} airport{airports.length !== 1 ? 's' : ''}
                  </span>
                </CardTitle>
                <CardDescription className="text-zinc-500">
                  Click an airport to view detailed information
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {airports.map((airport, index) => (
                    <div
                      key={`${airport.iata}-${airport.icao}-${index}`}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedAirport?.iata === airport.iata 
                          ? 'border-sky-500 bg-sky-500/10' 
                          : 'border-zinc-800/50 bg-black/20 hover:border-zinc-700 hover:bg-black/30'
                      }`}
                      onClick={() => handleAirportSelect(airport)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-light text-lg text-sky-400">{airport.iata}</span>
                            <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                              {airport.icao}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-zinc-200 mb-2">
                            {airport.name}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {airport.city && <span>{airport.city}, </span>}
                            {airport.country && <span>{airport.country}</span>}
                          </div>
                        </div>
                        <Building className="w-6 h-6 text-zinc-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Airport Details - Right Column */}
          <div className="lg:col-span-2">
            {selectedAirport && (
              <div className="space-y-6">
                {/* Airport Header Card */}
                <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Building className="w-8 h-8 text-sky-400" />
                          <h2 className="text-2xl font-light text-zinc-100">
                            {selectedAirport.name}
                          </h2>
                        </div>
                        <div className="flex items-center gap-4 text-zinc-400">
                          {selectedAirport.city && selectedAirport.country && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{selectedAirport.city}, {selectedAirport.country}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-6">
                          <div>
                            <div className="text-3xl font-light text-sky-400 mb-1">
                              {selectedAirport.iata}
                            </div>
                            <div className="text-sm text-zinc-500">IATA Code</div>
                          </div>
                          <div>
                            <div className="text-3xl font-light text-purple-400 mb-1">
                              {selectedAirport.icao}
                            </div>
                            <div className="text-sm text-zinc-500">ICAO Code</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Airport Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Information */}
                  <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                    <CardHeader className="pb-3 border-b border-zinc-800/50">
                      <CardTitle className="flex items-center gap-2 text-lg font-light text-zinc-100">
                        <GlobeIcon className="w-5 h-5 text-sky-400" />
                        Location Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-sky-400" />
                            <span className="font-medium text-sky-300">Coordinates</span>
                          </div>
                          <div className="text-sm font-mono text-zinc-200">
                            {formatCoordinates(selectedAirport.latitude, selectedAirport.longitude)}
                          </div>
                          {selectedAirport.latitude && selectedAirport.longitude && (
                            <div className="text-xs text-zinc-500 mt-2">
                              Lat: {selectedAirport.latitude.toFixed(6)}°<br />
                              Lon: {selectedAirport.longitude.toFixed(6)}°
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Navigation className="w-4 h-4 text-purple-400" />
                            <span className="font-medium text-purple-300">Elevation</span>
                          </div>
                          <div className="text-xl font-light text-zinc-100">
                            {formatElevation(selectedAirport.elevation)}
                          </div>
                          <div className="text-xs text-zinc-500 mt-2">
                            Above mean sea level
                          </div>
                        </div>
                      </div>
                      
                      {selectedAirport.country && (
                        <div className="p-4 bg-black/20 border border-zinc-800/50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-zinc-400" />
                            <span className="font-medium text-zinc-300">Country Information</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-zinc-500">Country</div>
                              <div className="font-medium text-zinc-200">{selectedAirport.country}</div>
                            </div>
                            {selectedAirport.country_code && (
                              <div>
                                <div className="text-xs text-zinc-500">Country Code</div>
                                <div className="font-medium text-zinc-200">{selectedAirport.country_code}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Additional Information */}
                  <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                    <CardHeader className="pb-3 border-b border-zinc-800/50">
                      <CardTitle className="flex items-center gap-2 text-lg font-light text-zinc-100">
                        <Clock className="w-5 h-5 text-sky-400" />
                        Additional Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      {selectedAirport.timezone && (
                        <div className="p-4 bg-black/20 border border-zinc-800/50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-zinc-400" />
                            <span className="font-medium text-zinc-300">Timezone</span>
                          </div>
                          <div className="text-lg font-light text-zinc-100">
                            {selectedAirport.timezone}
                          </div>
                          <div className="text-xs text-zinc-500 mt-2">
                            Local time zone for the airport
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4 bg-black/20 border border-zinc-800/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="w-4 h-4 text-zinc-400" />
                          <span className="font-medium text-zinc-300">Codes</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-zinc-500">IATA Code</div>
                            <div className="text-xl font-light text-sky-400">{selectedAirport.iata}</div>
                          </div>
                          <div>
                            <div className="text-xs text-zinc-500">ICAO Code</div>
                            <div className="text-xl font-light text-purple-400">{selectedAirport.icao}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary Card */}
                <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Building className="w-6 h-6 text-sky-400 mt-1" />
                      <div>
                        <h3 className="text-lg font-light text-zinc-100 mb-2">Airport Summary</h3>
                        <p className="text-zinc-400">
                          {selectedAirport.name} ({selectedAirport.iata}/{selectedAirport.icao}) 
                          {selectedAirport.city && ` is located in ${selectedAirport.city}, ${selectedAirport.country}.`}
                          {selectedAirport.elevation && ` The airport is at an elevation of ${selectedAirport.elevation} feet above sea level.`}
                          {selectedAirport.timezone && ` It operates in the ${selectedAirport.timezone} timezone.`}
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
              Enter an IATA or ICAO airport code to search for airport information, 
              including location, coordinates, and other details.
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