// app/api/flightData/route.ts

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type SearchType = 'flights' | 'callsigns' | 'registrations' | 'airlines';

const FR24_URL = 'https://fr24api.flightradar24.com/api/flight-summary/full';

const SEARCH_PARAM_MAP: Record<SearchType, string> = {
  flights: 'flights',
  callsigns: 'callsigns',
  registrations: 'registrations',
  airlines: 'operating_as',
};

function isSearchType(value: string | null): value is SearchType {
  return value === 'flights'
    || value === 'callsigns'
    || value === 'registrations'
    || value === 'airlines';
}

function toFr24Date(date: Date) {
  return date.toISOString().slice(0, 19);
}

function hasBasicFlightInfo(flight: any) {
  return Boolean(
    flight?.flight
    && flight?.reg
    && (flight?.orig_iata || flight?.dest_iata)
  );
}

async function fetchFlightRadar(params: URLSearchParams, apiKey: string) {
  const response = await fetch(`${FR24_URL}?${params.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Accept-Version': 'v1',
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  const raw = await response.text();

  let json: any = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: json?.message || json?.error || `FlightRadar24 API error: ${response.status}`,
    };
  }

  return {
    ok: true,
    status: response.status,
    data: json,
  };
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.FLIGHT_RADAR_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'FlightRadar24 API key is not configured on the server.' },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query')?.trim() || '';
  const requestedSearchType = searchParams.get('searchType');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required.' },
      { status: 400 }
    );
  }

  const searchType: SearchType = isSearchType(requestedSearchType)
    ? requestedSearchType
    : 'flights';

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const dateFrom = toFr24Date(sevenDaysAgo);
  const dateTo = toFr24Date(now);

  const baseParams = new URLSearchParams({
    flight_datetime_from: dateFrom,
    flight_datetime_to: dateTo,
    limit: '20',
    sort: 'desc',
  });

  baseParams.append(SEARCH_PARAM_MAP[searchType], query.toUpperCase());

  try {
    const primaryResult = await fetchFlightRadar(baseParams, apiKey);

    if (!primaryResult.ok) {
      return NextResponse.json(
        { error: primaryResult.error },
        { status: primaryResult.status }
      );
    }

    if (!primaryResult.data?.data || !Array.isArray(primaryResult.data.data)) {
      return NextResponse.json(
        {
          error: 'Invalid FlightRadar24 API response format.',
          data: primaryResult.data,
        },
        { status: 502 }
      );
    }

    const validFlights = primaryResult.data.data.filter(hasBasicFlightInfo);

    if (validFlights.length > 0) {
      return NextResponse.json({
        data: validFlights,
        searchUsed: searchType,
      });
    }

    const fallbackStrategies = [
      { searchStrategy: 'airports', param: 'airports' },
      { searchStrategy: 'routes', param: 'routes' },
    ] as const;

    for (const strategy of fallbackStrategies) {
      const fallbackParams = new URLSearchParams({
        flight_datetime_from: dateFrom,
        flight_datetime_to: dateTo,
        limit: '10',
        sort: 'desc',
      });

      fallbackParams.append(strategy.param, query.toUpperCase());

      const fallbackResult = await fetchFlightRadar(fallbackParams, apiKey);

      if (!fallbackResult.ok) {
        continue;
      }

      const fallbackFlights = fallbackResult.data?.data;

      if (Array.isArray(fallbackFlights)) {
        const filtered = fallbackFlights.filter((flight: any) => (
          flight?.flight && flight?.reg
        ));

        if (filtered.length > 0) {
          return NextResponse.json({
            data: filtered,
            searchStrategy: strategy.searchStrategy,
          });
        }
      }
    }

    return NextResponse.json({
      data: [],
      searchUsed: searchType,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error while fetching flight data.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}