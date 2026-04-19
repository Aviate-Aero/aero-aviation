'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/card/Standard';
import { Badge } from '@/components/badge/Standard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/table/Standard';
import {
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  Building2,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import FlightMap from '../../flightMaps/Standard';

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

interface Flight {
  fr24_id: string;
  flight?: string;
  callsign?: string;
  lat?: number;
  lon?: number;
  alt?: number;
  gspeed?: number;
  vspeed?: number;
  orig_iata?: string;
  orig_icao?: string;
  dest_iata?: string;
  dest_icao?: string;
  type?: string;
  reg?: string;
  operating_as?: string;
  timestamp?: string;
  eta?: string;
  on_ground?: boolean;
}

interface AirportDashboardProps {
  flights: Flight[];
  airportCode: string;
  isLoading?: boolean;
}

const COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899'];

export default function AirportDashboard({ flights, airportCode, isLoading = false }: AirportDashboardProps) {
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [flightTracks, setFlightTracks] = useState<{ [flightId: string]: TrackPoint[] }>({});
  const [tracksLoading, setTracksLoading] = useState(false);

  const arrivals = useMemo(
    () => flights.filter((f) => f.dest_iata === airportCode || f.dest_icao === airportCode),
    [flights, airportCode]
  );
  const departures = useMemo(
    () => flights.filter((f) => f.orig_iata === airportCode || f.orig_icao === airportCode),
    [flights, airportCode]
  );

  useEffect(() => {
    if (!selectedFlight?.fr24_id) return;

    const flightId = selectedFlight.fr24_id;
    if (flightTracks[flightId]) return;

    const fetchTracks = async () => {
      setTracksLoading(true);
      try {
        const response = await fetch(`/api/flightTracks?flight_id=${flightId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch tracks: ${response.statusText}`);
        }
        const data = await response.json();
        setFlightTracks(prev => ({ ...prev, [flightId]: data.tracks || [] }));
      } catch (err) {
        console.error('Error fetching flight tracks:', err);
      } finally {
        setTracksLoading(false);
      }
    };

    fetchTracks();
  }, [selectedFlight, flightTracks]);

  const stats = useMemo(() => {
    const total = arrivals.length + departures.length;
    const airlines = new Set(flights.map((f) => f.operating_as).filter(Boolean));
    const busiestAirline = [...airlines].reduce((a, b) => {
      const countA = flights.filter((f) => f.operating_as === a).length;
      const countB = flights.filter((f) => f.operating_as === b).length;
      return countA > countB ? a : b;
    }, '');

    const hours = [...Array(24)].map((_, i) => i);
    const trafficByHour = hours.map((hour) => {
      const arrivalsHour = arrivals.filter((f) => {
        const eta = f.eta ? new Date(f.eta).getHours() : null;
        return eta === hour;
      }).length;
      return {
        hour: `${hour}:00`,
        arrivals: arrivalsHour,
        departures: 0,
        total: arrivalsHour,
      };
    });

    const peakHour = trafficByHour.reduce(
      (max, curr) => (curr.total > max.total ? curr : max),
      { hour: '', total: 0 }
    );

    const airlineMap = new Map<string, number>();
    flights.forEach((f) => {
      if (f.operating_as) {
        airlineMap.set(f.operating_as, (airlineMap.get(f.operating_as) || 0) + 1);
      }
    });
    const airlineData = Array.from(airlineMap.entries())
      .map(([name, count]) => ({ name: name.substring(0, 3).toUpperCase(), value: count, fullName: name }))
      .sort((a, b) => b.value - a.value);

    return {
      total,
      arrivals: arrivals.length,
      departures: departures.length,
      airlines: airlines.size,
      busiestAirline,
      peakHour: peakHour.hour,
      peakHourCount: peakHour.total,
      trafficByHour: trafficByHour.filter(h => h.total > 0),
      airlineData,
    };
  }, [flights, arrivals, departures, airportCode]);

  const closeModal = () => {
    setSelectedFlight(null);
  };

  if (isLoading) {
    return (
      <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400">Loading airport data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (flights.length === 0) {
    return (
      <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardContent className="text-center py-12">
          <Building2 className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
          <p className="text-zinc-400">No flights found for airport {airportCode}.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-zinc-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-sky-400" />
            {airportCode} Airport Operations
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            {stats.total} active flights · {stats.airlines} airlines
          </p>
        </div>
        <Badge className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-3 py-1 text-sm font-medium rounded-full">
          Live
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          icon={<Plane className="w-5 h-5" />} 
          label="Total Flights" 
          value={stats.total.toString()} 
          color="sky" 
        />
        <MetricCard 
          icon={<PlaneLanding className="w-5 h-5" />} 
          label="Arrivals" 
          value={stats.arrivals.toString()} 
          color="emerald" 
        />
        <MetricCard 
          icon={<PlaneTakeoff className="w-5 h-5" />} 
          label="Departures" 
          value={stats.departures.toString()} 
          color="amber" 
        />
        <MetricCard 
          icon={<Building2 className="w-5 h-5" />} 
          label="Busiest Airline" 
          value={stats.busiestAirline || '—'} 
          color="purple" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-zinc-800/50 pb-3">
            <CardTitle className="text-base font-light text-zinc-100 flex items-center gap-2">
              <PlaneLanding className="w-5 h-5 text-emerald-400" />
              Arrivals
            </CardTitle>
            <CardDescription className="text-zinc-500">Incoming flights to {airportCode}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <FlightMiniTable flights={arrivals} type="arrival" onSelect={setSelectedFlight} />
          </CardContent>
        </Card>

        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-zinc-800/50 pb-3">
            <CardTitle className="text-base font-light text-zinc-100 flex items-center gap-2">
              <PlaneTakeoff className="w-5 h-5 text-amber-400" />
              Departures
            </CardTitle>
            <CardDescription className="text-zinc-500">Outgoing flights from {airportCode}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <FlightMiniTable flights={departures} type="departure" onSelect={setSelectedFlight} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-zinc-800/50 pb-3">
            <CardTitle className="text-base font-light text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-400" />
              Hourly Traffic
            </CardTitle>
            <CardDescription className="text-zinc-500">Operations per hour today</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.trafficByHour} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#a1a1aa' }} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#a1a1aa' }} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #3f3f46', 
                      borderRadius: '0.5rem',
                      color: '#e4e4e7'
                    }} 
                  />
                  <Bar dataKey="arrivals" stackId="a" fill="#10b981" name="Arrivals" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="departures" stackId="a" fill="#f59e0b" name="Departures" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-zinc-800/50 pb-3">
            <CardTitle className="text-base font-light text-zinc-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Airlines
            </CardTitle>
            <CardDescription className="text-zinc-500">Top operating airlines</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={stats.airlineData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.airlineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${value} flights`}
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #3f3f46', 
                      borderRadius: '0.5rem',
                      color: '#e4e4e7'
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {stats.airlineData.slice(0, 5).map((airline, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-zinc-300">{airline.fullName}</span>
                  </div>
                  <span className="font-medium text-zinc-200">{airline.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedFlight && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h3 className="text-lg font-light text-zinc-100 flex items-center gap-2">
                <Plane className="w-5 h-5 text-sky-400" />
                Flight {selectedFlight.callsign || selectedFlight.flight} Track
              </h3>
              <button
                onClick={closeModal}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-full hover:bg-zinc-800"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 h-96">
              {tracksLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-zinc-400">Loading track...</p>
                  </div>
                </div>
              ) : selectedFlight.lat != null && selectedFlight.lon != null ? (
                <FlightMap
                  key={selectedFlight.fr24_id}
                  flights={[selectedFlight]}
                  selectedFlight={selectedFlight}
                  onFlightSelect={setSelectedFlight}
                  tracks={flightTracks[selectedFlight.fr24_id] || []}
                  tracksLoading={tracksLoading}
                  height="100%"
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-zinc-500">No position data for this flight</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FlightMiniTable({ flights, type, onSelect }: { flights: Flight[]; type: 'arrival' | 'departure'; onSelect: (flight: Flight) => void }) {
  if (flights.length === 0) return <p className="text-sm text-zinc-500 py-4 text-center">No {type}s found</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-zinc-800 hover:bg-transparent">
          <TableHead className="text-zinc-500 font-medium">Flight</TableHead>
          <TableHead className="text-zinc-500 font-medium">{type === 'arrival' ? 'From' : 'To'}</TableHead>
          <TableHead className="text-zinc-500 font-medium">Aircraft</TableHead>
          <TableHead className="text-zinc-500 font-medium">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flights.slice(0, 8).map((flight) => (
          <TableRow 
            key={flight.fr24_id} 
            className="cursor-pointer border-zinc-800 hover:bg-zinc-800/50 transition-colors" 
            onClick={() => onSelect(flight)}
          >
            <TableCell className="font-medium text-zinc-200">{flight.callsign || flight.flight || '—'}</TableCell>
            <TableCell className="text-zinc-400">{type === 'arrival' ? (flight.orig_iata || flight.orig_icao || '—') : (flight.dest_iata || flight.dest_icao || '—')}</TableCell>
            <TableCell className="text-sm text-zinc-400">{flight.type || '—'}</TableCell>
            <TableCell>
              <Badge className="text-xs bg-zinc-800/50 text-zinc-400 border-zinc-700">
                {flight.on_ground ? 'On Ground' : 'In Air'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorClasses = {
    sky: 'border-l-sky-500 bg-sky-500/5',
    emerald: 'border-l-emerald-500 bg-emerald-500/5',
    amber: 'border-l-amber-500 bg-amber-500/5',
    purple: 'border-l-purple-500 bg-purple-500/5',
    indigo: 'border-l-indigo-500 bg-indigo-500/5',
    red: 'border-l-red-500 bg-red-500/5',
  }[color] || 'border-l-zinc-700 bg-zinc-800/30';

  const textClasses = {
    sky: 'text-sky-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
    indigo: 'text-indigo-400',
    red: 'text-red-400',
  }[color] || 'text-zinc-400';

  return (
    <div className={`${colorClasses} rounded-xl border-l-4 border-zinc-800/50 p-4 backdrop-blur-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium ${textClasses} opacity-75`}>{label}</p>
          <p className="text-2xl font-light text-zinc-100 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg bg-black/40 ${textClasses}`}>{icon}</div>
      </div>
    </div>
  );
}