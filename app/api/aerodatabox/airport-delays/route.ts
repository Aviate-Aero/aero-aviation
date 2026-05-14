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
    const dateLocal = searchParams.get("dateLocal")?.trim();

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

    if (dateLocal && !/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(dateLocal)) {
      return NextResponse.json<ErrorResponse>(
        {
          message:
            "Invalid dateLocal format. Use YYYY-MM-DD or YYYY-MM-DDTHH:mm.",
        },
        { status: 400 }
      );
    }

    const endpoint = dateLocal
      ? `${baseUrl}/airports/${codeType}/${code}/delays/${dateLocal}`
      : `${baseUrl}/airports/${codeType}/${code}/delays`;

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
            "No delay data found for this airport. Try another airport or a different date/time.",
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
          message: data?.message || "Failed to fetch airport delay data.",
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("AeroDataBox airport delays API error:", error);

    return NextResponse.json<ErrorResponse>(
      { message: "Internal server error while fetching airport delay data." },
      { status: 500 }
    );
  }
}