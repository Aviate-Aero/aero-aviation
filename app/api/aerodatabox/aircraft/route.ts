import { NextRequest, NextResponse } from "next/server";

type ErrorResponse = {
  message: string;
  status?: number;
};

type SearchBy = "Reg" | "Icao24";

function getConfiguration() {
  const apiKey = process.env.AERODATABOX_API_KEY;
  const baseUrl = process.env.AERODATABOX_BASE_URL?.replace(/\/$/, "");

  return apiKey && baseUrl ? { apiKey, baseUrl } : null;
}

function getHeaders(apiKey: string): HeadersInit {
  return {
    Accept: "application/json",
    "x-api-market-key": apiKey,
  };
}

async function readResponse(response: Response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type");
  return contentType?.includes("application/json")
    ? await response.json()
    : null;
}

function cleanSearchValue(value: string | null) {
  return (value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 10);
}

export async function GET(request: NextRequest) {
  const configuration = getConfiguration();

  if (!configuration) {
    return NextResponse.json<ErrorResponse>(
      { message: "AeroDataBox API configuration is missing." },
      { status: 500 }
    );
  }

  const action = request.nextUrl.searchParams.get("action") ?? "lookup";

  if (action === "autocomplete") {
    return autocompleteAircraft(request, configuration);
  }

  if (action === "lookup") {
    return lookupAircraft(request, configuration);
  }

  return NextResponse.json<ErrorResponse>(
    { message: "Unsupported aircraft action." },
    { status: 400 }
  );
}

async function autocompleteAircraft(
  request: NextRequest,
  configuration: { apiKey: string; baseUrl: string }
) {
  const query = cleanSearchValue(request.nextUrl.searchParams.get("q"));

  if (query.length < 4) {
    return NextResponse.json<ErrorResponse>(
      { message: "Enter at least four characters for tail-number suggestions." },
      { status: 400 }
    );
  }

  const url = new URL(`${configuration.baseUrl}/aircrafts/search/term`);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "8");

  try {
    const response = await fetch(url, {
      headers: getHeaders(configuration.apiKey),
      next: { revalidate: 3600 },
    });
    const data = await readResponse(response);

    if (!response.ok) {
      return NextResponse.json<ErrorResponse>(
        {
          message:
            data?.message ?? "Unable to retrieve aircraft suggestions.",
          status: response.status,
        },
        { status: response.status }
      );
    }

    const rawItems = Array.isArray(data?.items) ? data.items : [];
    const suggestions = rawItems.map(
      (item: Record<string, unknown>) => ({
        id: item.id,
        reg: item.reg,
        hexIcao: item.hexIcao,
        model: item.model,
        airlineName: item.airlineName,
      })
    );

    return NextResponse.json(
      { suggestions },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("AeroDataBox aircraft autocomplete error:", error);
    return NextResponse.json<ErrorResponse>(
      { message: "Unable to connect to aircraft autocomplete." },
      { status: 502 }
    );
  }
}

async function lookupAircraft(
  request: NextRequest,
  configuration: { apiKey: string; baseUrl: string }
) {
  const requestedSearchBy = request.nextUrl.searchParams.get("searchBy");
  const searchBy: SearchBy =
    requestedSearchBy?.toLowerCase() === "icao24" ? "Icao24" : "Reg";
  const query = cleanSearchValue(request.nextUrl.searchParams.get("q"));

  if (!query) {
    return NextResponse.json<ErrorResponse>(
      { message: "Enter a tail number or Mode-S address." },
      { status: 400 }
    );
  }

  if (searchBy === "Icao24" && !/^[0-9A-F]{6}$/.test(query)) {
    return NextResponse.json<ErrorResponse>(
      { message: "Mode-S must be a six-character hexadecimal address." },
      { status: 400 }
    );
  }

  const encodedQuery = encodeURIComponent(query);
  const aircraftUrl = `${configuration.baseUrl}/aircrafts/${searchBy}/${encodedQuery}`;
  const registrationsUrl = `${aircraftUrl}/registrations`;

  try {
    const [aircraftResponse, registrationsResponse] = await Promise.all([
      fetch(aircraftUrl, {
        headers: getHeaders(configuration.apiKey),
        next: { revalidate: 3600 },
      }),
      fetch(registrationsUrl, {
        headers: getHeaders(configuration.apiKey),
        next: { revalidate: 3600 },
      }),
    ]);

    const [aircraft, registrationsData] = await Promise.all([
      readResponse(aircraftResponse),
      readResponse(registrationsResponse),
    ]);

    if (!aircraftResponse.ok) {
      return NextResponse.json<ErrorResponse>(
        {
          message: aircraft?.message ?? "Unable to retrieve this aircraft.",
          status: aircraftResponse.status,
        },
        { status: aircraftResponse.status }
      );
    }

    if (!aircraft) {
      return NextResponse.json<ErrorResponse>(
        { message: "No aircraft matched this identifier." },
        { status: 404 }
      );
    }

    const registrations = registrationsResponse.ok
      ? Array.isArray(registrationsData)
        ? registrationsData
        : []
      : [];

    return NextResponse.json(
      {
        aircraft,
        registrations,
        registrationHistoryAvailable: registrationsResponse.ok,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("AeroDataBox aircraft lookup error:", error);
    return NextResponse.json<ErrorResponse>(
      { message: "Internal server error while looking up the aircraft." },
      { status: 500 }
    );
  }
}
