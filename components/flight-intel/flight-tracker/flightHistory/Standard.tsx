'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card/Standard';
import { Button } from '@/components/buttons/Standard';
import { Input } from '@/components/input/Standard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select/Standard';
import { Badge } from '@/components/badge/Standard';
import { Calendar, MapPin, ArrowUp, ArrowDown, Activity, Plane, Navigation, Cloud, Shield, Copy, Clipboard, Trash2, AlertCircle, Info, Thermometer, Gauge, History } from 'lucide-react';

interface HistoricEvent {
  type: string;
  timestamp: string;
  lat?: number;
  lon?: number;
  alt?: number;
  gspeed?: number;
  details?: {
    gate_ident?: string;
    gate_lat?: number;
    gate_lon?: number;
    takeoff_runway?: string;
    landed_runway?: string;
    landed_icao?: string;
    landed_iata?: string;
    exited_airspace?: string;
    exited_airspace_id?: string;
    entered_airspace?: string;
    entered_airspace_id?: string;
    resuming_flightplan?: boolean;
    [key: string]: any;
  };
}

interface FlightData {
  fr24_id: string;
  callsign: string;
  hex: string;
  operating_as: string;
  painted_as: string;
  orig_iata: string;
  orig_icao: string;
  dest_iata: string;
  dest_icao: string;
  events: HistoricEvent[];
  
  type?: string;
  reg?: string;
  flight?: string;
  category?: string;
  first_seen?: string;
  last_seen?: string;
  flight_ended?: boolean;
}

export default function HistoricEvents() {
  const [flightIds, setFlightIds] = useState('');
  const [formattedFlightIds, setFormattedFlightIds] = useState('');
  const [eventTypes, setEventTypes] = useState('all');
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const eventTypeOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'gate_departure', label: 'Gate Departure' },
    { value: 'takeoff', label: 'Takeoff' },
    { value: 'cruising', label: 'Cruising' },
    { value: 'airspace_transition', label: 'Airspace Transition' },
    { value: 'resuming_flightplan', label: 'Resuming Flight Plan' },
    { value: 'descent', label: 'Descent' },
    { value: 'landed', label: 'Landed' },
    { value: 'gate_arrival', label: 'Gate Arrival' },
  ];

  // Auto-format flight IDs with commas
  useEffect(() => {
    if (flightIds.trim() === '') {
      setFormattedFlightIds('');
      return;
    }

    const ids = flightIds.split(/[,\s\n]+/).map(id => id.trim()).filter(id => id);
    const formatted = ids.join(', ');
    setFormattedFlightIds(formatted);
  }, [flightIds]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFlightIds(value);
    
    const lastChar = value.slice(-1);
    if (lastChar === ' ' || lastChar === '\n') {
      const withoutLastChar = value.slice(0, -1);
      if (withoutLastChar.trim() && !withoutLastChar.endsWith(',')) {
        setTimeout(() => {
          setFlightIds(withoutLastChar + ', ');
        }, 10);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    const cleanedText = pastedText
      .replace(/\n/g, ', ')
      .replace(/\s+/g, ' ')
      .replace(/,+/g, ',')
      .replace(/,\s*,/g, ',');
    
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = flightIds.substring(0, start) + cleanedText + flightIds.substring(end);
      setFlightIds(newText);
    } else {
      setFlightIds(cleanedText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPos = textarea.selectionStart;
        const currentValue = flightIds;
        const newValue = currentValue.substring(0, cursorPos) + ', ' + currentValue.substring(cursorPos);
        setFlightIds(newValue);
        setTimeout(() => {
          textarea.setSelectionRange(cursorPos + 2, cursorPos + 2);
          textarea.focus();
        }, 0);
      }
    }
  };

  const copyToClipboard = () => {
    if (formattedFlightIds) {
      navigator.clipboard.writeText(formattedFlightIds);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearInput = () => {
    setFlightIds('');
    setFormattedFlightIds('');
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'gate_departure':
      case 'gate_arrival':
        return <MapPin className="w-4 h-4" />;
      case 'takeoff':
        return <ArrowUp className="w-4 h-4" />;
      case 'landed':
        return <ArrowDown className="w-4 h-4" />;
      case 'cruising':
        return <Cloud className="w-4 h-4" />;
      case 'airspace_transition':
        return <Shield className="w-4 h-4" />;
      case 'resuming_flightplan':
        return <Navigation className="w-4 h-4" />;
      case 'descent':
        return <ArrowDown className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getEventColorClasses = (type: string): string => {
    const base = 'bg-opacity-20 border text-sm';
    switch (type) {
      case 'gate_departure': return `${base} bg-blue-500/20 text-blue-300 border-blue-500/30`;
      case 'takeoff': return `${base} bg-emerald-500/20 text-emerald-300 border-emerald-500/30`;
      case 'cruising': return `${base} bg-purple-500/20 text-purple-300 border-purple-500/30`;
      case 'airspace_transition': return `${base} bg-amber-500/20 text-amber-300 border-amber-500/30`;
      case 'resuming_flightplan': return `${base} bg-indigo-500/20 text-indigo-300 border-indigo-500/30`;
      case 'descent': return `${base} bg-orange-500/20 text-orange-300 border-orange-500/30`;
      case 'landed': return `${base} bg-red-500/20 text-red-300 border-red-500/30`;
      case 'gate_arrival': return `${base} bg-violet-500/20 text-violet-300 border-violet-500/30`;
      default: return `${base} bg-zinc-700/50 text-zinc-300 border-zinc-600`;
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Less than an hour ago';
  };

  const getEventDescription = (event: HistoricEvent) => {
    const type = event.type.replace('_', ' ');
    switch (event.type) {
      case 'gate_departure': return `Departed from gate ${event.details?.gate_ident || 'unknown'}`;
      case 'takeoff': return `Took off from runway ${event.details?.takeoff_runway || 'unknown'}`;
      case 'cruising': return `Cruising at ${event.alt ? Math.round(event.alt).toLocaleString() + ' ft' : 'unknown altitude'}`;
      case 'airspace_transition': return `Transitioned from ${event.details?.exited_airspace || 'unknown'} to ${event.details?.entered_airspace || 'unknown'}`;
      case 'descent': return `Started descent at ${event.alt ? Math.round(event.alt).toLocaleString() + ' ft' : 'unknown altitude'}`;
      case 'landed': return `Landed at ${event.details?.landed_icao || 'unknown airport'} runway ${event.details?.landed_runway || 'unknown'}`;
      case 'gate_arrival': return `Arrived at gate ${event.details?.gate_ident || 'unknown'}`;
      default: return type;
    }
  };

  const fetchHistoricEvents = async () => {
    if (!flightIds.trim()) {
      setError('Please enter at least one flight ID');
      return;
    }

    const ids = flightIds.split(/[,\s\n]+/).map(id => id.trim()).filter(id => id);
    if (ids.length > 15) {
      setError('Maximum 15 flight IDs allowed');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFlights([]);

    try {
      const response = await fetch('/api/historyFlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flight_ids: ids.join(','), event_types: eventTypes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.statusText}`);
      }

      const data = await response.json();
      setFlights(data.data || []);
      if (data.data?.length === 0) {
        setError('No historic events found for the provided flight IDs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch historic events');
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-zinc-800/50 pb-4">
          <CardTitle className="text-2xl font-light text-zinc-100">Historical Flights</CardTitle>
          <CardDescription className="text-zinc-400 mt-2">
            Retrieve detailed historical flight events from the FR24 database. 
            Enter flight IDs (fr24_id) from live tracking data.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-300">
                  Flight IDs (comma-separated, max 15)
                </label>
                <div className="flex items-center gap-2">
                  {formattedFlightIds && (
                    <Button type="button" variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 text-xs text-zinc-400 hover:text-zinc-200">
                      {copied ? (
                        <span className="flex items-center gap-1 text-emerald-400"><Clipboard className="w-3 h-3" /> Copied!</span>
                      ) : (
                        <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</span>
                      )}
                    </Button>
                  )}
                  <Button type="button" variant="ghost" size="sm" onClick={clearInput} className="h-8 text-xs text-zinc-400 hover:text-zinc-200">
                    <Trash2 className="w-3 h-3" /> Clear
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={flightIds}
                  onChange={handleInputChange}
                  onPaste={handlePaste}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter flight IDs (e.g., 3ad98909, 391fdd79, 35f2ffd9)&#10;Or paste a list, each ID will be auto-formatted with commas"
                  className="w-full min-h-[100px] p-3 bg-black/40 border border-zinc-700 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none resize-y text-sm font-mono text-zinc-200 placeholder:text-zinc-500"
                  spellCheck="false"
                  autoCapitalize="off"
                  autoCorrect="off"
                />
                <div className="absolute bottom-2 right-2 text-xs text-zinc-500 bg-zinc-900/80 backdrop-blur-sm px-2 py-1 rounded-full">
                  {flightIds.split(/[,\s\n]+/).filter(id => id.trim()).length} IDs
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Event Types to Include</label>
              <Select value={eventTypes} onValueChange={setEventTypes}>
                <SelectTrigger className="w-full bg-black/40 border-zinc-700 text-zinc-200 rounded-full">
                  <SelectValue placeholder="Select event types" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
                  {eventTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="focus:bg-sky-500/20 focus:text-sky-400">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={fetchHistoricEvents}
            disabled={isLoading || !flightIds.trim()}
            className="w-full md:w-auto bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Fetching Events...
              </span>
            ) : 'Fetch Historic Events'}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500/30 bg-red-500/10 backdrop-blur-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3 text-red-300">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {flights.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-light text-zinc-100">Flight Events Timeline</h3>
            <Badge variant="outline" className="text-zinc-400 border-zinc-700">
              {flights.length} flight{flights.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {flights.map((flight) => (
            <Card key={flight.fr24_id} className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                {/* Flight Header */}
                <div className="mb-6 pb-6 border-b border-zinc-800/50">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Plane className="w-5 h-5 text-sky-400" />
                        <h3 className="text-xl font-light text-zinc-100">{flight.callsign}</h3>
                        {flight.flight && (
                          <Badge variant="outline" className="text-zinc-400 border-zinc-700">Flight {flight.flight}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">ID:</span>
                          <code className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300">{flight.fr24_id}</code>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Hex:</span>
                          <code className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300">{flight.hex}</code>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30">{flight.operating_as}</Badge>
                      {flight.type && <Badge variant="outline" className="text-zinc-400 border-zinc-700">{flight.type}</Badge>}
                      {flight.reg && <Badge variant="outline" className="text-zinc-400 border-zinc-700">Reg: {flight.reg}</Badge>}
                    </div>
                  </div>

                  {/* Route summary */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-sky-500/5 border border-sky-500/20 rounded-xl">
                      <p className="text-xs text-sky-400 font-medium mb-1">ORIGIN</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
                          <span className="text-sky-400 font-bold">{flight.orig_iata}</span>
                        </div>
                        <div>
                          <p className="font-medium text-zinc-200">{flight.orig_iata} ({flight.orig_icao})</p>
                          <p className="text-xs text-zinc-500">Departure Airport</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-zinc-600">
                        <div className="h-px w-8 bg-zinc-700"></div>
                        <Plane className="w-4 h-4 transform rotate-90" />
                        <div className="h-px w-8 bg-zinc-700"></div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-zinc-400">{flight.events.length} events</p>
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <p className="text-xs text-emerald-400 font-medium mb-1">DESTINATION</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                          <span className="text-emerald-400 font-bold">{flight.dest_iata}</span>
                        </div>
                        <div>
                          <p className="font-medium text-zinc-200">{flight.dest_iata} ({flight.dest_icao})</p>
                          <p className="text-xs text-zinc-500">Arrival Airport</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Events Timeline */}
                <div>
                  <h4 className="text-lg font-light text-zinc-100 mb-4">Flight Timeline</h4>
                  <div className="relative pl-8">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-sky-400 via-purple-400 to-emerald-400"></div>
                    
                    {flight.events.map((event, index) => (
                      <div key={`${flight.fr24_id}-${index}`} className="relative mb-8 last:mb-0">
                        <div className={`absolute left-0 w-8 h-8 rounded-full border-2 border-zinc-900 flex items-center justify-center -translate-x-1/2 shadow-md ${getEventColorClasses(event.type).split(' ').find(c => c.includes('bg-'))}`}>
                          <div className="text-current">{getEventIcon(event.type)}</div>
                        </div>

                        <div className="ml-10">
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <Badge className={`${getEventColorClasses(event.type)}`}>
                              {event.type.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDateTime(event.timestamp)}</span>
                              <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded-full text-zinc-500">
                                {formatTimeAgo(event.timestamp)}
                              </span>
                            </div>
                          </div>

                          <Card className="border-zinc-800/50 bg-black/30 backdrop-blur-sm rounded-xl">
                            <CardContent className="p-4">
                              <p className="text-zinc-300 mb-3">{getEventDescription(event)}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {event.lat !== undefined && event.lon !== undefined && (
                                  <div className="p-2 bg-black/40 rounded-lg border border-zinc-800">
                                    <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Coordinates</p>
                                    <p className="text-sm font-mono text-zinc-300">{event.lat.toFixed(4)}, {event.lon.toFixed(4)}</p>
                                  </div>
                                )}
                                {event.alt !== undefined && (
                                  <div className="p-2 bg-black/40 rounded-lg border border-zinc-800">
                                    <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Thermometer className="w-3 h-3" /> Altitude</p>
                                    <p className="text-sm font-medium text-zinc-200">{Math.round(event.alt).toLocaleString()} ft</p>
                                  </div>
                                )}
                                {event.gspeed !== undefined && (
                                  <div className="p-2 bg-black/40 rounded-lg border border-zinc-800">
                                    <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Gauge className="w-3 h-3" /> Ground Speed</p>
                                    <p className="text-sm font-medium text-zinc-200">{Math.round(event.gspeed)} kts</p>
                                  </div>
                                )}
                              </div>

                              {event.details && Object.keys(event.details).length > 0 && (
                                <div className="mt-3 pt-3 border-t border-zinc-800">
                                  <p className="text-xs font-medium text-zinc-500 mb-2 flex items-center gap-1"><Info className="w-3 h-3" /> Additional Details:</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {Object.entries(event.details).map(([key, value]) => (
                                      value !== null && value !== undefined && value !== '' && (
                                        <div key={key} className="flex items-start gap-2 text-sm">
                                          <span className="text-zinc-500 capitalize min-w-[120px]">{key.replace(/_/g, ' ')}:</span>
                                          <span className="font-medium text-zinc-300">{value.toString()}</span>
                                        </div>
                                      )
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && flights.length === 0 && !error && (
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800 flex items-center justify-center">
                <History className="w-8 h-8 text-zinc-500" />
              </div>
              <div>
                <h3 className="text-lg font-light text-zinc-200 mb-2">No Historic Data Loaded</h3>
                <p className="text-zinc-400 max-w-md mx-auto">
                  Enter flight IDs (fr24_id) to retrieve historical flight events and timeline.
                  <span className="block text-sm text-zinc-500 mt-2">
                    <strong>How to get flight IDs:</strong> Use the Live Tracker tab, search for flights, 
                    then copy the "fr24_id" values from the results.
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="flex justify-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-sky-500 animate-pulse"></div>
                <div className="w-4 h-4 rounded-full bg-sky-500 animate-pulse delay-150"></div>
                <div className="w-4 h-4 rounded-full bg-sky-500 animate-pulse delay-300"></div>
              </div>
              <div>
                <p className="text-zinc-200 font-medium">Loading historical data...</p>
                <p className="text-sm text-zinc-500 mt-1">Fetching data from FR24 historical database</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}