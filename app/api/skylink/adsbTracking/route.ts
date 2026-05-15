import { NextResponse } from "next/server";

type ErrorResponse = {
  message: string;
  status?: number;
  details?: unknown;
};

export async function GET() {
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

    const endpoint = `${baseUrl}/adsb/aircraft/statistics`;

    const response = await fetch(endpoint, {
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
        "Skylink ADS-B aircraft statistics API failed:",
        JSON.stringify(
          {
            status: response.status,
            url: endpoint,
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
              : "Failed to fetch ADS-B aircraft statistics.",
          status: response.status,
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Skylink ADS-B aircraft statistics route error:", error);

    return NextResponse.json<ErrorResponse>(
      {
        message:
          "Internal server error while fetching ADS-B aircraft statistics.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}