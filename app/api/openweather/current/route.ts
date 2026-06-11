import { NextRequest, NextResponse } from "next/server";

// OpenWeather Current Weather Data API — returns live conditions for a
// coordinate pair. Proxied server-side so the API key stays private.
// https://openweathermap.org/current
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
    return NextResponse.json(
      { error: "Invalid coordinates" },
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

  // units=metric → temperature in °C, wind speed in m/s.
  const url =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?lat=${latNum}&lon=${lonNum}&units=metric&appid=${apiKey}`;

  const upstream = await fetch(url, { next: { revalidate: 600 } });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Failed to fetch current weather" },
      { status: upstream.status }
    );
  }

  const data = await upstream.json();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
