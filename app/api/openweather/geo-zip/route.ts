import { NextRequest, NextResponse } from "next/server";

// OpenWeather Geocoding by ZIP/post code.
// Accepts ?zip=94040,US (country code optional, defaults handled upstream).
// https://openweathermap.org/api/geocoding-api#direct_zip
export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get("zip")?.trim();

  if (!zip) {
    return NextResponse.json({ error: "Missing zip code" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenWeather API key is missing" },
      { status: 500 }
    );
  }

  const url =
    `https://api.openweathermap.org/geo/1.0/zip` +
    `?zip=${encodeURIComponent(zip)}&appid=${apiKey}`;

  const upstream = await fetch(url, { next: { revalidate: 86400 } });

  if (!upstream.ok) {
    const message =
      upstream.status === 404
        ? "No location found for that zip code"
        : "Zip lookup failed";
    return NextResponse.json({ error: message }, { status: upstream.status });
  }

  // Zip endpoint returns a single object: { zip, name, lat, lon, country }.
  const entry = await upstream.json();

  return NextResponse.json({
    result: {
      zip: entry.zip,
      name: entry.name,
      lat: entry.lat,
      lon: entry.lon,
      country: entry.country,
    },
  });
}
