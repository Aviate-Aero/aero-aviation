import { NextRequest, NextResponse } from "next/server";

type CodeType = "iata" | "icao";
type Direction = "Arrival" | "Departure" | "Both";

type FlightTime = {
  utc?: string;
  local?: string;
};

type AirportInfo = {
  icao?: string;
  iata?: string;
  localCode?: string;
  name?: string;
  shortName?: string;
  municipalityName?: string;
  countryCode?: string;
  timeZone?: string;
};

type FlightMovement = {
  airport?: AirportInfo;
  scheduledTime?: FlightTime;
  revisedTime?: FlightTime;
  predictedTime?: FlightTime;
  runwayTime?: FlightTime;
  terminal?: string;
  checkInDesk?: string;
  gate?: string;
  baggageBelt?: string;
  runway?: string;
  quality?: string[];
};

type FlightItem = {
  movement?: FlightMovement;
  departure?: FlightMovement;
  arrival?: FlightMovement;
  number?: string;
  callSign?: string;
  status?: string;
  codeshareStatus?: string;
  isCargo?: boolean;
  aircraft?: {
    model?: string;
    reg?: string;
    modeS?: string;
  };
  airline?: {
    name?: string;
    iata?: string;
    icao?: string;
  };
};

type AeroDataBoxFlightsResponse = {
  arrivals?: FlightItem[];
  departures?: FlightItem[];
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const codeTypeParam = searchParams.get("codeType")?.toLowerCase();
    const codeParam = searchParams.get("code")?.trim().toUpperCase();
    const directionParam = searchParams.get("direction") || "Both";

    const offsetMinutes = searchParams.get("offsetMinutes") || "-120";
    const durationMinutes = searchParams.get("durationMinutes") || "720";

    const withLeg = searchParams.get("withLeg") || "false";
    const withCancelled = searchParams.get("withCancelled") || "true";
    const withCodeshared = searchParams.get("withCodeshared") || "true";
    const withCargo = searchParams.get("withCargo") || "true";
    const withPrivate = searchParams.get("withPrivate") || "true";
    const withLocation = searchParams.get("withLocation") || "false";

    if (!codeTypeParam || !codeParam) {
      return NextResponse.json(
        {
          success: false,
          message: "codeType and code are required.",
          example: "/api/airport-flights?codeType=icao&code=KLAX&direction=Both",
        },
        { status: 400 }
      );
    }

    if (codeTypeParam !== "iata" && codeTypeParam !== "icao") {
      return NextResponse.json(
        {
          success: false,
          message: "codeType must be either iata or icao.",
        },
        { status: 400 }
      );
    }

    if (
      directionParam !== "Arrival" &&
      directionParam !== "Departure" &&
      directionParam !== "Both"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "direction must be Arrival, Departure, or Both.",
        },
        { status: 400 }
      );
    }

    const codeType = codeTypeParam as CodeType;
    const direction = directionParam as Direction;

    if (codeType === "icao" && codeParam.length !== 4) {
      return NextResponse.json(
        {
          success: false,
          message: "ICAO airport code must be 4 characters, for example KLAX.",
        },
        { status: 400 }
      );
    }

    if (codeType === "iata" && codeParam.length !== 3) {
      return NextResponse.json(
        {
          success: false,
          message: "IATA airport code must be 3 characters, for example LAX.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.AERODATABOX_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "AERODATABOX_API_KEY is missing from environment variables.",
        },
        { status: 500 }
      );
    }

    const apiUrl = new URL(
      `https://prod.api.market/api/v1/aedbx/aerodatabox/flights/airports/${codeType}/${codeParam}`
    );

    apiUrl.searchParams.set("offsetMinutes", offsetMinutes);
    apiUrl.searchParams.set("durationMinutes", durationMinutes);
    apiUrl.searchParams.set("direction", direction);
    apiUrl.searchParams.set("withLeg", withLeg);
    apiUrl.searchParams.set("withCancelled", withCancelled);
    apiUrl.searchParams.set("withCodeshared", withCodeshared);
    apiUrl.searchParams.set("withCargo", withCargo);
    apiUrl.searchParams.set("withPrivate", withPrivate);
    apiUrl.searchParams.set("withLocation", withLocation);

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-market-key": apiKey,
      },
      next: {
        revalidate: 60,
      },
    });

    if (response.status === 204) {
      return NextResponse.json({
        success: true,
        airport: {
          codeType,
          code: codeParam,
        },
        direction,
        arrivals: [],
        departures: [],
        message: "No flights found for this airport and time range.",
      });
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            data?.message || "Failed to fetch airport flights from AeroDataBox.",
          status: response.status,
        },
        { status: response.status }
      );
    }

    const typedData = data as AeroDataBoxFlightsResponse;

    return NextResponse.json({
      success: true,
      airport: {
        codeType,
        code: codeParam,
      },
      direction,
      arrivals: typedData.arrivals ?? [],
      departures: typedData.departures ?? [],
      totalArrivals: typedData.arrivals?.length ?? 0,
      totalDepartures: typedData.departures?.length ?? 0,
    });
  } catch (error) {
    console.error("Airport flights API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while fetching airport flights.",
      },
      { status: 500 }
    );
  }
}