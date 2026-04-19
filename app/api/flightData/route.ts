import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || '';
  
  // Get search type from query params or default to 'flights'
  const searchType = searchParams.get('searchType') || 'flights';

  const apiKey = process.env.FLIGHT_RADAR_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Use Flight Summary Full endpoint
    const url = 'https://fr24api.flightradar24.com/api/flight-summary/full';
    
    // Set date range - use 7 days (within the 14-day max limit)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const dateFrom = sevenDaysAgo.toISOString().slice(0, 19); // Format: YYYY-MM-DDTHH:MM:SS
    const dateTo = now.toISOString().slice(0, 19);

    const params = new URLSearchParams();
    params.append('flight_datetime_from', dateFrom);
    params.append('flight_datetime_to', dateTo);
    params.append('limit', '20');
    params.append('sort', 'desc'); // Get most recent first

    // Add search parameter based on type
    if (searchType === 'callsigns') {
      params.append('callsigns', query.toUpperCase());
    } else if (searchType === 'registrations') {
      params.append('registrations', query.toUpperCase());
    } else if (searchType === 'airlines') {
      params.append('operating_as', query.toUpperCase());
    } else {
      // Default to flight numbers
      params.append('flights', query.toUpperCase());
    }

    const fullUrl = `${url}?${params.toString()}`;

    console.log('[API] Fetching from Flight Radar:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept-Version': 'v1',
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Prevent caching
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[API] Flight Radar API error:', response.status, errorData);
      
      // Try to parse error if it's JSON
      try {
        const jsonError = JSON.parse(errorData);
        return NextResponse.json(
          { error: jsonError.message || `Failed to fetch flights: ${response.status}` },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { error: `API Error: ${response.status}` },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    console.log('[API] Raw API response:', JSON.stringify(data, null, 2));

    // Check if data is in the expected format
    if (!data.data || !Array.isArray(data.data)) {
      return NextResponse.json(
        { error: 'Invalid API response format', data },
        { status: 500 }
      );
    }

    // Filter out flights without basic information
    const validFlights = data.data.filter((flight: any) => 
      flight.flight && flight.reg && (flight.orig_iata || flight.dest_iata)
    );

    // If no valid flights found, try a broader search
    if (validFlights.length === 0) {
      console.log('[API] No valid flights found, trying broader search...');
      
      // Try different search strategies
      const broaderStrategies = [
        { type: 'airports', param: 'airports', value: query.toUpperCase() },
        { type: 'routes', param: 'routes', value: query.toUpperCase() },
      ];

      for (const strategy of broaderStrategies) {
        try {
          const strategyParams = new URLSearchParams();
          strategyParams.append('flight_datetime_from', dateFrom);
          strategyParams.append('flight_datetime_to', dateTo);
          strategyParams.append('limit', '10');
          strategyParams.append(strategy.param, strategy.value);

          const strategyUrl = `${url}?${strategyParams.toString()}`;
          console.log('[API] Trying strategy:', strategy.type, strategyUrl);

          const strategyResponse = await fetch(strategyUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Accept-Version': 'v1',
              'Content-Type': 'application/json',
            },
          });

          if (strategyResponse.ok) {
            const strategyData = await strategyResponse.json();
            if (strategyData.data && strategyData.data.length > 0) {
              const filtered = strategyData.data.filter((flight: any) => 
                flight.flight && flight.reg
              );
              if (filtered.length > 0) {
                return NextResponse.json({ 
                  data: filtered,
                  searchStrategy: strategy.type 
                });
              }
            }
          }
        } catch (error) {
          console.log('[API] Strategy failed:', strategy.type, error);
        }
      }
    }

    return NextResponse.json({ 
      data: validFlights,
      searchUsed: searchType 
    });

  } catch (error) {
    console.error('[API] Error fetching flights:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}