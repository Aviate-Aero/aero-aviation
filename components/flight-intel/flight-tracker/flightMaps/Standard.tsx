'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import type { ComponentType } from 'react';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import {
  GeoJSON,
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import { divIcon, LatLngBounds } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  Plane,
  Navigation,
  Cloud,
  CloudRain,
  Thermometer,
  Wind,
  Gauge,
  SlidersHorizontal,
  Layers,
  RefreshCw,
  ShieldAlert,
  X,
  type LucideProps,
} from 'lucide-react';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default Leaflet marker icons in Next.js
// @ts-expect-error Leaflet keeps this compatibility helper private in its types.
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

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

interface FlightMapProps {
  flights: Flight[];
  selectedFlight?: Flight | null;
  onFlightSelect?: (flight: Flight) => void;
  tracks?: TrackPoint[];
  tracksLoading?: boolean;
  height?: string;
}

type WeatherLayer = {
  id: string;
  label: string;
  description: string;
  opacity: number;
  icon: ComponentType<LucideProps>;
};

type AdvisoryKind = 'AIRMET' | 'SIGMET';

type AdvisoryProperties = {
  id: string;
  advisoryKind: AdvisoryKind;
  product: string;
  hazard: string;
  qualifier: string | null;
  validFrom: string | null;
  validTo: string | null;
  altitudeLow: string | null;
  altitudeHigh: string | null;
  movement: string | null;
  issuingOffice: string | null;
  firName: string | null;
  rawText: string | null;
};

type AdvisoryCollection = FeatureCollection<Geometry, AdvisoryProperties> & {
  meta?: {
    fetchedAt?: string;
    unavailableSources?: string[];
  };
};

type TrackSourceKey =
  | 'adsb'
  | 'estimated'
  | 'mlat'
  | 'radar'
  | 'satellite'
  | 'terrestrial'
  | 'flarm'
  | 'faa'
  | 'unknown';

type TrackSourceStyle = {
  label: string;
  color: string;
  dashArray?: string;
};

type TrackSegment = {
  source: TrackSourceKey;
  positions: [number, number][];
};

const TRACK_SOURCE_STYLES: Record<TrackSourceKey, TrackSourceStyle> = {
  adsb: {
    label: 'ADS-B',
    color: '#f97316',
  },
  estimated: {
    label: 'Iridium Next',
    color: '#a855f7',
    dashArray: '8 8',
  },
  mlat: {
    label: 'MLAT',
    color: '#22c55e',
  },
  radar: {
    label: 'Radar',
    color: '#38bdf8',
  },
  satellite: {
    label: 'Satellite',
    color: '#eab308',
  },
  terrestrial: {
    label: 'Terrestrial',
    color: '#14b8a6',
  },
  flarm: {
    label: 'FLARM',
    color: '#ec4899',
  },
  faa: {
    label: 'FAA',
    color: '#ef4444',
  },
  unknown: {
    label: 'Unknown',
    color: '#94a3b8',
  },
};

const weatherLayers: WeatherLayer[] = [
  {
    id: 'clouds_new',
    label: 'Clouds',
    description: 'Live cloud coverage',
    opacity: 0.6,
    icon: Cloud,
  },
  {
    id: 'precipitation_new',
    label: 'Precipitation',
    description: 'Rain and snowfall intensity',
    opacity: 0.65,
    icon: CloudRain,
  },
  {
    id: 'temp_new',
    label: 'Temperature',
    description: 'Surface temperature overlay',
    opacity: 0.55,
    icon: Thermometer,
  },
  {
    id: 'wind_new',
    label: 'Wind',
    description: 'Wind speed overlay',
    opacity: 0.55,
    icon: Wind,
  },
  {
    id: 'pressure_new',
    label: 'Pressure',
    description: 'Sea level pressure',
    opacity: 0.55,
    icon: Gauge,
  },
];

function normalizeTrackSource(source?: string): TrackSourceKey {
  const raw = source?.trim().toLowerCase() ?? '';

  if (!raw) return 'unknown';

  if (
    raw.includes('ads-b') ||
    raw.includes('adsb') ||
    raw.includes('ads_b')
  ) {
    return 'adsb';
  }

  if (
    raw.includes('estimated') ||
    raw === 'est' ||
    raw.includes('estimate') ||
    raw.includes('predicted') ||
    raw.includes('prediction')
  ) {
    return 'estimated';
  }

  if (raw.includes('mlat') || raw.includes('multilateration')) {
    return 'mlat';
  }

  if (raw.includes('radar')) {
    return 'radar';
  }

  if (raw.includes('satellite') || raw.includes('sat')) {
    return 'satellite';
  }

  if (raw.includes('terrestrial') || raw.includes('tisb')) {
    return 'terrestrial';
  }

  if (raw.includes('flarm')) {
    return 'flarm';
  }

  if (raw.includes('faa') || raw.includes('asdi')) {
    return 'faa';
  }

  return 'unknown';
}

function isValidLatLon(lat?: number, lon?: number) {
  return (
    lat != null &&
    lon != null &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
  );
}

function isValidTrackPoint(point: TrackPoint) {
  return isValidLatLon(point.lat, point.lon);
}

function MapController({ flight }: { flight?: Flight | null }) {
  const map = useMap();
  const flightId = flight?.fr24_id;
  const latitude = flight?.lat;
  const longitude = flight?.lon;

  useEffect(() => {
    if (isValidLatLon(latitude, longitude)) {
      const currentZoom = map.getZoom();

      map.flyTo([latitude!, longitude!], currentZoom, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [flightId, latitude, longitude, map]);

  return null;
}

function FitBoundsToTracks({
  tracks,
  selectedFlightId,
}: {
  tracks: TrackPoint[];
  selectedFlightId?: string;
}) {
  const map = useMap();

  useEffect(() => {
    if (tracks.length === 0) return;

    const validPoints = tracks.filter(isValidTrackPoint);

    if (validPoints.length === 0) return;

    const bounds = new LatLngBounds(
      validPoints.map((t) => [t.lat, t.lon] as [number, number])
    );

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [tracks, selectedFlightId, map]);

  return null;
}

type WeatherControlProps = {
  weatherEnabled: boolean;
  weatherPanelOpen: boolean;
  activeWeatherLayer: WeatherLayer;
  weatherOpacity: number;
  setWeatherEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setWeatherPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setWeatherOpacity: React.Dispatch<React.SetStateAction<number>>;
  handleWeatherLayerChange: (layer: WeatherLayer) => void;
};

function WeatherControl({
  weatherEnabled,
  weatherPanelOpen,
  activeWeatherLayer,
  weatherOpacity,
  setWeatherEnabled,
  setWeatherPanelOpen,
  setWeatherOpacity,
  handleWeatherLayerChange,
}: WeatherControlProps) {
  const map = useMap();

  useEffect(() => {
    const controlContainer = document.querySelector(
      '.weather-leaflet-control'
    ) as HTMLElement | null;

    if (!controlContainer) return;

    L.DomEvent.disableClickPropagation(controlContainer);
    L.DomEvent.disableScrollPropagation(controlContainer);
  }, [map, weatherPanelOpen, weatherEnabled]);

  return (
    <div className="leaflet-top leaflet-left">
      <div className="leaflet-control weather-leaflet-control ml-4 mt-4">
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            if (!weatherEnabled) {
              setWeatherEnabled(true);
              setWeatherPanelOpen(true);
            } else {
              setWeatherPanelOpen((prev) => !prev);
            }
          }}
          className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-black/70 px-3 py-2.5 text-sm font-medium text-white shadow-2xl shadow-black/50 backdrop-blur-md transition hover:border-sky-400/50"
        >
          <Layers className="h-4 w-4 text-sky-400" />
          <span>{weatherEnabled ? activeWeatherLayer.label : 'Weather'}</span>
        </button>

        {weatherEnabled && weatherPanelOpen && (
          <div className="mt-3 flex max-h-[calc(100vh-180px)] w-[200px] flex-col gap-3 overflow-y-auto rounded-2xl border border-zinc-800 bg-black/70 p-4 shadow-2xl shadow-black/50 backdrop-blur-md sm:w-[230px]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Weather Layers
                </h2>
                <p className="mt-1 text-[11px] leading-4 text-zinc-400">
                  Select a layer to overlay on the map.
                </p>
              </div>

              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setWeatherPanelOpen(false);
                }}
                aria-label="Hide weather panel"
                className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {weatherLayers.map((layer) => {
                const Icon = layer.icon;
                const isActive = activeWeatherLayer.id === layer.id;

                return (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleWeatherLayerChange(layer);
                    }}
                    className={[
                      'group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-300',
                      isActive
                        ? 'border-sky-400/70 bg-sky-400/15 shadow-[0_0_24px_rgba(56,189,248,0.12)]'
                        : 'border-zinc-800 bg-zinc-950/70 hover:border-sky-400/40 hover:bg-sky-400/5',
                    ].join(' ')}
                  >
                    <div
                      className={[
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-all duration-300',
                        isActive
                          ? 'border-sky-400/60 bg-sky-400/15 text-sky-400'
                          : 'border-zinc-800 bg-black text-zinc-500 group-hover:text-sky-400',
                      ].join(' ')}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div>
                      <span
                        className={[
                          'block text-sm font-medium transition-colors duration-300',
                          isActive ? 'text-white' : 'text-zinc-200',
                        ].join(' ')}
                      >
                        {layer.label}
                      </span>

                      <span className="block text-[10px] leading-3 text-zinc-500">
                        {layer.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
              <div className="mb-3 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-sky-400" />
                <h3 className="text-xs font-semibold text-white">
                  Overlay Opacity
                </h3>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weatherOpacity}
                onChange={(event) =>
                  setWeatherOpacity(Number(event.target.value))
                }
                className="w-full accent-sky-400"
              />

              <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
                <span>Min</span>
                <span className="rounded-full bg-sky-400/20 px-2 py-0.5 text-sky-300">
                  {Math.round(weatherOpacity * 100)}%
                </span>
                <span>Max</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdvisoryLayer() {
  const map = useMap();
  const requestRef = useRef<AbortController | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [showSigmets, setShowSigmets] = useState(true);
  const [showAirmets, setShowAirmets] = useState(true);
  const [data, setData] = useState<AdvisoryCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAdvisories = useCallback(async () => {
    if (!enabled) return;

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const bounds = map.getBounds();
      const longitudeSpan = bounds.getEast() - bounds.getWest();
      const west =
        longitudeSpan >= 360 ? -180 : normalizeLongitude(bounds.getWest());
      const east =
        longitudeSpan >= 360 ? 180 : normalizeLongitude(bounds.getEast());
      const bbox = [
        clamp(bounds.getSouth(), -90, 90),
        west,
        clamp(bounds.getNorth(), -90, 90),
        east,
      ]
        .map((value) => value.toFixed(3))
        .join(',');

      const response = await fetch(
        `/api/aviation-weather/advisories?bbox=${encodeURIComponent(bbox)}`,
        { signal: controller.signal }
      );
      const payload = (await response.json()) as
        | AdvisoryCollection
        | { message?: string };

      if (!response.ok) {
        throw new Error(
          'message' in payload && payload.message
            ? payload.message
            : 'Failed to load aviation advisories.'
        );
      }

      setData(payload as AdvisoryCollection);
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === 'AbortError') {
        return;
      }

      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load aviation advisories.'
      );
    } finally {
      if (requestRef.current === controller) {
        setLoading(false);
      }
    }
  }, [enabled, map]);

  useEffect(() => {
    if (!enabled) return;

    void loadAdvisories();
    map.on('moveend', loadAdvisories);
    const refreshTimer = window.setInterval(loadAdvisories, 5 * 60 * 1_000);

    return () => {
      map.off('moveend', loadAdvisories);
      window.clearInterval(refreshTimer);
      requestRef.current?.abort();
    };
  }, [enabled, loadAdvisories, map]);

  useEffect(() => {
    const controlContainer = document.querySelector(
      '.advisory-leaflet-control'
    ) as HTMLElement | null;

    if (!controlContainer) return;
    L.DomEvent.disableClickPropagation(controlContainer);
    L.DomEvent.disableScrollPropagation(controlContainer);
  }, [enabled, panelOpen, map]);

  const visibleData = useMemo<AdvisoryCollection | null>(() => {
    if (!data) return null;

    return {
      ...data,
      features: data.features.filter((feature) => {
        if (feature.properties.advisoryKind === 'SIGMET') return showSigmets;
        return showAirmets;
      }),
    };
  }, [data, showAirmets, showSigmets]);

  const sigmetCount =
    data?.features.filter(
      (feature) => feature.properties.advisoryKind === 'SIGMET'
    ).length ?? 0;
  const airmetCount =
    data?.features.filter(
      (feature) => feature.properties.advisoryKind === 'AIRMET'
    ).length ?? 0;
  const unavailableSources = data?.meta?.unavailableSources ?? [];

  return (
    <>
      {enabled && visibleData && visibleData.features.length > 0 && (
        <GeoJSON
          key={`${data?.meta?.fetchedAt ?? 'advisories'}-${showSigmets}-${showAirmets}`}
          data={visibleData}
          style={advisoryStyle}
          onEachFeature={bindAdvisoryPopup}
        />
      )}

      <div className="leaflet-top leaflet-left" style={{ top: 58 }}>
        <div className="leaflet-control advisory-leaflet-control ml-4 mt-4">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              if (!enabled) {
                setEnabled(true);
                setPanelOpen(true);
              } else {
                setPanelOpen((current) => !current);
              }
            }}
            className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-black/70 px-3 py-2.5 text-sm font-medium text-white shadow-2xl shadow-black/50 backdrop-blur-md transition hover:border-red-400/50"
          >
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <span>Advisories</span>
            {enabled && (
              <span className="rounded-full bg-red-400/15 px-1.5 py-0.5 text-[10px] text-red-300">
                {visibleData?.features.length ?? 0}
              </span>
            )}
          </button>

          {enabled && panelOpen && (
            <div className="mt-3 w-[235px] rounded-2xl border border-zinc-800 bg-black/75 p-4 text-white shadow-2xl shadow-black/50 backdrop-blur-md sm:w-[260px]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold">AIRMET / SIGMET</h2>
                  <p className="mt-1 text-[11px] leading-4 text-zinc-400">
                    Active advisories in the visible map area.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  aria-label="Hide advisory panel"
                  className="-mr-1 -mt-1 rounded-md p-1 text-zinc-400 transition-colors hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <AdvisoryToggle
                  checked={showSigmets}
                  color="bg-red-500"
                  count={sigmetCount}
                  description="Significant hazards to aircraft"
                  label="SIGMET"
                  onChange={setShowSigmets}
                />
                <AdvisoryToggle
                  checked={showAirmets}
                  color="bg-amber-400"
                  count={airmetCount}
                  description="G-AIRMET and Alaska AIRMET"
                  label="AIRMET"
                  onChange={setShowAirmets}
                />
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3">
                <div className="text-[10px] leading-4 text-zinc-500">
                  <div>Source: AWC / NWS</div>
                  {data?.meta?.fetchedAt && (
                    <div>Updated {formatUtcTime(data.meta.fetchedAt)}</div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => void loadAdvisories()}
                  disabled={loading}
                  aria-label="Refresh aviation advisories"
                  className="rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-zinc-300 transition hover:border-sky-400/50 hover:text-sky-300 disabled:cursor-wait disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
                  />
                </button>
              </div>

              {loading && !data && (
                <p className="mt-3 text-xs text-zinc-400">
                  Loading active advisories…
                </p>
              )}

              {error && (
                <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-[11px] leading-4 text-red-300">
                  {error}
                </p>
              )}

              {!loading && !error && visibleData?.features.length === 0 && (
                <p className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/70 p-2 text-[11px] leading-4 text-zinc-400">
                  No selected advisories intersect this view.
                </p>
              )}

              {unavailableSources.length > 0 && (
                <p className="mt-3 text-[10px] leading-4 text-amber-300">
                  Temporarily unavailable: {unavailableSources.join(', ')}
                </p>
              )}

              <p className="mt-3 text-[10px] leading-4 text-zinc-500">
                Situational awareness only. Verify against an official flight
                briefing before operational use.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function AdvisoryToggle({
  checked,
  color,
  count,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  color: string;
  count: number;
  description: string;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-sky-400"
      />
      <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${color}`} />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-zinc-100">{label}</span>
        <span className="block truncate text-[10px] text-zinc-500">
          {description}
        </span>
      </span>
      <span className="text-xs tabular-nums text-zinc-400">{count}</span>
    </label>
  );
}

function advisoryStyle(feature?: Feature<Geometry, AdvisoryProperties>) {
  const properties = feature?.properties;
  const hazard = properties?.hazard.toUpperCase() ?? '';
  let color = properties?.advisoryKind === 'SIGMET' ? '#ef4444' : '#f59e0b';

  if (hazard.includes('CONVECTIVE') || hazard.includes('TS')) color = '#e11d48';
  if (hazard.includes('ICE')) color = '#38bdf8';
  if (hazard.includes('TURB')) color = '#f97316';
  if (hazard.includes('IFR') || hazard.includes('MTN')) color = '#a78bfa';
  if (hazard.includes('ASH') || hazard.includes('VA')) color = '#71717a';

  return {
    color,
    fillColor: color,
    fillOpacity: properties?.advisoryKind === 'SIGMET' ? 0.24 : 0.17,
    opacity: 0.9,
    weight: properties?.advisoryKind === 'SIGMET' ? 2.5 : 2,
    dashArray: properties?.advisoryKind === 'AIRMET' ? '6 5' : undefined,
  };
}

function bindAdvisoryPopup(
  feature: Feature<Geometry, AdvisoryProperties>,
  layer: L.Layer
) {
  const advisory = feature.properties;
  const altitude = formatAltitudeRange(
    advisory.altitudeLow,
    advisory.altitudeHigh
  );
  const rawText = advisory.rawText
    ? advisory.rawText.slice(0, 1_500)
    : null;

  layer.bindPopup(
    `<div style="min-width:240px;max-width:360px;color:#18181b">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px">
        <strong>${escapeHtml(advisory.advisoryKind)} · ${escapeHtml(advisory.hazard)}</strong>
        ${advisory.qualifier ? `<span style="font-size:11px;font-weight:600">${escapeHtml(advisory.qualifier)}</span>` : ''}
      </div>
      <div style="font-size:12px;line-height:1.55">
        ${popupRow('Product', advisory.product)}
        ${popupRow('Valid', formatValidity(advisory.validFrom, advisory.validTo))}
        ${popupRow('Altitude', altitude)}
        ${popupRow('Movement', advisory.movement)}
        ${popupRow('FIR / Area', advisory.firName)}
        ${popupRow('Issued by', advisory.issuingOffice)}
      </div>
      ${
        rawText
          ? `<details style="margin-top:10px;border-top:1px solid #e4e4e7;padding-top:8px">
              <summary style="cursor:pointer;font-size:12px;font-weight:600">Raw bulletin</summary>
              <pre style="margin-top:7px;max-height:180px;overflow:auto;white-space:pre-wrap;font:10px/1.45 ui-monospace,monospace">${escapeHtml(rawText)}</pre>
            </details>`
          : ''
      }
    </div>`,
    { maxWidth: 380 }
  );
}

function popupRow(label: string, value: string | null) {
  if (!value) return '';
  return `<div style="display:grid;grid-template-columns:76px 1fr;gap:8px"><span style="color:#71717a">${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>`;
}

function formatValidity(validFrom: string | null, validTo: string | null) {
  if (!validFrom && !validTo) return null;
  if (validFrom && validTo) {
    return `${formatUtcDateTime(validFrom)} – ${formatUtcDateTime(validTo)}`;
  }
  return formatUtcDateTime(validFrom ?? validTo!);
}

function formatAltitudeRange(low: string | null, high: string | null) {
  if (low && high) return low === high ? high : `${low} – ${high}`;
  if (high) return `Up to ${high}`;
  if (low) return `Above ${low}`;
  return null;
}

function formatUtcDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(date);
}

function formatUtcTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'recently';
  return `${date.toISOString().slice(11, 16)} UTC`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return entities[character];
  });
}

function normalizeLongitude(longitude: number) {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

const createPlaneIcon = (
  heading: number = 0,
  isOnGround: boolean = false,
  isSelected: boolean = false
) => {
  const rotation = heading;

  const bgColor = isSelected
    ? '#f59e0b'
    : isOnGround
      ? '#6b7280'
      : '#3b82f6';

  const iconHtml = `
    <div style="
      position: relative;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: relative;
        z-index: 10;
        transform: rotate(${rotation}deg);
        transform-origin: center;
        transition: transform 300ms ease-in-out;
      ">
        <div style="
          padding: 6px;
          border-radius: 50%;
          background: ${bgColor};
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20" height="20">
            <path d="M21,16L21,14L13,9L13,3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z" />
          </svg>
        </div>
      </div>

      ${
        !isOnGround && !isSelected
          ? `
        <div class="plane-ping"></div>
        <style>
          .plane-ping {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 32px;
            height: 32px;
            margin-left: -16px;
            margin-top: -16px;
            border-radius: 50%;
            background: #60a5fa;
            animation: plane-ping-anim 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            opacity: 0.5;
            pointer-events: none;
          }

          @keyframes plane-ping-anim {
            75%, 100% {
              transform: scale(2.5);
              opacity: 0;
            }
          }
        </style>
      `
          : ''
      }

      ${
        isSelected
          ? `
        <div class="selected-ring"></div>
        <style>
          .selected-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 40px;
            height: 40px;
            margin-left: -20px;
            margin-top: -20px;
            border-radius: 50%;
            border: 3px solid #f59e0b;
            animation: selected-pulse 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            pointer-events: none;
          }

          @keyframes selected-pulse {
            0% {
              transform: scale(0.8);
              opacity: 1;
            }

            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
        </style>
      `
          : ''
      }
    </div>
  `;

  return divIcon({
    html: iconHtml,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    className: 'custom-marker',
  });
};

export default function FlightMap({
  flights,
  selectedFlight,
  onFlightSelect,
  tracks = [],
  tracksLoading = false,
  height = '500px',
}: FlightMapProps) {
  const defaultWeatherLayer =
    weatherLayers.find((layer) => layer.id === 'wind_new') ?? weatherLayers[0];

  const [weatherEnabled, setWeatherEnabled] = useState(false);
  const [weatherPanelOpen, setWeatherPanelOpen] = useState(false);
  const [activeWeatherLayer, setActiveWeatherLayer] =
    useState<WeatherLayer>(defaultWeatherLayer);
  const [weatherOpacity, setWeatherOpacity] = useState<number>(
    defaultWeatherLayer.opacity
  );

  useEffect(() => {
    console.log(
      `[FlightMap] tracks for ${selectedFlight?.fr24_id}: ${tracks.length} points`
    );
  }, [tracks, selectedFlight]);

  function handleWeatherLayerChange(layer: WeatherLayer) {
    setActiveWeatherLayer(layer);
    setWeatherOpacity(layer.opacity);
    setWeatherEnabled(true);
  }

  const validFlights = flights.filter((flight) =>
    isValidLatLon(flight.lat, flight.lon)
  );

  const displayTrackPoints = useMemo(() => {
    if (!tracks.length) return [];

    const validTrackPoints = tracks.filter(isValidTrackPoint);

    if (selectedFlight?.lat != null && selectedFlight?.lon != null) {
      const lastPoint = validTrackPoints[validTrackPoints.length - 1];

      if (!lastPoint) return validTrackPoints;

      const livePoint: TrackPoint = {
        timestamp: selectedFlight.timestamp ?? new Date().toISOString(),
        lat: selectedFlight.lat,
        lon: selectedFlight.lon,
        alt: selectedFlight.alt,
        gspeed: selectedFlight.gspeed,
        vspeed: selectedFlight.vspeed,
        track: selectedFlight.track,
        source: selectedFlight.source ?? lastPoint.source,
        callsign: selectedFlight.callsign,
      };

      const latDiff = Math.abs(lastPoint.lat - livePoint.lat);
      const lonDiff = Math.abs(lastPoint.lon - livePoint.lon);

      if (latDiff > 0.01 || lonDiff > 0.01) {
        return [...validTrackPoints, livePoint];
      }
    }

    return validTrackPoints;
  }, [tracks, selectedFlight]);

  const trackSegments = useMemo<TrackSegment[]>(() => {
    if (displayTrackPoints.length < 2) return [];

    const segments: TrackSegment[] = [];

    for (let i = 1; i < displayTrackPoints.length; i++) {
      const previousPoint = displayTrackPoints[i - 1];
      const currentPoint = displayTrackPoints[i];

      const source = normalizeTrackSource(
        currentPoint.source ?? previousPoint.source
      );

      const previousPosition: [number, number] = [
        previousPoint.lat,
        previousPoint.lon,
      ];

      const currentPosition: [number, number] = [
        currentPoint.lat,
        currentPoint.lon,
      ];

      const lastSegment = segments[segments.length - 1];

      if (lastSegment && lastSegment.source === source) {
        lastSegment.positions.push(currentPosition);
      } else {
        segments.push({
          source,
          positions: [previousPosition, currentPosition],
        });
      }
    }

    return segments;
  }, [displayTrackPoints]);

  const activeTrackSources = useMemo(() => {
    return Array.from(new Set(trackSegments.map((segment) => segment.source)));
  }, [trackSegments]);

  if (validFlights.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-slate-300 bg-slate-50"
        style={{ height }}
      >
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
            <Plane className="h-8 w-8 rotate-45 text-slate-400" />
          </div>

          <h3 className="mb-2 text-lg font-medium text-slate-600">
            No Flight Position Data
          </h3>

          <p className="text-sm text-slate-500">
            {flights.length === 0
              ? 'No flights found to display on the map.'
              : `${flights.length} flights found, but none have valid position data.`}
          </p>
        </div>
      </div>
    );
  }

  let center: [number, number];

  if (isValidLatLon(selectedFlight?.lat, selectedFlight?.lon)) {
    center = [selectedFlight!.lat!, selectedFlight!.lon!];
  } else {
    const avgLat =
      validFlights.reduce((sum, flight) => sum + flight.lat!, 0) /
      validFlights.length;

    const avgLon =
      validFlights.reduce((sum, flight) => sum + flight.lon!, 0) /
      validFlights.length;

    center = [avgLat, avgLon];
  }

  const getZoomLevel = () => {
    if (selectedFlight) return 8;
    if (validFlights.length === 1) return 6;

    const lats = validFlights.map((flight) => flight.lat!);
    const lons = validFlights.map((flight) => flight.lon!);

    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lonSpread = Math.max(...lons) - Math.min(...lons);

    if (latSpread > 20 || lonSpread > 40) return 3;
    if (latSpread > 10 || lonSpread > 20) return 4;
    if (latSpread > 5 || lonSpread > 10) return 5;
    if (latSpread > 2 || lonSpread > 5) return 6;

    return 7;
  };

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-slate-300 shadow-sm"
      style={{ height }}
    >
      {tracksLoading && (
        <div className="pointer-events-none absolute right-4 top-4 z-[1000] flex items-center gap-2 rounded-md bg-white/90 px-3 py-2 text-sm shadow-md">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span>Loading flight path...</span>
        </div>
      )}

      {activeTrackSources.length > 0 && (
        <div className="pointer-events-none absolute bottom-4 right-4 z-[1000] rounded-xl border border-zinc-800 bg-black/40 px-3 py-3 text-white shadow-2xl shadow-black/40 backdrop-blur-md">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Track Source
          </div>

          <div className="space-y-1.5">
            {activeTrackSources.map((source) => {
              const style = TRACK_SOURCE_STYLES[source];

              return (
                <div key={source} className="flex items-center gap-2 text-xs">
                  <span
                    className="inline-block h-2.5 w-6 rounded-full"
                    style={{
                      backgroundColor: style.color,
                    }}
                  />
                  <span className="text-zinc-200">{style.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={getZoomLevel()}
        className="h-full w-full"
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />

        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          zIndex={100}
        />

        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          opacity={0.2}
          zIndex={150}
        />

        {weatherEnabled && (
          <TileLayer
            key={`${activeWeatherLayer.id}-${weatherOpacity}`}
            url={`/api/openweather/weather-map/${activeWeatherLayer.id}/{z}/{x}/{y}`}
            opacity={weatherOpacity}
            zIndex={250}
          />
        )}

        <WeatherControl
          weatherEnabled={weatherEnabled}
          weatherPanelOpen={weatherPanelOpen}
          activeWeatherLayer={activeWeatherLayer}
          weatherOpacity={weatherOpacity}
          setWeatherEnabled={setWeatherEnabled}
          setWeatherPanelOpen={setWeatherPanelOpen}
          setWeatherOpacity={setWeatherOpacity}
          handleWeatherLayerChange={handleWeatherLayerChange}
        />

        <AdvisoryLayer />

        <MapController flight={selectedFlight} />

        {tracks.length > 0 && (
          <FitBoundsToTracks
            tracks={tracks}
            selectedFlightId={selectedFlight?.fr24_id}
          />
        )}

        {trackSegments.map((segment, index) => {
          const style = TRACK_SOURCE_STYLES[segment.source];

          return (
            <Polyline
              key={`track-${selectedFlight?.fr24_id}-${index}-${segment.source}-${segment.positions.length}`}
              pathOptions={{
                color: style.color,
                weight: 4,
                opacity: 0.95,
                dashArray: style.dashArray,
              }}
              positions={segment.positions}
            />
          );
        })}

        {validFlights.map((flight, index) => {
          const isSelected = selectedFlight?.fr24_id === flight.fr24_id;
          const heading = flight.track ?? 0;
          const isOnGround = flight.on_ground ?? false;

          return (
            <Marker
              key={flight.fr24_id || `flight-${index}`}
              position={[flight.lat!, flight.lon!]}
              icon={createPlaneIcon(heading, isOnGround, isSelected)}
              zIndexOffset={isSelected ? 1000 : 500}
              eventHandlers={{
                click: () => onFlightSelect?.(flight),
              }}
            >
              <Popup>
                <div className="min-w-[200px] space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">
                      {flight.flight ||
                        flight.callsign?.trim() ||
                        'Unknown Flight'}
                    </h3>

                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        isOnGround
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {isOnGround ? 'On Ground' : 'In Air'}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Altitude:</span>
                      <span className="font-medium">
                        {flight.alt
                          ? `${Math.round(flight.alt).toLocaleString()} ft`
                          : 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-600">Speed:</span>
                      <span className="font-medium">
                        {flight.gspeed != null
                          ? `${Math.round(flight.gspeed)} kts`
                          : 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-600">Heading:</span>
                      <span className="font-medium">
                        {Math.round(heading)}°
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-600">Source:</span>
                      <span className="font-medium">
                        {flight.source || 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-600">Flight ID:</span>
                      <span className="font-mono font-medium">
                        {flight.fr24_id || 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-600">Registration:</span>
                      <span className="font-medium">{flight.reg || 'N/A'}</span>
                    </div>
                  </div>

                  {(flight.orig_iata || flight.dest_iata) && (
                    <div className="border-t border-slate-200 pt-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-center">
                          <div className="font-bold text-blue-600">
                            {flight.orig_iata || '—'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {flight.orig_icao || ''}
                          </div>
                        </div>

                        <Navigation className="mx-2 h-4 w-4 text-slate-400" />

                        <div className="text-center">
                          <div className="font-bold text-green-600">
                            {flight.dest_iata || '—'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {flight.dest_icao || ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-2">
                    <div className="text-xs text-slate-500">
                      Coordinates: {flight.lat!.toFixed(4)},{' '}
                      {flight.lon!.toFixed(4)}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
