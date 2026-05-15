import { NextRequest, NextResponse } from "next/server";

type ErrorResponse = {
  message: string;
  status?: number;
  details?: unknown;
};

const VALID_LEVELS = ["low", "high"] as const;

export async function GET(request: NextRequest) {
  try {
    const rapidApiKey = process.env.SKYLINK_RAPIDAPI_KEY;
    const rapidApiHost =
      process.env.SKYLINK_RAPIDAPI_HOST || "skylink-api.p.rapidapi.com";
    const baseUrl =
      process.env.SKYLINK_BASE_URL || "https://skylink-api.p.rapidapi.com";

    if (!rapidApiKey) {
      return NextResponse.json<ErrorResponse>(
        { message: "Skylink API configuration is missing." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);

    const requestedForecast = Number(searchParams.get("forecast") ?? "12");
    const safeForecast = Math.min(
      Math.max(requestedForecast || 12, 6),
      24
    );

    const level = searchParams.get("level")?.trim().toLowerCase() || "low";
    const bbox = searchParams.get("bbox")?.trim();

    if (!VALID_LEVELS.includes(level as (typeof VALID_LEVELS)[number])) {
      return NextResponse.json<ErrorResponse>(
        { message: "Invalid level. Use low or high." },
        { status: 400 }
      );
    }

    if (bbox && !isValidBbox(bbox)) {
      return NextResponse.json<ErrorResponse>(
        {
          message:
            "Invalid bbox format. Use minLat,minLon,maxLat,maxLon format, e.g. 40,-80,42,-73.",
        },
        { status: 400 }
      );
    }

    const url = new URL(`${baseUrl}/weather/winds-aloft`);

    url.searchParams.set("forecast", String(safeForecast));
    url.searchParams.set("level", level);

    if (bbox) {
      url.searchParams.set("bbox", bbox);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": rapidApiHost,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const responseText = await response.text();

    let data: unknown;

    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      data = responseText;
    }

    if (!response.ok) {
      console.error(
        "Skylink Winds Aloft API failed:",
        JSON.stringify(
          {
            status: response.status,
            url: url.toString(),
            response: data,
          },
          null,
          2
        )
      );

      return NextResponse.json<ErrorResponse>(
        {
          message:
            typeof data === "object" && data !== null && "message" in data
              ? String((data as { message?: unknown }).message)
              : "Failed to fetch winds aloft data.",
          status: response.status,
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Skylink Winds Aloft route error:", error);

    return NextResponse.json<ErrorResponse>(
      {
        message: "Internal server error while fetching winds aloft data.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

function isValidBbox(value: string) {
  const parts = value.split(",").map((part) => Number(part.trim()));

  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [minLat, minLon, maxLat, maxLon] = parts;

  return (
    minLat >= -90 &&
    minLat <= 90 &&
    maxLat >= -90 &&
    maxLat <= 90 &&
    minLon >= -180 &&
    minLon <= 180 &&
    maxLon >= -180 &&
    maxLon <= 180 &&
    minLat < maxLat &&
    minLon < maxLon
  );
}