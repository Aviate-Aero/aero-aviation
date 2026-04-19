'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { divIcon, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plane, Navigation } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
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

function MapController({ flight }: { flight?: Flight | null }) {
  const map = useMap();

  useEffect(() => {
    if (flight?.lat != null && flight?.lon != null) {
      map.setView([flight.lat, flight.lon], 8, { animate: true });
    }
  }, [flight, map]);

  return null;
}

function FitBoundsToTracks({ tracks }: { tracks: TrackPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (tracks.length > 0) {
      const validPoints = tracks.filter(t => t.lat != null && t.lon != null);
      if (validPoints.length === 0) return;

      const bounds = new LatLngBounds(
        validPoints.map(t => [t.lat, t.lon] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [tracks, map]);

  return null;
}

const createPlaneIcon = (heading: number = 0, isOnGround: boolean = false, isSelected: boolean = false) => {
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

      ${!isOnGround && !isSelected ? `
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
            75%, 100% { transform: scale(2.5); opacity: 0; }
          }
        </style>
      ` : ''}

      ${isSelected ? `
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
            0% { transform: scale(0.8); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
        </style>
      ` : ''}
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
  height = '500px' 
}: FlightMapProps) {
  // Debug: log when tracks change
  useEffect(() => {
    console.log(`[FlightMap] tracks for ${selectedFlight?.fr24_id}: ${tracks.length} points`);
  }, [tracks, selectedFlight]);

  // Filter flights with valid coordinates
  const validFlights = flights.filter(
    flight => flight.lat != null && flight.lon != null && 
              Math.abs(flight.lat) <= 90 && 
              Math.abs(flight.lon) <= 180
  );

  // Build display track positions, optionally extending to the live aircraft position
  const displayTrackPositions = useMemo(() => {
    if (!tracks.length) return [];

    const trackPositions = tracks
      .filter(t => t.lat != null && t.lon != null)
      .map(t => [t.lat, t.lon] as [number, number]);

    // If we have a selected flight with live position, and the last track point is significantly different,
    // append the live position so the line reaches the plane icon.
    if (selectedFlight?.lat != null && selectedFlight?.lon != null) {
      const lastPos = trackPositions[trackPositions.length - 1];
      const livePos: [number, number] = [selectedFlight.lat, selectedFlight.lon];

      // If there's no last point, just use tracks (shouldn't happen because tracks.length>0)
      if (!lastPos) return trackPositions;

      // Check if live position is meaningfully different from last track point
      const latDiff = Math.abs(lastPos[0] - livePos[0]);
      const lonDiff = Math.abs(lastPos[1] - livePos[1]);
      // Threshold ~0.01° ≈ 1km – adjust as needed
      if (latDiff > 0.01 || lonDiff > 0.01) {
        return [...trackPositions, livePos];
      }
    }

    return trackPositions;
  }, [tracks, selectedFlight]);

  if (validFlights.length === 0) {
    return (
      <div 
        className="flex items-center justify-center rounded-lg border border-slate-300 bg-slate-50"
        style={{ height }}
      >
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center">
            <Plane className="w-8 h-8 text-slate-400 rotate-45" />
          </div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">No Flight Position Data</h3>
          <p className="text-slate-500 text-sm">
            {flights.length === 0 
              ? 'No flights found to display on the map.' 
              : `${flights.length} flights found, but none have valid position data.`}
          </p>
        </div>
      </div>
    );
  }

  // Calculate center point
  let center: [number, number];
  if (selectedFlight?.lat != null && selectedFlight?.lon != null) {
    center = [selectedFlight.lat, selectedFlight.lon];
  } else {
    const avgLat = validFlights.reduce((sum, f) => sum + f.lat!, 0) / validFlights.length;
    const avgLon = validFlights.reduce((sum, f) => sum + f.lon!, 0) / validFlights.length;
    center = [avgLat, avgLon];
  }

  const getZoomLevel = () => {
    if (selectedFlight) return 8;
    if (validFlights.length === 1) return 6;
    
    const lats = validFlights.map(f => f.lat!);
    const lons = validFlights.map(f => f.lon!);
    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lonSpread = Math.max(...lons) - Math.min(...lons);
    
    if (latSpread > 20 || lonSpread > 40) return 3;
    if (latSpread > 10 || lonSpread > 20) return 4;
    if (latSpread > 5 || lonSpread > 10) return 5;
    if (latSpread > 2 || lonSpread > 5) return 6;
    return 7;
  };

  return (
    <div className="rounded-lg overflow-hidden border border-slate-300 shadow-sm relative" style={{ height }}>
      {tracksLoading && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 px-3 py-2 rounded-md shadow-md text-sm flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading flight path...</span>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={getZoomLevel()}
        className="h-full w-full"
        scrollWheelZoom={true}
        // Optional: add a key to force remount when selected flight changes (if needed)
        // key={selectedFlight?.fr24_id}
      >
        <TileLayer
          attribution=''
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          opacity={0.2}
        />

        <MapController flight={selectedFlight} />
        <FitBoundsToTracks tracks={tracks} />

        {/* Flight track for selected flight – now using displayTrackPositions */}
        {displayTrackPositions.length > 0 && (
          <Polyline
            key={`track-${selectedFlight?.fr24_id}-${tracks.length}-${displayTrackPositions.length}`}
            pathOptions={{ color: '#f59e0b', weight: 3, opacity: 0.8 }}
            positions={displayTrackPositions}
          />
        )}

        {validFlights.map((flight, index) => {
          const isSelected = selectedFlight?.fr24_id === flight.fr24_id;
          const heading = flight.track ?? 0;
          const isOnGround = flight.on_ground ?? false;

          return (
            <Marker
              key={flight.fr24_id || `flight-${index}`}
              position={[flight.lat!, flight.lon!]}
              icon={createPlaneIcon(heading, isOnGround, isSelected)}
              eventHandlers={{
                click: () => onFlightSelect?.(flight),
              }}
            >
              <Popup>
                <div className="space-y-2 min-w-[200px]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">
                      {flight.flight || flight.callsign?.trim() || 'Unknown Flight'}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      isOnGround ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isOnGround ? 'On Ground' : 'In Air'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Altitude:</span>
                      <span className="font-medium">
                        {flight.alt ? `${Math.round(flight.alt).toLocaleString()} ft` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Speed:</span>
                      <span className="font-medium">
                        {flight.gspeed != null ? `${Math.round(flight.gspeed)} kts` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Heading:</span>
                      <span className="font-medium">{Math.round(heading)}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Flight ID:</span>
                      <span className="font-medium font-mono">{flight.fr24_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Registration:</span>
                      <span className="font-medium">{flight.reg || 'N/A'}</span>
                    </div>
                  </div>

                  {(flight.orig_iata || flight.dest_iata) && (
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-center">
                          <div className="font-bold text-blue-600">{flight.orig_iata || '—'}</div>
                          <div className="text-xs text-slate-500">{flight.orig_icao || ''}</div>
                        </div>
                        <Navigation className="w-4 h-4 text-slate-400 mx-2" />
                        <div className="text-center">
                          <div className="font-bold text-green-600">{flight.dest_iata || '—'}</div>
                          <div className="text-xs text-slate-500">{flight.dest_icao || ''}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-xs text-slate-500">
                      Coordinates: {flight.lat!.toFixed(4)}, {flight.lon!.toFixed(4)}
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