import { NextRequest, NextResponse } from "next/server";

// OpenWeather Air Pollution API — current air quality (AQI 1–5) plus pollutant
// concentrations (CO, NO, NO2, O3, SO2, PM2.5, PM10, NH3) in μg/m³.
// Proxied server-side so the key stays private.
// https://openweathermap.org/api/air-pollution
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
    `https://api.openweathermap.org/data/2.5/air_pollution` +
    `?lat=${latNum}&lon=${lonNum}&appid=${apiKey}`;

  const upstream = await fetch(url, { next: { revalidate: 600 } });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Failed to fetch air pollution data" },
      { status: upstream.status }
    );
  }

  const data = await upstream.json();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
