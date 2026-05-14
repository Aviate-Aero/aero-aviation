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
    const codeFrom = searchParams.get("codeFrom")?.trim().toUpperCase();
    const codeTo = searchParams.get("codeTo")?.trim().toUpperCase();
    const aircraftName = searchParams.get("aircraftName")?.trim();
    const flightTimeModel =
      searchParams.get("flightTimeModel")?.trim() || "ML01";

    if (codeType !== "iata" && codeType !== "icao") {
      return NextResponse.json<ErrorResponse>(
        { message: "Invalid code type. Use either iata or icao." },
        { status: 400 }
      );
    }

    if (!codeFrom || !codeTo) {
      return NextResponse.json<ErrorResponse>(
        { message: "Origin and destination airport codes are required." },
        { status: 400 }
      );
    }

    if (codeType === "iata" && (codeFrom.length !== 3 || codeTo.length !== 3)) {
      return NextResponse.json<ErrorResponse>(
        { message: "IATA airport codes must be 3 characters, e.g. LHE, DXB, LHR." },
        { status: 400 }
      );
    }

    if (codeType === "icao" && (codeFrom.length !== 4 || codeTo.length !== 4)) {
      return NextResponse.json<ErrorResponse>(
        { message: "ICAO airport codes must be 4 characters, e.g. OPLA, OMDB, EGLL." },
        { status: 400 }
      );
    }

    if (flightTimeModel !== "Standard" && flightTimeModel !== "ML01") {
      return NextResponse.json<ErrorResponse>(
        { message: "Invalid flight time model. Use Standard or ML01." },
        { status: 400 }
      );
    }

    const url = new URL(
      `${baseUrl}/airports/${codeType}/${codeFrom}/distance-time/${codeTo}`
    );

    if (aircraftName) {
      url.searchParams.set("aircraftName", aircraftName);
    }

    url.searchParams.set("flightTimeModel", flightTimeModel);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-api-market-key": apiKey,
      },
      cache: "no-store",
    });

    if (response.status === 204) {
      return NextResponse.json(
        { message: "No distance or flight time data found for these airports." },
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
          message: data?.message || "Failed to fetch distance and flight time.",
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("AeroDataBox distance-time API error:", error);

    return NextResponse.json<ErrorResponse>(
      { message: "Internal server error while fetching distance and flight time." },
      { status: 500 }
    );
  }
}