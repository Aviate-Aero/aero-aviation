import { NextRequest, NextResponse } from "next/server";

// OpenWeather Geocoding API — resolves a free-text query (city / location)
// into a list of coordinates so the client never has to hold the API key.
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Missing search query" },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenWeather API key is missing" },
      { status: 500 }
    );
  }

  const url =
    `https://api.openweathermap.org/geo/1.0/direct` +
    `?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`;

  const upstream = await fetch(url, { next: { revalidate: 86400 } });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Geocoding lookup failed" },
      { status: upstream.status }
    );
  }

  type GeoEntry = {
    name: string;
    lat: number;
    lon: number;
    country: string;
    state?: string;
  };

  const data = (await upstream.json()) as GeoEntry[];

  const results = data.map((entry) => ({
    name: entry.name,
    lat: entry.lat,
    lon: entry.lon,
    country: entry.country,
    state: entry.state,
  }));

  return NextResponse.json({ results });
}
