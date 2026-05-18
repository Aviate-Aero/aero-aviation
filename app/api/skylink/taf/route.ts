import { NextRequest, NextResponse } from 'next/server'

type SkylinkTafResponse = {
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
          success: false,
          error: 'Valid 4-letter ICAO code is required',
        },
        { status: 400 }
      )
    }

    const rapidApiKey = process.env.SKYLINK_RAPIDAPI_KEY
    const rapidApiHost = process.env.SKYLINK_RAPIDAPI_HOST || 'skylink-api.p.rapidapi.com'

    if (!rapidApiKey) {
      console.error('RAPIDAPI_KEY is missing')

      return NextResponse.json(
        {
          success: false,
          error:
            'RAPIDAPI_KEY is missing on server. Add it to .env.local and restart Next.js.',
        },
        { status: 500 }
      )
    }

    const skylinkUrl = `https://${rapidApiHost}/weather/taf/${encodeURIComponent(
      icao
    )}?parsed=false`

    const response = await fetch(skylinkUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': rapidApiHost,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error('Skylink TAF failed:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      })

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch TAF from Skylink',
          status: response.status,
          details: responseText,
        },
        { status: response.status }
      )
    }

    let data: SkylinkTafResponse

    try {
      data = JSON.parse(responseText)
    } catch {
      console.error('Invalid JSON from Skylink:', responseText)

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON response from Skylink',
          details: responseText,
        },
        { status: 502 }
      )
    }

    if (!data.raw) {
      return NextResponse.json(
        {
          success: false,
          error: 'Skylink response does not contain raw TAF',
          details: data,
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      full: data.raw,
      raw: data.raw,
      icao: data.icao ?? icao,
      airportName: data.airport_name ?? null,
      timestamp: data.timestamp ?? null,
      source: 'skylink',
    })
  } catch (error) {
    console.error('Unexpected Skylink TAF API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected server error while fetching TAF',
      },
      { status: 500 }
    )
  }
}