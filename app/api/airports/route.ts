import { NextRequest, NextResponse } from 'next/server';

const FLIGHT_RADAR_API_URL = 'https://fr24api.flightradar24.com/api/static';
const API_TOKEN = process.env.FLIGHT_RADAR_API_KEY;

interface FlightRadarAirportRunway {
  designator?: string;
  heading?: number | string;
  length?: number | string;
  width?: number | string;
  elevation?: number | string;
  thr_coordinates?: unknown;
  surface?: {
    type?: string;
    description?: string;
  };
}

interface FlightRadarAirportFull {
  name?: string;
  iata?: string;
  icao?: string;
  lon?: number | string;
  lat?: number | string;
  elevation?: number | string;
  country?: {
    code?: string;
    name?: string;
  };
  city?: string;
  state?: string | null;
  timezone?: {
    name?: string;
    offset?: number | string;
  };
  runways?: FlightRadarAirportRunway[];
}

const airportCache = new Map<string, { data: FlightRadarAirportFull; timestamp: number }>();
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || '';

  if (!query.trim()) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  if (!API_TOKEN) {
    console.error('API is not configured');
    return NextResponse.json(
      { error: 'API configuration error' },
      { status: 500 }
    );
  }

  try {
    const searchTerm = query.toUpperCase().trim();
    
    // Check cache first
    const cached = airportCache.get(searchTerm);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`[API] Using cached data for ${searchTerm}`);
      const transformedAirport = transformAirportData(cached.data);
      return NextResponse.json(transformedAirport);
    }

    const airportData = await fetchAirportFromFlightRadar(searchTerm);

    if (!airportData) {
      return NextResponse.json(
        { 
          error: `Airport "${query}" not found.`,
          suggestion: 'Please use a valid IATA or ICAO airport code (e.g., LHR, DXB, EGLL, OMDB).'
        },
        { status: 404 }
      );
    }

    airportCache.set(searchTerm, {
      data: airportData,
      timestamp: Date.now()
    });

    const transformedAirport = transformAirportData(airportData);
    return NextResponse.json(transformedAirport);

  } catch (error) {
    console.error('[API] Error fetching airport info:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return NextResponse.json(
          { error: 'Invalid API token. Please check your Flight Radar API configuration.' },
          { status: 500 }
        );
      } else if (error.message.includes('429')) {
        return NextResponse.json(
          { error: 'API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch airport data from Flight Radar API' },
      { status: 500 }
    );
  }
}

async function fetchAirportFromFlightRadar(airportCode: string): Promise<FlightRadarAirportFull | null> {
  try {
    const cleanCode = airportCode.replace(/[^A-Z]/g, '');
    
    if (![3, 4].includes(cleanCode.length)) {
      throw new Error('Invalid airport code length. Must be a 3-letter IATA code or 4-letter ICAO code.');
    }

    const url = `${FLIGHT_RADAR_API_URL}/airports/${cleanCode}/full`;
    
    console.log(`[API] Fetching from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Version': 'v1',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[API] Airport ${cleanCode} not found (404)`);
        return null;
      }
      
      let errorDetail = `Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail += ` - ${JSON.stringify(errorData)}`;
      } catch {
        // Ignore if response is not JSON
      }
      
      throw new Error(`Flight Radar API error: ${errorDetail}`);
    }

    const data = await response.json() as FlightRadarAirportFull;
    console.log(`[API] Successfully fetched ${cleanCode}:`, 
      Object.keys(data).length > 0 ? 'Data received' : 'Empty response');
    
    return data;

  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      console.error(`[API] Timeout fetching airport ${airportCode}`);
      throw new Error('Request timeout. Please try again.');
    }
    console.error(`[API] Error fetching airport ${airportCode}:`, error);
    throw error;
  }
}

function transformAirportData(apiData: FlightRadarAirportFull) {
  const elevationFeet = toNumber(apiData.elevation);
  const timezoneOffsetSeconds = toNumber(apiData.timezone?.offset);

  return {
    iata: apiData.iata || '',
    icao: apiData.icao || '',
    name: apiData.name || '',
    city: apiData.city || '',
    state: apiData.state || '',
    country: apiData.country?.name || '',
    country_code: apiData.country?.code || '',
    latitude: toNumber(apiData.lat),
    longitude: toNumber(apiData.lon),
    timezone: apiData.timezone?.name || '',
    timezone_offset: timezoneOffsetSeconds,
    timezone_offset_hours: timezoneOffsetSeconds === undefined ? undefined : timezoneOffsetSeconds / 3600,
    elevation: elevationFeet,
    elevation_meters: elevationFeet === undefined ? undefined : Math.round(elevationFeet * 0.3048),
    runways: Array.isArray(apiData.runways)
      ? apiData.runways.map((runway) => ({
          designator: runway.designator || '',
          heading: toNumber(runway.heading),
          length: toNumber(runway.length),
          width: toNumber(runway.width),
          elevation: toNumber(runway.elevation),
          threshold_coordinates: isNumberArray(runway.thr_coordinates)
            ? runway.thr_coordinates
            : [],
          surface_type: runway.surface?.type || '',
          surface_description: runway.surface?.description || '',
        }))
      : [],
    raw: apiData,
  };
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'number' && Number.isFinite(item));
}

// Optional: Add endpoint for clearing cache (for development)
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  if (code) {
    airportCache.delete(code.toUpperCase());
    return NextResponse.json({ message: `Cache cleared for ${code}` });
  } else {
    airportCache.clear();
    return NextResponse.json({ message: 'All airport cache cleared' });
  }
}
