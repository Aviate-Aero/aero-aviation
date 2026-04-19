'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  AreaChart,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/card/Standard';
import { Badge } from '@/components/badge/Standard';
import {
  TrendingUp,
  TrendingDown,
  Gauge,
  Navigation,
  Clock,
  BarChart3,
  Activity,
  Plane,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

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

interface FlightPerformanceDashboardProps {
  tracks?: TrackPoint[];
  flight: any;
  isLoading?: boolean;
}

export default function FlightPerformanceDashboard({
  tracks = [],
  flight,
  isLoading = false,
}: FlightPerformanceDashboardProps) {
  const chartData = useMemo(() => {
    if (!tracks || tracks.length === 0) return [];
    return tracks.map((point) => ({
      time: new Date(point.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      alt: point.alt ?? null,
      speed: point.gspeed ?? null,
      vspeed: point.vspeed ?? null,
      track: point.track ?? null,
    }));
  }, [tracks]);

  const stats = useMemo(() => {
    if (!tracks || tracks.length === 0) return null;

    const altitudes = tracks.map((t) => t.alt).filter((a) => a != null) as number[];
    const speeds = tracks.map((t) => t.gspeed).filter((s) => s != null) as number[];
    const vspeeds = tracks.map((t) => t.vspeed).filter((v) => v != null) as number[];

    const maxAlt = altitudes.length ? Math.max(...altitudes) : 0;
    const avgSpeed = speeds.length
      ? speeds.reduce((a, b) => a + b, 0) / speeds.length
      : 0;
    const maxSpeed = speeds.length ? Math.max(...speeds) : 0;
    const maxVspeed = vspeeds.length ? Math.max(...vspeeds) : 0;
    const minVspeed = vspeeds.length ? Math.min(...vspeeds) : 0;

    const first = tracks[0];
    const last = tracks[tracks.length - 1];
    const timeDiff = last.timestamp && first.timestamp
      ? (new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()) / 1000 / 60
      : 0;

    return {
      maxAlt,
      avgSpeed,
      maxSpeed,
      maxVspeed,
      minVspeed,
      duration: timeDiff.toFixed(1),
      lastUpdate: last.timestamp,
    };
  }, [tracks]);

  const getFlightPhase = () => {
    if (!tracks || tracks.length === 0) return 'Unknown';
    const last = tracks[tracks.length - 1];
    if (!last.vspeed || !last.alt) return 'Unknown';
    if (last.vspeed > 300) return 'Climbing';
    if (last.vspeed < -300) return 'Descending';
    if (last.alt < 10000) return 'Low Altitude';
    return 'Cruise';
  };

  const phase = getFlightPhase();
  const phaseConfig = {
    Climbing: { badge: 'bg-green-100 text-green-700 border-green-200' },
    Descending: { badge: 'bg-amber-100 text-amber-700 border-amber-200' },
    Cruise: { badge: 'bg-blue-100 text-blue-700 border-blue-200' },
    'Low Altitude': { badge: 'bg-purple-100 text-purple-700 border-purple-200' },
    Unknown: { badge: 'bg-gray-100 text-gray-700 border-gray-200' },
  }[phase] || { badge: 'bg-gray-100 text-gray-700 border-gray-200' };

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Loading performance data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tracks || tracks.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="text-center py-12">
          <Activity className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600">No historical track data available for this flight.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Flight header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Plane className="w-6 h-6 text-blue-600" />
            {flight?.callsign || flight?.flight || 'Flight'} Performance
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {flight?.type || 'Aircraft'} · {flight?.reg || '—'}
          </p>
        </div>
        <Badge className={`${phaseConfig.badge} px-4 py-2 text-sm font-semibold border`}>
          {phase}
        </Badge>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Gauge className="w-5 h-5" />}
          label="Ground Speed"
          value={tracks.length ? `${tracks[tracks.length - 1].gspeed ?? '—'} kt` : '—'}
          color="blue"
        />
        <MetricCard
          icon={<Navigation className="w-5 h-5" />}
          label="Altitude"
          value={tracks.length ? `${tracks[tracks.length - 1].alt?.toLocaleString() ?? '—'} ft` : '—'}
          color="purple"
        />
        <MetricCard
          icon={
            (tracks[tracks.length - 1]?.vspeed ?? 0) > 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )
          }
          label="Vertical Speed"
          value={tracks.length ? `${Math.abs(tracks[tracks.length - 1]?.vspeed ?? 0)} fpm` : '—'}
          color={tracks[tracks.length - 1]?.vspeed && tracks[tracks.length - 1].vspeed! > 0 ? 'green' : 'amber'}
        />
        <MetricCard
          icon={<Clock className="w-5 h-5" />}
          label="Track Duration"
          value={stats?.duration ? `${stats.duration} min` : '—'}
          color="blue"
        />
      </div>

      {/* Second row: more stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Max Altitude"
          value={stats?.maxAlt ? `${stats.maxAlt.toLocaleString()} ft` : '—'}
          color="blue"
        />
        <MetricCard
          icon={<Gauge className="w-5 h-5" />}
          label="Avg Speed"
          value={stats?.avgSpeed ? `${Math.round(stats.avgSpeed)} kt` : '—'}
          color="green"
        />
        <MetricCard
          icon={<Activity className="w-5 h-5" />}
          label="Max Climb"
          value={stats?.maxVspeed ? `${stats.maxVspeed} fpm` : '—'}
          color="green"
        />
        <MetricCard
          icon={<Activity className="w-5 h-5" />}
          label="Max Descent"
          value={stats?.minVspeed ? `${Math.abs(stats.minVspeed)} fpm` : '—'}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Altitude Chart */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Altitude Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="altGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `${value} ft`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#111827' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="alt"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#altGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#3b82f6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Speed Chart */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Ground Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `${value} kt`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#111827' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="speed"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Vertical Speed Chart */}
        <Card className="border-gray-200 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Vertical Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `${value} fpm`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#111827' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="vspeed"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, fill: '#f97316' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="vspeed"
                    fill="#f97316"
                    fillOpacity={0.1}
                    stroke="none"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional info card */}
      {flight && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div>
                <p className="text-gray-600 text-xs font-medium mb-1">Callsign</p>
                <p className="text-gray-900 font-semibold">{flight.callsign || '—'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs font-medium mb-1">Aircraft</p>
                <p className="text-gray-900 font-semibold">{flight.type || '—'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs font-medium mb-1">Registration</p>
                <p className="text-gray-900 font-semibold">{flight.reg || '—'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs font-medium mb-1">Source</p>
                <p className="text-gray-900 font-semibold">{flight.source || '—'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs font-medium mb-1">Origin</p>
                <p className="text-gray-900 font-semibold">{flight.orig_iata || flight.orig_icao || '—'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs font-medium mb-1">Destination</p>
                <p className="text-gray-900 font-semibold">{flight.dest_iata || flight.dest_icao || '—'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs font-medium mb-1">Squawk</p>
                <p className="text-gray-900 font-semibold">{flight.squawk || '—'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs font-medium mb-1">Last Update</p>
                <p className="text-gray-900 font-semibold">
                  {stats?.lastUpdate
                    ? new Date(stats.lastUpdate).toLocaleTimeString()
                    : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colorConfig = {
    blue: {
      border: 'border-l-blue-500',
      bg: 'bg-white',
      icon: 'text-blue-600',
    },
    purple: {
      border: 'border-l-purple-500',
      bg: 'bg-white',
      icon: 'text-purple-600',
    },
    green: {
      border: 'border-l-green-500',
      bg: 'bg-white',
      icon: 'text-green-600',
    },
    amber: {
      border: 'border-l-amber-500',
      bg: 'bg-white',
      icon: 'text-amber-600',
    },
    red: {
      border: 'border-l-red-500',
      bg: 'bg-white',
      icon: 'text-red-600',
    },
  }[color] || {
    border: 'border-l-gray-300',
    bg: 'bg-white',
    icon: 'text-gray-600',
  };

  return (
    <div
      className={`${colorConfig.bg} ${colorConfig.border} border-l-4 rounded-lg border border-gray-200 p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</p>
        <div className={`${colorConfig.icon} p-1.5 rounded-md bg-gray-50`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
