// app/api/fr24/tracks/route.ts

import { NextRequest, NextResponse } from 'next/server';

const FR24_API_BASE_URL = 'https://fr24api.flightradar24.com';
const REQUEST_TIMEOUT_MS = 20000;

export const dynamic = 'force-dynamic';

function getApiToken() {
  const token = process.env.FLIGHT_RADAR_API_KEY;

  if (!token) {
    throw new Error('Flight Radar API token not configured on server.');
  }

  return token;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: 'no-store',
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseResponse(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiToken = getApiToken();

    const flightId = request.nextUrl.searchParams.get('flight_id')?.trim();

    if (!flightId) {
      return NextResponse.json(
        { error: 'flight_id query parameter is required.' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      flight_id: flightId,
    });

    const url = `${FR24_API_BASE_URL}/api/flight-tracks?${params.toString()}`;

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Accept-Version': 'v1',
        Authorization: `Bearer ${apiToken}`,
      },
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.error ||
            data?.message ||
            `FlightRadar24 tracks request failed: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const tracks =
      Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.tracks)
          ? data.tracks
          : [];

    return NextResponse.json({
      tracks,
      total: tracks.length,
    });
  } catch (error) {
    const isAbortError = error instanceof Error && error.name === 'AbortError';

    return NextResponse.json(
      {
        error: isAbortError
          ? 'FlightRadar24 tracks request timed out.'
          : error instanceof Error
            ? error.message
            : 'Failed to fetch flight tracks.',
      },
      { status: isAbortError ? 504 : 500 }
    );
  }
}