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
    const icaoType = searchParams.get("icaoType")?.trim().toUpperCase();

    if (!icaoType) {
      return NextResponse.json<ErrorResponse>(
        { message: "Aircraft ICAO type is required. Example: B77W, A320, B738." },
        { status: 400 }
      );
    }

    if (icaoType.length < 2 || icaoType.length > 6) {
      return NextResponse.json<ErrorResponse>(
        { message: "Invalid aircraft ICAO type. Example: B77W, A320, B738." },
        { status: 400 }
      );
    }

    const url = `${baseUrl}/aircraft/performance/${encodeURIComponent(
      icaoType
    )}`;

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
              : "Failed to fetch aircraft performance data.",
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Skylink aircraft performance API error:", error);

    return NextResponse.json<ErrorResponse>(
      {
        message:
          "Internal server error while fetching aircraft performance data.",
      },
      { status: 500 }
    );
  }
}