import { NextRequest, NextResponse } from "next/server";

type ErrorResponse = {
  message: string;
  status?: number;
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
    const icao = searchParams.get("icao")?.trim().toUpperCase();

    if (!icao) {
      return NextResponse.json<ErrorResponse>(
        { message: "Airport ICAO code is required. Example: KJFK, EGLL, OPLA." },
        { status: 400 }
      );
    }

    if (icao.length !== 4) {
      return NextResponse.json<ErrorResponse>(
        { message: "ICAO airport code must be 4 characters. Example: KJFK." },
        { status: 400 }
      );
    }

    const url = `${baseUrl}/notams/${encodeURIComponent(icao)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": rapidApiHost,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type");

    const data = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      return NextResponse.json<ErrorResponse>(
        {
          message:
            typeof data === "object" && data && "message" in data
              ? String(data.message)
              : "Failed to fetch NOTAM data.",
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Skylink NOTAM API error:", error);

    return NextResponse.json<ErrorResponse>(
      { message: "Internal server error while fetching NOTAM data." },
      { status: 500 }
    );
  }
}