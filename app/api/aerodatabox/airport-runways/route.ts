import { NextRequest, NextResponse } from "next/server";

type ErrorResponse = {
  message: string;
  status?: number;
};

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.AERODATABOX_API_KEY;
    const baseUrl = process.env.AERODATABOX_BASE_URL;

    if (!apiKey || !baseUrl) {
      return NextResponse.json<ErrorResponse>(
        { message: "AeroDataBox API configuration is missing." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);

    const codeType = searchParams.get("codeType")?.trim().toLowerCase();
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (codeType !== "iata" && codeType !== "icao") {
      return NextResponse.json<ErrorResponse>(
        { message: "Invalid code type. Use either iata or icao." },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json<ErrorResponse>(
        { message: "Airport code is required." },
        { status: 400 }
      );
    }

    if (codeType === "iata" && code.length !== 3) {
      return NextResponse.json<ErrorResponse>(
        {
          message:
            "IATA airport code must be 3 characters, e.g. LHE, DXB, LHR.",
        },
        { status: 400 }
      );
    }

    if (codeType === "icao" && code.length !== 4) {
      return NextResponse.json<ErrorResponse>(
        {
          message:
            "ICAO airport code must be 4 characters, e.g. OPLA, OMDB, EGLL.",
        },
        { status: 400 }
      );
    }

    const endpoint = `${baseUrl}/airports/${codeType}/${code}/runways`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-api-market-key": apiKey,
      },
      cache: "no-store",
    });

    if (response.status === 204) {
      return NextResponse.json(
        {
          message:
            "No runway data found for this airport. AeroDataBox may not have runway data for this code.",
        },
        { status: 404 }
      );
    }

    const contentType = response.headers.get("content-type");

    const data = contentType?.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok) {
      return NextResponse.json<ErrorResponse>(
        {
          message: data?.message || "Failed to fetch airport runway data.",
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("AeroDataBox airport runways API error:", error);

    return NextResponse.json<ErrorResponse>(
      { message: "Internal server error while fetching airport runway data." },
      { status: 500 }
    );
  }
}