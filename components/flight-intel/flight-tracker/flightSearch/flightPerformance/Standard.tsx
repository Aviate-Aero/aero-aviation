'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
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
    Climbing: { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    Descending: { badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    Cruise: { badge: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
    'Low Altitude': { badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    Unknown: { badge: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
  }[phase] || { badge: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' };

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400">Loading performance data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tracks || tracks.length === 0) {
    return (
      <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">
        <CardContent className="text-center py-12">
          <Activity className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
          <p className="text-zinc-400">No historical track data available for this flight.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-6"
    >
      {/* Flight header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-white flex items-center gap-3">
            <Plane className="w-6 h-6 text-sky-400" />
            {flight?.callsign || flight?.flight || 'Flight'} Performance
          </h1>
          <p className="text-zinc-400 mt-1">
            {flight?.type || 'Aircraft'} · {flight?.reg || '—'}
          </p>
        </div>
        <Badge className={`${phaseConfig.badge} px-4 py-2 text-sm font-medium border`}>
          {phase}
        </Badge>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Gauge className="w-5 h-5" />}
          label="Ground Speed"
          value={tracks.length ? `${tracks[tracks.length - 1].gspeed ?? '—'} kt` : '—'}
          color="sky"
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
          color={tracks[tracks.length - 1]?.vspeed && tracks[tracks.length - 1].vspeed! > 0 ? 'emerald' : 'amber'}
        />
        <MetricCard
          icon={<Clock className="w-5 h-5" />}
          label="Track Duration"
          value={stats?.duration ? `${stats.duration} min` : '—'}
          color="sky"
        />
      </div>

      {/* Second row: more stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Max Altitude"
          value={stats?.maxAlt ? `${stats.maxAlt.toLocaleString()} ft` : '—'}
          color="sky"
        />
        <MetricCard
          icon={<Gauge className="w-5 h-5" />}
          label="Avg Speed"
          value={stats?.avgSpeed ? `${Math.round(stats.avgSpeed)} kt` : '—'}
          color="emerald"
        />
        <MetricCard
          icon={<Activity className="w-5 h-5" />}
          label="Max Climb"
          value={stats?.maxVspeed ? `${stats.maxVspeed} fpm` : '—'}
          color="emerald"
        />
        <MetricCard
          icon={<Activity className="w-5 h-5" />}
          label="Max Descent"
          value={stats?.minVspeed ? `${Math.abs(stats.minVspeed)} fpm` : '—'}
          color="rose"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Altitude Chart */}
        <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-white">Altitude Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="altGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12, fill: '#a1a1aa' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#a1a1aa' }}
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `${value} ft`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #3f3f46',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                      color: '#e4e4e7',
                    }}
                    labelStyle={{ color: '#a1a1aa' }}
                    itemStyle={{ color: '#e4e4e7' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="alt"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fill="url(#altGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#0ea5e9' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Speed Chart */}
        <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-white">Ground Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12, fill: '#a1a1aa' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#a1a1aa' }}
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `${value} kt`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #3f3f46',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                      color: '#e4e4e7',
                    }}
                    labelStyle={{ color: '#a1a1aa' }}
                    itemStyle={{ color: '#e4e4e7' }}
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
        <Card className="bg-zinc-900 border-zinc-800 rounded-2xl lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-white">Vertical Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12, fill: '#a1a1aa' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#a1a1aa' }}
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `${value} fpm`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #3f3f46',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                      color: '#e4e4e7',
                    }}
                    labelStyle={{ color: '#a1a1aa' }}
                    itemStyle={{ color: '#e4e4e7' }}
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
                    fillOpacity={0.15}
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
        <Card className="bg-zinc-800/50 border-zinc-700 rounded-2xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div>
                <p className="text-zinc-500 text-xs font-medium mb-1">Callsign</p>
                <p className="text-white font-medium">{flight.callsign || '—'}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-medium mb-1">Aircraft</p>
                <p className="text-white font-medium">{flight.type || '—'}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-medium mb-1">Registration</p>
                <p className="text-white font-medium">{flight.reg || '—'}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-medium mb-1">Source</p>
                <p className="text-white font-medium">{flight.source || '—'}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-medium mb-1">Origin</p>
                <p className="text-white font-medium">{flight.orig_iata || flight.orig_icao || '—'}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-medium mb-1">Destination</p>
                <p className="text-white font-medium">{flight.dest_iata || flight.dest_icao || '—'}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-medium mb-1">Squawk</p>
                <p className="text-white font-medium">{flight.squawk || '—'}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-medium mb-1">Last Update</p>
                <p className="text-white font-medium">
                  {stats?.lastUpdate
                    ? new Date(stats.lastUpdate).toLocaleTimeString()
                    : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
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
  color: 'sky' | 'purple' | 'emerald' | 'amber' | 'rose';
}) {
  const colorConfig = {
    sky: {
      border: 'border-l-sky-500',
      bg: 'bg-zinc-900',
      iconBg: 'bg-sky-500/20',
      iconText: 'text-sky-400',
    },
    purple: {
      border: 'border-l-purple-500',
      bg: 'bg-zinc-900',
      iconBg: 'bg-purple-500/20',
      iconText: 'text-purple-400',
    },
    emerald: {
      border: 'border-l-emerald-500',
      bg: 'bg-zinc-900',
      iconBg: 'bg-emerald-500/20',
      iconText: 'text-emerald-400',
    },
    amber: {
      border: 'border-l-amber-500',
      bg: 'bg-zinc-900',
      iconBg: 'bg-amber-500/20',
      iconText: 'text-amber-400',
    },
    rose: {
      border: 'border-l-rose-500',
      bg: 'bg-zinc-900',
      iconBg: 'bg-rose-500/20',
      iconText: 'text-rose-400',
    },
  }[color];

  return (
    <div
      className={`${colorConfig.bg} ${colorConfig.border} border-l-4 rounded-xl border border-zinc-800 p-4 flex flex-col gap-2 shadow-sm hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{label}</p>
        <div className={`${colorConfig.iconBg} p-1.5 rounded-md border border-zinc-700`}>
          <div className={colorConfig.iconText}>{icon}</div>
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}