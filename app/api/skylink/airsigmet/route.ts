import { NextRequest, NextResponse } from "next/server";

type ErrorResponse = {
  message: string;
  status?: number;
  details?: unknown;
};

type AirSigmetType = "airmet" | "sigmet";

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

    const bbox = searchParams.get("bbox")?.trim();
    const type = searchParams.get("type")?.trim().toLowerCase();

    if (!bbox) {
      return NextResponse.json<ErrorResponse>(
        {
          message:
            "Bounding box is required. Example format: 38,-90,45,-80",
        },
        { status: 400 }
      );
    }

    if (!isValidBbox(bbox)) {
      return NextResponse.json<ErrorResponse>(
        {
          message:
            "Invalid bbox. Use format lat1,lon1,lat2,lon2 from SW corner to NE corner. Example: 38,-90,45,-80",
        },
        { status: 400 }
      );
    }

    if (type && type !== "airmet" && type !== "sigmet") {
      return NextResponse.json<ErrorResponse>(
        {
          message: "Invalid type. Use either 'airmet' or 'sigmet'.",
        },
        { status: 400 }
      );
    }

    const endpointUrl = new URL(`${baseUrl}/weather/airsigmet`);

    endpointUrl.searchParams.set("bbox", bbox);

    if (type) {
      endpointUrl.searchParams.set("type", type as AirSigmetType);
    }

    const response = await fetch(endpointUrl.toString(), {
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
        "Skylink AIRSIGMET API failed:",
        JSON.stringify(
          {
            status: response.status,
            url: endpointUrl.toString(),
            response: data,
          },
          null,
          2
        )
      );

      return NextResponse.json<ErrorResponse>(
        {
          message: extractApiErrorMessage(
            data,
            "Failed to fetch AIRSIGMET reports."
          ),
          status: response.status,
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Skylink AIRSIGMET route error:", error);

    return NextResponse.json<ErrorResponse>(
      {
        message: "Internal server error while fetching AIRSIGMET reports.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

function isValidBbox(value: string) {
  const parts = value.split(",").map((item) => Number(item.trim()));

  if (parts.length !== 4) return false;

  const [lat1, lon1, lat2, lon2] = parts;

  const validNumbers = parts.every((part) => Number.isFinite(part));

  const validLatitudes =
    lat1 >= -90 && lat1 <= 90 && lat2 >= -90 && lat2 <= 90;

  const validLongitudes =
    lon1 >= -180 && lon1 <= 180 && lon2 >= -180 && lon2 <= 180;

  const validSwToNeOrder = lat1 < lat2 && lon1 < lon2;

  return validNumbers && validLatitudes && validLongitudes && validSwToNeOrder;
}

function extractApiErrorMessage(data: unknown, fallback: string) {
  if (typeof data === "object" && data !== null && "message" in data) {
    return String((data as { message?: unknown }).message);
  }

  if (typeof data === "object" && data !== null && "detail" in data) {
    try {
      return JSON.stringify((data as { detail?: unknown }).detail, null, 2);
    } catch {
      return fallback;
    }
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return fallback;
}