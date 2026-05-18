import { NextResponse } from "next/server";

type FaaLaddStatusResponse = {
  id: string;
  isBlocked: boolean;
  blockedSince?: string | null;
  lastBlockedOn?: string | null;
  message?: string;
};

type ErrorResponse = {
  message: string;
  status?: number;
  details?: unknown;
};

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const aircraftId = id?.trim().toUpperCase();

    const apiMarketKey = process.env.AERODATABOX_API_KEY;

    const baseUrl =
      process.env.AERODATABOX_BASE_URL ||
      "https://api.magicapi.dev/api/v1/aedbx/aerodatabox";

    if (!apiMarketKey) {
      return NextResponse.json<ErrorResponse>(
        { message: "AeroDataBox API.market configuration is missing." },
        { status: 500 }
      );
    }

    if (!aircraftId) {
      return NextResponse.json<ErrorResponse>(
        { message: "Callsign or aircraft tail number is required." },
        { status: 400 }
      );
    }

    const endpoint = `${baseUrl}/industry/faa-ladd/${encodeURIComponent(
      aircraftId
    )}/status`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "x-api-market-key": apiMarketKey,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (response.status === 204) {
      return NextResponse.json<FaaLaddStatusResponse>(
        {
          id: aircraftId,
          isBlocked: false,
          blockedSince: null,
          lastBlockedOn: null,
          message: "No FAA LADD record found for this aircraft.",
        },
        { status: 200 }
      );
    }

    const responseText = await response.text();

    let data: unknown;

    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      data = responseText;
    }

    if (!response.ok) {
      console.error(
        "AeroDataBox FAA LADD API failed:",
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
              : "Failed to fetch FAA LADD status.",
          status: response.status,
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json<FaaLaddStatusResponse>(
      normalizeFaaLaddResponse(data, aircraftId),
      { status: 200 }
    );
  } catch (error) {
    console.error("AeroDataBox FAA LADD route error:", error);

    return NextResponse.json<ErrorResponse>(
      {
        message: "Internal server error while fetching FAA LADD status.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

function normalizeFaaLaddResponse(
  data: unknown,
  fallbackId: string
): FaaLaddStatusResponse {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return {
      id: fallbackId,
      isBlocked: false,
      blockedSince: null,
      lastBlockedOn: null,
    };
  }

  const record = data as Record<string, unknown>;

  return {
    id: typeof record.id === "string" ? record.id : fallbackId,
    isBlocked:
      typeof record.isBlocked === "boolean" ? record.isBlocked : false,
    blockedSince:
      typeof record.blockedSince === "string" ? record.blockedSince : null,
    lastBlockedOn:
      typeof record.lastBlockedOn === "string" ? record.lastBlockedOn : null,
    message: typeof record.message === "string" ? record.message : undefined,
  };
}