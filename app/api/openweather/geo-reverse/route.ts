import { NextRequest, NextResponse } from "next/server";

// OpenWeather Reverse Geocoding API — turns coordinates into place names.
// https://openweathermap.org/api/geocoding-api#reverse
export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lon = request.nextUrl.searchParams.get("lon");

  if (lat === null || lon === null) {
    return NextResponse.json(
      { error: "Missing lat/lon coordinates" },
      { status: 400 }
    );
  }

  const latNum = Number(lat);
  const lonNum = Number(lon);

  if (
    !Number.isFinite(latNum) ||
    !Number.isFinite(lonNum) ||
    Math.abs(latNum) > 90 ||
    Math.abs(lonNum) > 180
  ) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenWeather API key is missing" },
      { status: 500 }
    );
  }

  const url =
    `https://api.openweathermap.org/geo/1.0/reverse` +
    `?lat=${latNum}&lon=${lonNum}&limit=5&appid=${apiKey}`;

  const upstream = await fetch(url, { next: { revalidate: 86400 } });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Reverse geocoding failed" },
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
