import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FR24_COUNT_URL = "https://fr24api.flightradar24.com/api/flight-summary/count";
const MAX_RANGE_MS = 14 * 24 * 60 * 60 * 1000;

const LIST_PARAMS = new Set([
  "flight_ids",
  "flights",
  "callsigns",
  "registrations",
  "painted_as",
  "operating_as",
  "airports",
  "routes",
  "aircraft",
]);

const PASSTHROUGH_PARAMS = new Set([
  "flight_ids",
  "flight_datetime_from",
  "flight_datetime_to",
  "flights",
  "callsigns",
  "registrations",
  "painted_as",
  "operating_as",
  "airports",
  "routes",
  "aircraft",
]);

type CountResponse = {
  record_count?: number;
  message?: string;
  error?: string;
};

export async function GET(request: NextRequest) {
  const apiKey = process.env.FLIGHT_RADAR_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "FlightRadar24 API key is not configured on the server." },
      { status: 500 }
    );
  }

  const validationError = validateRequestParams(request.nextUrl.searchParams);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const params = buildFr24Params(request.nextUrl.searchParams);

  try {
    const response = await fetch(`${FR24_COUNT_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Accept-Version": "v1",
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const data = (await readJson(response)) as CountResponse | null;

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.message ||
            data?.error ||
            `FlightRadar24 API error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    if (typeof data?.record_count !== "number") {
      return NextResponse.json(
        {
          error: "Invalid FlightRadar24 flight summary count response format.",
          data,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      record_count: data.record_count,
      filters: Object.fromEntries(params.entries()),
      source: "FlightRadar24",
      endpoint: "flight-summary/count",
      retrieved_at: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error while fetching flight summary count.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function buildFr24Params(searchParams: URLSearchParams) {
  const params = new URLSearchParams();

  for (const [key, value] of searchParams.entries()) {
    const trimmedValue = value.trim();

    if (PASSTHROUGH_PARAMS.has(key) && trimmedValue) {
      params.set(
        key,
        LIST_PARAMS.has(key) ? splitCommaList(trimmedValue).join(",") : trimmedValue
      );
    }
  }

  return params;
}

function validateRequestParams(searchParams: URLSearchParams) {
  const unknownParams = Array.from(searchParams.keys()).filter(
    (key) => !PASSTHROUGH_PARAMS.has(key)
  );

  if (unknownParams.length > 0) {
    return `Unsupported filter: ${unknownParams.join(", ")}.`;
  }

  const flightIds = searchParams.get("flight_ids")?.trim();
  const dateFrom = searchParams.get("flight_datetime_from")?.trim();
  const dateTo = searchParams.get("flight_datetime_to")?.trim();

  if (flightIds && (dateFrom || dateTo)) {
    return "flight_ids cannot be combined with flight_datetime_from or flight_datetime_to.";
  }

  if (!flightIds && (!dateFrom || !dateTo)) {
    return "Provide either flight_ids or both flight_datetime_from and flight_datetime_to.";
  }

  if (dateFrom || dateTo) {
    const fromTime = Date.parse(dateFrom || "");
    const toTime = Date.parse(dateTo || "");

    if (!Number.isFinite(fromTime) || !Number.isFinite(toTime)) {
      return "Flight date values must be valid date-time strings.";
    }

    if (toTime <= fromTime) {
      return "flight_datetime_to must be later than flight_datetime_from.";
    }

    if (toTime - fromTime > MAX_RANGE_MS) {
      return "The maximum permitted flight summary date range is 14 days.";
    }
  }

  for (const key of LIST_PARAMS) {
    const value = searchParams.get(key)?.trim();
    if (!value) continue;

    const items = splitCommaList(value);
    if (items.length > 15) {
      return `${formatLabel(key)} accepts a maximum of 15 comma-separated values.`;
    }
  }

  return "";
}

async function readJson(response: Response): Promise<unknown> {
  const raw = await response.text();

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function splitCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ");
}
