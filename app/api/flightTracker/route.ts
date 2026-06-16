import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://fr24api.flightradar24.com';
const API_TOKEN = process.env.FLIGHT_RADAR_API_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!API_TOKEN) {
      return NextResponse.json(
        { error: 'Flight Radar API token not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Build query parameters
    const params = new URLSearchParams();

    if (body.flights) {
      params.append('flights', body.flights);
    }
    if (body.airports) {
      params.append('airports', body.airports);
    }
    if (body.operating_as) {
      params.append('operating_as', body.operating_as);
    }

    // Add limit for reasonable response size
    params.append('limit', '500');

    const url = `${API_BASE_URL}/api/live/flight-positions/full?${params.toString()}`;

    console.log('[v0] Fetching flights from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Accept-Version': 'v1',
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('[v0] Flight Radar API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch flights: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[v0] Received flights:', data.data?.length || 0);

    return NextResponse.json({
      flights: data.data || [],
      total: data.data?.length || 0,
    });
  } catch (error) {
    console.error('[v0] Error fetching flights:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch flights',
      },
      { status: 500 }
    );
  }
}
