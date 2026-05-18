import { NextRequest, NextResponse } from 'next/server'

type SkylinkMetarResponse = {
  raw?: string
  icao?: string
  airport_name?: string
  timestamp?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const icao = searchParams.get('icao')?.trim().toUpperCase()

    if (!icao || !/^[A-Z]{4}$/.test(icao)) {
      return NextResponse.json(
        {
          error: 'Valid 4-letter ICAO code is required',
        },
        { status: 400 }
      )
    }

    const rapidApiKey = process.env.SKYLINK_RAPIDAPI_KEY
    const rapidApiHost = process.env.SKYLINK_RAPIDAPI_HOST || 'skylink-api.p.rapidapi.com'

    if (!rapidApiKey) {
      return NextResponse.json(
        {
          error: 'RAPIDAPI_KEY is missing on server',
        },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://${rapidApiHost}/weather/metar/${icao}?parsed=false`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': rapidApiHost,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      const errorText = await response.text()

      return NextResponse.json(
        {
          error: 'Failed to fetch METAR from Skylink',
          status: response.status,
          details: errorText,
        },
        { status: response.status }
      )
    }

    const data: SkylinkMetarResponse = await response.json()

    return NextResponse.json({
      full: data.raw ?? null,
      raw: data.raw ?? null,
      icao: data.icao ?? icao,
      airportName: data.airport_name ?? null,
      timestamp: data.timestamp ?? null,
      source: 'skylink',
    })
  } catch (error) {
    console.error('Skylink METAR API error:', error)

    return NextResponse.json(
      {
        error: 'Unexpected server error while fetching METAR',
      },
      { status: 500 }
    )
  }
}