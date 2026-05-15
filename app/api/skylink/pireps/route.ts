import { NextRequest, NextResponse } from "next/server";

type ErrorResponse = {
  message: string;
  status?: number;
  details?: unknown;
};

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

    const requestedHours = Number(searchParams.get("hours") ?? "2");
    const safeHours = Math.min(Math.max(requestedHours || 2, 1), 24);

    const bbox = searchParams.get("bbox")?.trim();

    if (!bbox) {
      return NextResponse.json<ErrorResponse>(
        {
          message:
            "Bounding box is required. Use minLat,minLon,maxLat,maxLon format, e.g. 39,-78,42,-71.",
        },
        { status: 400 }
      );
    }

    if (!isValidBbox(bbox)) {
      return NextResponse.json<ErrorResponse>(
        {
          message:
            "Invalid bbox format. Use minLat,minLon,maxLat,maxLon format, e.g. 39,-78,42,-71.",
        },
        { status: 400 }
      );
    }

    const url = new URL(`${baseUrl}/weather/pireps`);

    url.searchParams.set("bbox", bbox);
    url.searchParams.set("hours", String(safeHours));

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
        "Skylink PIREPs API failed:",
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
              : "Failed to fetch PIREP data.",
          status: response.status,
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Skylink PIREPs route error:", error);

    return NextResponse.json<ErrorResponse>(
      {
        message: "Internal server error while fetching PIREP data.",
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