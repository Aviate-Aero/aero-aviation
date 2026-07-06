import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FR24_COUNT_URL =
  "https://fr24api.flightradar24.com/api/historic/flight-positions/count";
const MIN_TIMESTAMP = Math.floor(Date.UTC(2016, 4, 12) / 1000);

const LIST_PARAMS = new Set([
  "flights",
  "callsigns",
  "registrations",
  "painted_as",
  "operating_as",
  "airports",
  "routes",
  "aircraft",
  "altitude_ranges",
  "squawks",
  "categories",
  "data_sources",
]);

const PASSTHROUGH_PARAMS = new Set([
  "timestamp",
  "bounds",
  "flights",
  "callsigns",
  "registrations",
  "painted_as",
  "operating_as",
  "airports",
  "routes",
  "aircraft",
  "altitude_ranges",
  "squawks",
  "categories",
  "data_sources",
  "gspeed",
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
          error: "Invalid FlightRadar24 historic count response format.",
          data,
        },
        { status: 502 }
      );
    }

    const timestamp = Number(params.get("timestamp"));

    return NextResponse.json({
      record_count: data.record_count,
      filters: Object.fromEntries(params.entries()),
      source: "FlightRadar24",
      endpoint: "historic/flight-positions/count",
      timestamp,
      timestamp_iso: new Date(timestamp * 1000).toISOString(),
      retrieved_at: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Internal server error while fetching historic flight position count.",
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
      params.set(key, normalizeParam(key, trimmedValue));
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

  const timestamp = searchParams.get("timestamp")?.trim();

  if (!timestamp) {
    return "Timestamp is required for historic flight position counts.";
  }

  const timestampNumber = Number(timestamp);

  if (!Number.isInteger(timestampNumber)) {
    return "Timestamp must be a Unix timestamp in seconds.";
  }

  if (timestampNumber < MIN_TIMESTAMP) {
    return "Timestamp must be later than May 11, 2016.";
  }

  const bounds = searchParams.get("bounds")?.trim();

  if (bounds) {
    const boundsError = validateBounds(bounds);
    if (boundsError) return boundsError;
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

function validateBounds(bounds: string) {
  const values = splitCommaList(bounds).map(Number);

  if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) {
    return "Bounds must include north, south, west, and east as comma-separated numbers.";
  }

  const [north, south, west, east] = values;

  if (north < -90 || north > 90 || south < -90 || south > 90) {
    return "Bounds latitude values must be between -90 and 90.";
  }

  if (west < -180 || west > 180 || east < -180 || east > 180) {
    return "Bounds longitude values must be between -180 and 180.";
  }

  if (north <= south) {
    return "Bounds north latitude must be greater than south latitude.";
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

function normalizeParam(key: string, value: string) {
  return key === "timestamp" || key === "gspeed"
    ? value
    : splitCommaList(value).join(",");
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ");
}
