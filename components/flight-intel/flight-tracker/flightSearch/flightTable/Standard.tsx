'use client';
import { Fragment } from 'react';
import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/table/Standard';
import { Badge } from '@/components/badge/Standard';
import { Card } from '@/components/card/Standard';
import {
  Plane,
  Navigation,
  Gauge,
  MapPin,
  Clock,
  Satellite,
  RadioTower,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  BarChart3,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Flight {
  fr24_id: string;
  flight?: string;
  callsign?: string;
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

interface FlightTableProps {
  flights: Flight[];
  searchType?: string;
  onRowClick?: (flight: Flight) => void;
  selectedFlight?: Flight | null;
  compact?: boolean;
}

export default function FlightTable({ 
  flights, 
  searchType = 'flight',
  onRowClick,
  selectedFlight,
  compact = false
}: FlightTableProps) {
  const [expandedFlight, setExpandedFlight] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Flight;
    direction: 'asc' | 'desc';
  }>({ key: 'gspeed', direction: 'desc' });

  const sortedFlights = useMemo(() => {
    return [...flights].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortConfig.direction === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [flights, sortConfig]);

  const formatTime = (value?: string) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    return isNaN(d.getTime())
      ? 'N/A'
      : d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  const formatDate = (value?: string) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    return isNaN(d.getTime())
      ? 'N/A'
      : d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
  };

  const getAltitudeColor = (alt?: number) => {
    if (alt == null) return 'text-zinc-500';
    if (alt < 10000) return 'text-emerald-400';
    if (alt < 30000) return 'text-sky-400';
    return 'text-purple-400';
  };

  const getSpeedBadgeVariant = (speed?: number): 'default' | 'secondary' | 'outline' => {
    if (speed == null) return 'secondary';
    if (speed > 500) return 'default';
    if (speed > 300) return 'outline';
    return 'secondary';
  };

  const handleSort = (key: keyof Flight) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleRowClick = (flight: Flight) => {
    if (onRowClick) {
      onRowClick(flight);
    }
    setExpandedFlight(expandedFlight === flight.fr24_id ? null : flight.fr24_id);
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof Flight }) => {
    if (sortConfig.key !== columnKey) return <BarChart3 className="w-3 h-3 opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3" />;
  };

  const isRowSelected = (flight: Flight) => {
    return selectedFlight?.fr24_id === flight.fr24_id;
  };

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {!compact && searchType === 'flight' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3 bg-sky-500/5 border border-sky-500/20 backdrop-blur-sm rounded-xl">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-medium text-sky-300">Active Flights</span>
            </div>
            <div className="text-2xl font-light text-zinc-100 mt-1">{flights.length}</div>
          </Card>
          
          <Card className="p-3 bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-sm rounded-xl">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">Avg Speed</span>
            </div>
            <div className="text-2xl font-light text-zinc-100 mt-1">
              {flights.length > 0 
                ? Math.round(flights.reduce((acc, f) => acc + (f.gspeed ?? 0), 0) / flights.length) 
                : 0} kt
            </div>
          </Card>
          
          <Card className="p-3 bg-amber-500/5 border border-amber-500/20 backdrop-blur-sm rounded-xl">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">Highest Alt</span>
            </div>
            <div className="text-2xl font-light text-zinc-100 mt-1">
              {flights.length > 0 
                ? Math.max(...flights.map(f => f.alt ?? 0)).toLocaleString() 
                : 0} ft
            </div>
          </Card>
          
          <Card className="p-3 bg-purple-500/5 border border-purple-500/20 backdrop-blur-sm rounded-xl">
            <div className="flex items-center gap-2">
              <Satellite className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Sources</span>
            </div>
            <div className="text-2xl font-light text-zinc-100 mt-1">
              {new Set(flights.map(f => f.source)).size}
            </div>
          </Card>
        </div>
      )}

      <Card className={`border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl overflow-hidden rounded-xl ${compact ? '' : ''}`}>
        <div className="overflow-x-auto">
          <Table className={compact ? "min-w-[1000px] text-sm" : "min-w-[1200px]"}>
            <TableHeader className={`${compact ? 'bg-zinc-800/30' : 'bg-zinc-800/30 border-b border-zinc-700'}`}>
              <TableRow className={`hover:bg-transparent border-b-2 border-zinc-800 ${compact ? 'h-10' : ''}`}>
                <TableHead className={compact ? "w-[160px]" : "w-[180px]"}>
                  <button
                    onClick={() => handleSort('flight')}
                    className="flex items-center gap-1 hover:text-zinc-200 text-zinc-400"
                  >
                    <Plane className="w-3 h-3" />
                    <span>Flight Info</span>
                    <SortIcon columnKey="flight" />
                  </button>
                </TableHead>
                
                <TableHead className={compact ? "w-[140px]" : ""}>
                  <button
                    onClick={() => handleSort('alt')}
                    className="flex items-center gap-1 hover:text-zinc-200 text-zinc-400"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Position & Alt</span>
                    <SortIcon columnKey="alt" />
                  </button>
                </TableHead>
                
                <TableHead className={compact ? "w-[120px]" : ""}>
                  <button
                    onClick={() => handleSort('gspeed')}
                    className="flex items-center gap-1 hover:text-zinc-200 text-zinc-400"
                  >
                    <Gauge className="w-3 h-3" />
                    <span>Speed</span>
                    <SortIcon columnKey="gspeed" />
                  </button>
                </TableHead>
                
                <TableHead className={compact ? "w-[120px]" : ""}>
                  <button
                    onClick={() => handleSort('orig_iata')}
                    className="flex items-center gap-1 hover:text-zinc-200 text-zinc-400"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Route</span>
                    <SortIcon columnKey="orig_iata" />
                  </button>
                </TableHead>
                
                <TableHead className={compact ? "w-[120px]" : ""}>
                  <button
                    onClick={() => handleSort('timestamp')}
                    className="flex items-center gap-1 hover:text-zinc-200 text-zinc-400"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Time</span>
                    <SortIcon columnKey="timestamp" />
                  </button>
                </TableHead>
                
                <TableHead className={compact ? "w-[90px]" : "w-[100px]"}>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <RadioTower className="w-3 h-3" />
                    <span>Status</span>
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedFlights.map((flight) => (
                <Fragment key={`flight-${flight.fr24_id}`}>
                  <TableRow 
                    key={flight.fr24_id}
                    className={`
                      transition-all relative border-b border-zinc-800/50
                      ${compact ? 'h-12' : ''}
                      ${onRowClick ? 'cursor-pointer hover:bg-zinc-800/30' : ''}
                      ${isRowSelected(flight) ? 'bg-sky-500/10 border-l-4 border-l-sky-500' : ''}
                      ${expandedFlight === flight.fr24_id ? 'bg-sky-500/10' : ''}
                    `}
                    onClick={() => handleRowClick(flight)}
                  >
                    <TableCell className={compact ? "py-2" : ""}>
                      <div className={`space-y-${compact ? '0.5' : '1'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center`}>
                            <Plane className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-sky-400 rotate-45`} />
                          </div>
                          <div className="min-w-0">
                            <div className={`font-light ${compact ? 'text-xs' : 'text-sm'} truncate max-w-[100px] text-zinc-200`}>
                              {flight.flight || flight.callsign || 'N/A'}
                            </div>
                            <div className={`text-zinc-500 font-mono ${compact ? 'text-[10px]' : 'text-xs'}`}>
                              {flight.fr24_id}
                            </div>
                          </div>
                          {isRowSelected(flight) && (
                            <div className="ml-auto">
                              <CheckCircle className="w-4 h-4 text-sky-400" />
                            </div>
                          )}
                        </div>
                        <div className={`${compact ? 'text-[10px]' : 'text-xs'} flex items-center gap-1`}>
                          <span className="font-medium truncate max-w-[80px] text-zinc-400">{flight.type || 'Unknown'}</span>
                          <span className="text-zinc-500 font-mono">
                            {flight.reg ? `(${flight.reg})` : ''}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className={compact ? "py-2" : ""}>
                      <div className={`space-y-${compact ? '0.5' : '1'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`${compact ? 'text-sm' : 'text-sm'} font-medium ${getAltitudeColor(flight.alt)}`}>
                            {flight.alt != null ? `${flight.alt.toLocaleString()} ft` : 'N/A'}
                          </div>
                          {flight.track != null && (
                            <div className={`${compact ? 'text-[10px] px-1 py-0.5' : 'text-xs px-2 py-0.5'} bg-zinc-800 rounded-full text-zinc-400`}>
                              ↖ {Math.round(flight.track)}°
                            </div>
                          )}
                        </div>
                        <div className={`font-mono text-zinc-500 ${compact ? 'text-[10px]' : 'text-xs'}`}>
                          {flight.lat != null && flight.lon != null && !(flight.lat === 0 && flight.lon === 0)
                            ? `${flight.lat.toFixed(3)}, ${flight.lon.toFixed(3)}`
                            : '—'}
                        </div>
                        {flight.on_ground !== undefined && (
                          <div className={`flex items-center gap-1 ${compact ? 'text-[10px]' : 'text-xs'}`}>
                            <div className={`w-2 h-2 rounded-full ${flight.on_ground ? 'bg-zinc-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                            <span className="text-zinc-400">{flight.on_ground ? 'On Ground' : 'In Air'}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className={compact ? "py-2" : ""}>
                      <div className={`space-y-${compact ? '0.5' : '1'}`}>
                        <Badge 
                          variant={getSpeedBadgeVariant(flight.gspeed)}
                          className={`font-mono bg-zinc-800/50 text-zinc-300 border-zinc-700 ${compact ? 'text-xs px-2 py-0.5' : ''}`}
                        >
                          {flight.gspeed != null ? `${flight.gspeed} kt` : 'N/A'}
                        </Badge>
                        {flight.vspeed != null && (
                          <div className={`flex items-center gap-1 ${compact ? 'text-[10px]' : 'text-xs'}`}>
                            {flight.vspeed > 0 ? (
                              <ChevronUp className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-red-400" />
                            )}
                            <span className={flight.vspeed > 0 ? 'text-emerald-400' : 'text-red-400'}>
                              {Math.abs(flight.vspeed)} fpm
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className={compact ? "py-2" : ""}>
                      <div className={`space-y-${compact ? '0.5' : '1'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`${compact ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'} bg-sky-500/10 border border-sky-500/30 rounded font-medium text-sky-400`}>
                            {flight.orig_iata || '—'}
                          </div>
                          <div className={`${compact ? 'text-xs' : 'text-xs'} text-zinc-500`}>→</div>
                          <div className={`${compact ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'} bg-emerald-500/10 border border-emerald-500/30 rounded font-medium text-emerald-400`}>
                            {flight.dest_iata || '—'}
                          </div>
                        </div>
                        <div className={`text-zinc-500 font-mono ${compact ? 'text-[10px]' : 'text-xs'}`}>
                          {flight.orig_icao || '—'} → {flight.dest_icao || '—'}
                        </div>
                        {flight.eta && (
                          <div className={`${compact ? 'text-[10px]' : 'text-xs'} text-zinc-500`}>
                            ETA: {formatTime(flight.eta)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className={compact ? "py-2" : ""}>
                      <div className={`space-y-${compact ? '0.5' : '1'}`}>
                        <div className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-zinc-300`}>
                          {formatTime(flight.timestamp)}
                        </div>
                        <div className={`text-zinc-500 ${compact ? 'text-[10px]' : 'text-xs'}`}>
                          {flight.eta && `ETA: ${formatTime(flight.eta)}`}
                        </div>
                        {flight.eta && (
                          <div className={`${compact ? 'text-[10px]' : 'text-xs'} text-zinc-500`}>
                            {formatDate(flight.eta)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className={compact ? "py-2" : ""}>
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant={flight.source === 'ADSB' ? 'default' : 'secondary'}
                          className={`${compact ? "text-[10px] px-2 py-0" : "text-xs"} ${flight.source === 'ADSB' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 'bg-zinc-800/50 text-zinc-400 border-zinc-700'}`}
                        >
                          {flight.source || 'UNK'}
                        </Badge>
                        {flight.squawk != null && (
                          <div className={`${compact ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-xs'} bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-mono`}>
                            SQ: {flight.squawk}
                          </div>
                        )}
                        {!flight.lat || !flight.lon ? (
                          <div className={`flex items-center gap-1 ${compact ? 'text-[10px]' : 'text-xs'} text-red-400`}>
                            <XCircle className="w-3 h-3" />
                            <span>No Pos</span>
                          </div>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded details row */}
                  {expandedFlight === flight.fr24_id && (
                    <TableRow key={`${flight.fr24_id}-expanded`} className="bg-sky-500/5 border-b border-zinc-800/50">
                      <TableCell colSpan={6} className="p-0 border-t-0">
                        <div className={`${compact ? 'p-4' : 'p-6'}`}>
                          <div className={`grid ${compact ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-6'}`}>
                            <div className="space-y-3">
                              <h4 className={`font-light ${compact ? 'text-sm' : 'text-sm'} flex items-center gap-2 text-zinc-200`}>
                                <Plane className="w-4 h-4 text-sky-400" />
                                Aircraft Details
                              </h4>
                              <div className={`grid ${compact ? 'grid-cols-2 gap-2' : 'grid-cols-2 gap-3'}`}>
                                <div>
                                  <div className={`text-zinc-500 ${compact ? 'text-xs' : 'text-xs'}`}>Registration</div>
                                  <div className={`font-mono font-medium text-zinc-300 ${compact ? 'text-sm' : ''}`}>{flight.reg || '—'}</div>
                                </div>
                                <div>
                                  <div className={`text-zinc-500 ${compact ? 'text-xs' : 'text-xs'}`}>Type</div>
                                  <div className={`font-medium text-zinc-300 ${compact ? 'text-sm' : ''}`}>{flight.type || '—'}</div>
                                </div>
                                <div>
                                  <div className={`text-zinc-500 ${compact ? 'text-xs' : 'text-xs'}`}>Painted As</div>
                                  <div className={`font-medium text-zinc-300 ${compact ? 'text-sm' : ''}`}>{flight.painted_as || '—'}</div>
                                </div>
                                <div>
                                  <div className={`text-zinc-500 ${compact ? 'text-xs' : 'text-xs'}`}>Operating As</div>
                                  <div className={`font-medium text-zinc-300 ${compact ? 'text-sm' : ''}`}>{flight.operating_as || '—'}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <h4 className={`font-light ${compact ? 'text-sm' : 'text-sm'} flex items-center gap-2 text-zinc-200`}>
                                <Satellite className="w-4 h-4 text-sky-400" />
                                Technical Data
                              </h4>
                              <div className={`grid ${compact ? 'grid-cols-2 gap-2' : 'grid-cols-2 gap-3'}`}>
                                <div>
                                  <div className={`text-zinc-500 ${compact ? 'text-xs' : 'text-xs'}`}>HEX Code</div>
                                  <div className={`font-mono font-medium text-zinc-300 ${compact ? 'text-sm' : ''}`}>{flight.hex || '—'}</div>
                                </div>
                                <div>
                                  <div className={`text-zinc-500 ${compact ? 'text-xs' : 'text-xs'}`}>Squawk</div>
                                  <div className={`font-mono font-medium text-zinc-300 ${compact ? 'text-sm' : ''}`}>{flight.squawk ?? '—'}</div>
                                </div>
                                <div>
                                  <div className={`text-zinc-500 ${compact ? 'text-xs' : 'text-xs'}`}>Callsign</div>
                                  <div className={`font-mono font-medium text-zinc-300 ${compact ? 'text-sm' : ''}`}>{flight.callsign || '—'}</div>
                                </div>
                                <div>
                                  <div className={`text-zinc-500 ${compact ? 'text-xs' : 'text-xs'}`}>Source</div>
                                  <Badge variant="outline" className={`${compact ? "text-xs px-2 py-0" : "text-xs"} bg-zinc-800/50 text-zinc-400 border-zinc-700`}>
                                    {flight.source || 'UNK'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <h4 className={`font-light ${compact ? 'text-sm' : 'text-sm'} flex items-center gap-2 text-zinc-200`}>
                                <Navigation className="w-4 h-4 text-sky-400" />
                                Position Information
                              </h4>
                              <div className={`grid ${compact ? 'grid-cols-2 gap-2' : 'grid-cols-2 gap-3'}`}>
                                <div>
                                  <div className={`text-zinc-500 ${compact ? 'text-xs' : 'text-xs'}`}>Origin</div>
                                  <div className={`font-medium text-zinc-300 ${compact ? 'text-sm' : ''}`}>
                                    {flight.orig_iata || flight.orig_icao ? 
                                      `${flight.orig_iata || ''} (${flight.orig_icao || ''})` : '—'}
                                  </div>
                                </div>
                                <div>
                                  <div className={`text-zinc-500 ${compact ? 'text-xs' : 'text-xs'}`}>Destination</div>
                                  <div className={`font-medium text-zinc-300 ${compact ? 'text-sm' : ''}`}>
                                    {flight.dest_iata || flight.dest_icao ? 
                                      `${flight.dest_iata || ''} (${flight.dest_icao || ''})` : '—'}
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <div className={`text-zinc-500 ${compact ? 'text-xs' : 'text-xs'}`}>Coordinates</div>
                                  <div className={`font-mono text-zinc-300 ${compact ? 'text-xs' : 'text-sm'}`}>
                                    {flight.lat != null && flight.lon != null && !(flight.lat === 0 && flight.lon === 0)
                                      ? `Lat: ${flight.lat.toFixed(5)}, Lon: ${flight.lon.toFixed(5)}`
                                      : '—'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {!compact && (
          <div className="px-6 py-3 bg-zinc-800/30 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-400">
                <span className="font-medium text-zinc-300">{sortedFlights.length}</span> flight
                {sortedFlights.length !== 1 ? 's' : ''} tracked
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                {onRowClick ? (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    <span>Click any flight to view on map</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    <span>Click any flight for detailed information</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {compact && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800/50 backdrop-blur-sm rounded-full border border-zinc-700">
            <span className="text-xs text-zinc-400">
              {sortedFlights.length} flights • Click to view on map
            </span>
          </div>
        </div>
      )}
    </div>
  );
}