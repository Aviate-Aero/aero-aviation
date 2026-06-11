import { NextRequest, NextResponse } from "next/server";

// OpenWeather 5 Day / 3 Hour Forecast API (free tier).
// Returns 40 entries at 3-hour steps. Proxied so the key stays server-side.
// https://openweathermap.org/forecast5
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
    `https://api.openweathermap.org/data/2.5/forecast` +
    `?lat=${latNum}&lon=${lonNum}&units=metric&appid=${apiKey}`;

  const upstream = await fetch(url, { next: { revalidate: 1800 } });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Failed to fetch 5-day forecast" },
      { status: upstream.status }
    );
  }

  const data = await upstream.json();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=1800, s-maxage=1800",
    },
  });
}
