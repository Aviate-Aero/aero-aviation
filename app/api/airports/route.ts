import { NextRequest, NextResponse } from 'next/server';

const FLIGHT_RADAR_API_URL = 'https://fr24api.flightradar24.com/api/static';
const API_TOKEN = process.env.FLIGHT_RADAR_API_KEY;

// Cache for storing airport data (in-memory cache)
const airportCache = new Map<string, { data: any; timestamp: number }>();
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

    // Try to fetch from Flight Radar API
    // Note: The API endpoint uses IATA codes in the URL (based on your example)
    const airportData = await fetchAirportFromFlightRadar(searchTerm);

    if (!airportData) {
      // If not found with IATA, try searching by name or city if needed
      // (This would require a different endpoint if available)
      return NextResponse.json(
        { 
          error: `Airport "${query}" not found.`,
          suggestion: 'Please use a valid 3-letter IATA airport code (e.g., LAX, LHR, WAW).'
        },
        { status: 404 }
      );
    }

    // Cache the result
    airportCache.set(searchTerm, {
      data: airportData,
      timestamp: Date.now()
    });

    // Transform API response to your expected format
    const transformedAirport = transformAirportData(airportData);
    return NextResponse.json(transformedAirport);

  } catch (error) {
    console.error('[API] Error fetching airport info:', error);
    
    // Provide more specific error messages based on the error
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

async function fetchAirportFromFlightRadar(iataCode: string): Promise<any> {
  try {
    // Clean the IATA code (remove any non-alphabet characters)
    const cleanCode = iataCode.replace(/[^A-Z]/g, '');
    
    if (cleanCode.length !== 3) {
      throw new Error('Invalid IATA code length. Must be 3 letters.');
    }

    const url = `${FLIGHT_RADAR_API_URL}/airports/${cleanCode}/light`;
    
    console.log(`[API] Fetching from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Version': 'v1',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[API] Airport ${cleanCode} not found (404)`);
        return null;
      }
      
      // Try to get error details from response
      let errorDetail = `Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail += ` - ${JSON.stringify(errorData)}`;
      } catch {
        // Ignore if response is not JSON
      }
      
      throw new Error(`Flight Radar API error: ${errorDetail}`);
    }

    const data = await response.json();
    console.log(`[API] Successfully fetched ${cleanCode}:`, 
      Object.keys(data).length > 0 ? 'Data received' : 'Empty response');
    
    return data;

  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      console.error(`[API] Timeout fetching airport ${iataCode}`);
      throw new Error('Request timeout. Please try again.');
    }
    console.error(`[API] Error fetching airport ${iataCode}:`, error);
    throw error;
  }
}

function transformAirportData(apiData: any) {
  // Based on Flight Radar API response structure
  // You'll need to adjust this based on the actual response structure
  
  // Example transformation - adjust fields based on actual API response
  return {
    iata: apiData.iata || apiData.code || '',
    icao: apiData.icao || '',
    name: apiData.name || '',
    city: apiData.city || apiData.location?.city || '',
    country: apiData.country || apiData.location?.country || '',
    latitude: apiData.latitude || apiData.lat || apiData.location?.lat || 0,
    longitude: apiData.longitude || apiData.lon || apiData.location?.lon || 0,
    timezone: apiData.timezone || apiData.time_zone || '',
    altitude: apiData.altitude || apiData.elevation || apiData.elevation_ft || 0,
    runways: apiData.runways || apiData.runway_count || 0,
    majorcities: apiData.city || apiData.served_city || '',
    // Additional fields that might be useful
    website: apiData.website || '',
    phone: apiData.phone || '',
    email: apiData.email || '',
    // Flight status information
    arrivals_url: apiData.arrivals_url || '',
    departures_url: apiData.departures_url || '',
  };
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