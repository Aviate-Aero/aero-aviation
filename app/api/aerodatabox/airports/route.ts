// app/api/airport/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const codeType = searchParams.get('codeType')?.toLowerCase(); // 'iata' or 'icao'
  const code = searchParams.get('code')?.toUpperCase();         // e.g., OPIS

  if (!codeType || !code) {
    return NextResponse.json(
      { message: 'Missing codeType or code parameter' },
      { status: 400 }
    );
  }

  if (codeType !== 'iata' && codeType !== 'icao') {
    return NextResponse.json(
      { message: 'codeType must be "iata" or "icao"' },
      { status: 400 }
    );
  }

  try {
    const apiUrl = `https://prod.api.market/api/v1/aedbx/aerodatabox/airports/${codeType.charAt(0).toUpperCase() + codeType.slice(1)}/${code}?withRunways=false&withTime=false`;
    
    const response = await fetch(apiUrl, {
      headers: {
        accept: 'application/json',
        'x-api-market-key': process.env.AERODATABOX_API_KEY!,
      },
    });

    if (!response.ok) {
      // Forward the status and error message from the external API
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        { message: errorData?.message || 'External API error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Airport fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}