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
    
    // Validate required parameters
    if (!body.flight_ids) {
      return NextResponse.json(
        { error: 'flight_ids parameter is required' },
        { status: 400 }
      );
    }

    // Build query parameters
    const params = new URLSearchParams();
    
    params.append('flight_ids', body.flight_ids);
    
    if (body.event_types) {
      params.append('event_types', body.event_types);
    } else {
      params.append('event_types', 'all');
    }

    const url = `${API_BASE_URL}/api/historic/flight-events/full?${params.toString()}`;

    console.log('[Historic] Fetching flight events from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Accept-Version': 'v1',
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('[Historic] Flight Radar API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch historic data: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data.data || [],
    });
    
  } catch (error) {
    console.error('[Historic] Error fetching flight events:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch historic flight data',
      },
      { status: 500 }
    );
  }
}