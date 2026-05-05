import { NextRequest, NextResponse } from "next/server";

type SearchBy = "number" | "callsign" | "reg" | "icao24";
type DateLocalRole = "Both" | "Departure" | "Arrival";

const allowedSearchBy: SearchBy[] = ["number", "callsign", "reg", "icao24"];
const allowedDateLocalRoles: DateLocalRole[] = ["Both", "Departure", "Arrival"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const searchBy = searchParams.get("searchBy") as SearchBy | null;
    const searchParam = searchParams.get("searchParam");
    const dateLocal = searchParams.get("dateLocal");

    const dateLocalRole =
      (searchParams.get("dateLocalRole") as DateLocalRole | null) || "Both";

    const withAircraftImage = searchParams.get("withAircraftImage") || "false";
    const withLocation = searchParams.get("withLocation") || "false";

    if (!searchBy || !allowedSearchBy.includes(searchBy)) {
      return NextResponse.json(
        {
          error:
            "Invalid searchBy. Use one of: number, callsign, reg, icao24.",
        },
        { status: 400 }
      );
    }

    if (!searchParam) {
      return NextResponse.json(
        { error: "searchParam is required." },
        { status: 400 }
      );
    }

    if (!allowedDateLocalRoles.includes(dateLocalRole)) {
      return NextResponse.json(
        {
          error:
            "Invalid dateLocalRole. Use one of: Both, Departure, Arrival.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.AERODATABOX_API_KEY;
    const baseUrl = process.env.AERODATABOX_BASE_URL;

    if (!apiKey || !baseUrl) {
      return NextResponse.json(
        { error: "AeroDataBox API configuration is missing." },
        { status: 500 }
      );
    }

    // Endpoint:
    // /flights/{searchBy}/{searchParam}
    // or
    // /flights/{searchBy}/{searchParam}/{dateLocal}
    const endpoint = dateLocal
      ? `${baseUrl}/flights/${searchBy}/${encodeURIComponent(
          searchParam
        )}/${dateLocal}`
      : `${baseUrl}/flights/${searchBy}/${encodeURIComponent(searchParam)}`;

    const aeroParams = new URLSearchParams({
      dateLocalRole,
      withAircraftImage,
      withLocation,
    });

    const response = await fetch(`${endpoint}?${aeroParams.toString()}`, {
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
          message: "No flight data found.",
          data: [],
        },
        { status: 200 }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data?.message || "Failed to fetch flight status.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      data,
    });
  } catch (error) {
    console.error("Flight status API error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while fetching flight status.",
      },
      { status: 500 }
    );
  }
}