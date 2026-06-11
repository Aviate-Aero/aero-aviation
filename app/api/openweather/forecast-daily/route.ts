import { NextRequest, NextResponse } from "next/server";

// OpenWeather Daily Forecast 16 Days API.
// NOTE: this endpoint requires a paid subscription — on the free tier it
// returns 401. We forward the upstream status so the client can show a clear
// "not available on this plan" message. Proxied so the key stays server-side.
// https://openweathermap.org/forecast16
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
    `https://api.openweathermap.org/data/2.5/forecast/daily` +
    `?lat=${latNum}&lon=${lonNum}&cnt=16&units=metric&appid=${apiKey}`;

  const upstream = await fetch(url, { next: { revalidate: 3600 } });

  if (!upstream.ok) {
    const message =
      upstream.status === 401
        ? "16-day forecast is not available on this OpenWeather plan"
        : "Failed to fetch 16-day forecast";

    return NextResponse.json({ error: message }, { status: upstream.status });
  }

  const data = await upstream.json();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
