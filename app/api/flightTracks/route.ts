// app/api/flight-tracks/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://fr24api.flightradar24.com';
const API_TOKEN = process.env.FLIGHT_RADAR_API_KEY;

export async function GET(request: NextRequest) {
  try {
    if (!API_TOKEN) {
      return NextResponse.json(
        { error: 'Flight Radar API token not configured' },
        { status: 500 }
      );
    }

    const flightId = request.nextUrl.searchParams.get('flight_id');
    if (!flightId) {
      return NextResponse.json(
        { error: 'flight_id query parameter is required' },
        { status: 400 }
      );
    }

    const url = `${API_BASE_URL}/api/flight-tracks?flight_id=${flightId}`;
    console.log('[FlightTracks] Fetching from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Accept-Version': 'v1',
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('[FlightTracks] API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch flight tracks: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // The API returns an array with a single object containing fr24_id and tracks
    // We need to extract just the tracks array
    let tracks = [];
    if (Array.isArray(data) && data.length > 0 && data[0].tracks) {
      tracks = data[0].tracks;
      console.log('[FlightTracks] Extracted tracks:', tracks.length);
    } else if (data.tracks) {
      // Fallback if API changes format
      tracks = data.tracks;
    }
    
    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('[FlightTracks] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch flight tracks' },
      { status: 500 }
    );
  }
}
